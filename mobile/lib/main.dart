import 'package:flutter/material.dart';

import 'api.dart';
import 'screens.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ElderlyCareApp());
}

class ElderlyCareApp extends StatefulWidget {
  const ElderlyCareApp({super.key});
  @override
  State<ElderlyCareApp> createState() => _ElderlyCareAppState();
}

class _ElderlyCareAppState extends State<ElderlyCareApp> {
  final api = ApiClient();
  Map<String, dynamic>? user;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _restore();
  }

  Future<void> _restore() async {
    await api.restore();
    if (api.token != null) {
      try {
        user = asMap(await api.get('/auth/me'));
      } catch (_) {
        await api.logout();
      }
    }
    if (mounted) setState(() => loading = false);
  }

  Future<void> _signedIn() async {
    user = asMap(await api.get('/auth/me'));
    if (mounted) setState(() {});
  }

  Future<void> _signOut() async {
    await api.logout();
    if (mounted) setState(() => user = null);
  }

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'ElderlyCare',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF7150D8)),
          scaffoldBackgroundColor: const Color(0xFFF8F6FC),
          inputDecorationTheme: const InputDecorationTheme(
            border: OutlineInputBorder(),
            contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 13),
          ),
          cardTheme: CardThemeData(
            color: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(
              side: const BorderSide(color: Color(0xFFE8E1F3)),
              borderRadius: BorderRadius.circular(18),
            ),
          ),
        ),
        home: loading
            ? const Scaffold(body: Center(child: CircularProgressIndicator()))
            : user == null
                ? AuthScreen(api: api, onSignedIn: _signedIn)
                : HomeScreen(api: api, user: user!, onSignOut: _signOut),
      );
}
