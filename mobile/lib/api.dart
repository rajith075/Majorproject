import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

/// Android emulator: 10.0.2.2 reaches the host computer.
/// Override with --dart-define=API_BASE_URL=https://your-server.example.
const defaultApiUrl = 'http://10.0.2.2:8000';
const configuredApiUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: defaultApiUrl,
);

class ApiException implements Exception {
  final int status;
  final String message;
  ApiException(this.status, this.message);
  @override
  String toString() => message;
}

class ApiClient {
  final _storage = const FlutterSecureStorage();
  String? token;
  String baseUrl = configuredApiUrl;

  Future<void> restore() async {
    token = await _storage.read(key: 'access_token');
    baseUrl = await _storage.read(key: 'api_base_url') ?? configuredApiUrl;
  }

  Future<void> setBaseUrl(String value) async {
    baseUrl = value.trim().replaceAll(RegExp(r'/+$'), '');
    await _storage.write(key: 'api_base_url', value: baseUrl);
  }

  Future<void> setToken(String value) async {
    token = value;
    await _storage.write(key: 'access_token', value: value);
  }

  Future<void> logout() async {
    token = null;
    await _storage.delete(key: 'access_token');
  }

  Future<dynamic> get(String path) => request('GET', path);
  Future<dynamic> post(String path, [Object? body]) => request('POST', path, body);
  Future<dynamic> put(String path, [Object? body]) => request('PUT', path, body);
  Future<dynamic> patch(String path, [Object? body]) => request('PATCH', path, body);

  Future<dynamic> request(String method, String path, [Object? body]) async {
    final uri = Uri.parse('$baseUrl$path');
    if (kReleaseMode && uri.scheme != 'https') {
      throw ApiException(0, 'Release builds require an HTTPS API address.');
    }
    final req = http.Request(method, uri);
    req.headers['Accept'] = 'application/json';
    if (token != null) req.headers['Authorization'] = 'Bearer $token';
    if (body != null) {
      req.headers['Content-Type'] = 'application/json';
      req.body = jsonEncode(body);
    }
    http.Response response;
    try {
      response = await http.Response.fromStream(
        await req.send().timeout(const Duration(seconds: 25)),
      );
    } catch (_) {
      throw ApiException(0, 'Cannot reach the server at $baseUrl. Check the API address and network.');
    }
    dynamic data;
    try {
      data = response.body.isEmpty ? null : jsonDecode(response.body);
    } catch (_) {
      data = response.body;
    }
    if (response.statusCode >= 400) {
      final detail = data is Map ? data['detail'] : null;
      final message = detail is String
          ? detail
          : detail is List
              ? detail.map((e) => e is Map ? e['msg'] : e).join('; ')
              : 'Request failed (${response.statusCode})';
      throw ApiException(response.statusCode, message);
    }
    return data;
  }

  Future<dynamic> uploadDoctorDocuments(int doctorId, String certificatePath, String licensePath) async {
    if (kReleaseMode && !baseUrl.startsWith('https://')) {
      throw ApiException(0, 'Release builds require an HTTPS API address.');
    }
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl/doctor/$doctorId/documents'));
    request.files.add(await http.MultipartFile.fromPath('medical_certificate', certificatePath));
    request.files.add(await http.MultipartFile.fromPath('clinic_license', licensePath));
    final response = await http.Response.fromStream(await request.send().timeout(const Duration(seconds: 40)));
    final data = jsonDecode(response.body);
    if (response.statusCode >= 400) {
      throw ApiException(response.statusCode, display(data is Map ? data['detail'] : data, 'Document upload failed'));
    }
    return data;
  }
}

Map<String, dynamic> asMap(dynamic value) =>
    value is Map ? Map<String, dynamic>.from(value) : <String, dynamic>{};

List<Map<String, dynamic>> asList(dynamic value) => value is List
    ? value.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList()
    : <Map<String, dynamic>>[];

String display(dynamic value, [String fallback = '—']) {
  if (value == null || value.toString().trim().isEmpty) return fallback;
  return value.toString();
}
