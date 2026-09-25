import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:sensors_plus/sensors_plus.dart';

import 'api.dart';

void showError(BuildContext context, Object error) {
  if (!context.mounted) return;
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(error.toString()), backgroundColor: Colors.red.shade700),
  );
}

void showSuccess(BuildContext context, String message) {
  if (!context.mounted) return;
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
}

class AuthScreen extends StatefulWidget {
  final ApiClient api;
  final Future<void> Function() onSignedIn;
  const AuthScreen({super.key, required this.api, required this.onSignedIn});
  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final form = GlobalKey<FormState>();
  final name = TextEditingController();
  final email = TextEditingController();
  final phone = TextEditingController();
  final password = TextEditingController();
  final server = TextEditingController();
  bool register = false;
  bool busy = false;
  String role = 'family';
  String? certificatePath;
  String? licensePath;

  Future<void> pickDocument(bool certificate) async {
    try {
      final result = await FilePicker.pickFile(type: FileType.custom, allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png']);
      final path = result?.path;
      if (path != null) setState(() { if (certificate) { certificatePath = path; } else { licensePath = path; } });
    } catch (e) { if (mounted) showError(context, e); }
  }

  @override
  void initState() {
    super.initState();
    server.text = widget.api.baseUrl;
  }

  @override
  void dispose() {
    for (final c in [name, email, phone, password, server]) { c.dispose(); }
    super.dispose();
  }

  Future<void> submit() async {
    if (!form.currentState!.validate()) return;
    if (register && role == 'doctor' && (certificatePath == null || licensePath == null)) {
      showError(context, 'Select both verification documents.');
      return;
    }
    setState(() => busy = true);
    try {
      await widget.api.setBaseUrl(server.text);
      if (register) {
        final registration = await widget.api.post(role == 'doctor' ? '/doctor/register' : '/auth/register', {
          'full_name': name.text.trim(), 'email': email.text.trim(),
          'phone': phone.text.trim(), 'password': password.text, 'role': role,
        });
        if (role == 'doctor') {
          try {
            await widget.api.uploadDoctorDocuments(asMap(registration)['doctor_id'] as int, certificatePath!, licensePath!);
          } catch (e) {
            if (mounted) showError(context, 'Account created. Upload documents from the doctor workspace: $e');
          }
        }
      }
      final result = asMap(await widget.api.post('/auth/login', {
        'email': email.text.trim(), 'password': password.text,
      }));
      await widget.api.setToken(result['access_token'].toString());
      await widget.onSignedIn();
    } catch (e) {
      if (mounted) showError(context, e);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 440),
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Form(
                      key: form,
                      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                        const Icon(Icons.favorite_rounded, color: Color(0xFF7150D8), size: 56),
                        const SizedBox(height: 10),
                        Text('ElderlyCare', textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text(register ? 'Create your account' : 'Welcome back', textAlign: TextAlign.center),
                        const SizedBox(height: 24),
                        if (register) ...[
                          TextFormField(controller: name, decoration: const InputDecoration(labelText: 'Full name'), validator: requiredText),
                          const SizedBox(height: 12),
                          TextFormField(controller: phone, decoration: const InputDecoration(labelText: 'Phone'), keyboardType: TextInputType.phone, validator: requiredText),
                          const SizedBox(height: 12),
                          DropdownButtonFormField<String>(initialValue: role, decoration: const InputDecoration(labelText: 'Role'), items: const [
                            DropdownMenuItem(value: 'family', child: Text('Family')),
                            DropdownMenuItem(value: 'caregiver', child: Text('Caregiver')),
                            DropdownMenuItem(value: 'doctor', child: Text('Doctor')),
                          ], onChanged: (v) => setState(() => role = v ?? 'family')),
                          const SizedBox(height: 12),
                          if (role == 'doctor') ...[
                            OutlinedButton.icon(onPressed: () => pickDocument(true), icon: const Icon(Icons.upload_file), label: Text(certificatePath == null ? 'Select medical certificate' : 'Medical certificate selected')),
                            OutlinedButton.icon(onPressed: () => pickDocument(false), icon: const Icon(Icons.upload_file), label: Text(licensePath == null ? 'Select clinic license' : 'Clinic license selected')),
                            const SizedBox(height: 12),
                          ],
                        ],
                        TextFormField(controller: email, decoration: const InputDecoration(labelText: 'Email'), keyboardType: TextInputType.emailAddress, validator: requiredText),
                        const SizedBox(height: 12),
                        TextFormField(controller: password, decoration: const InputDecoration(labelText: 'Password'), obscureText: true, validator: requiredText),
                        const SizedBox(height: 16),
                        FilledButton(onPressed: busy ? null : submit, child: Padding(padding: const EdgeInsets.all(12), child: Text(busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'))),
                        TextButton(onPressed: busy ? null : () => setState(() => register = !register), child: Text(register ? 'Already have an account? Sign in' : 'Create an account')),
                        ExpansionTile(title: const Text('Server settings'), children: [
                          TextFormField(controller: server, decoration: const InputDecoration(labelText: 'FastAPI base URL', helperText: 'Emulator: http://10.0.2.2:8000\nPhysical device: use your computer LAN IP'), keyboardType: TextInputType.url),
                        ]),
                        const SizedBox(height: 8),
                        if (register && role == 'doctor') const Text('Doctor registration remains pending until verification is approved.', style: TextStyle(fontSize: 12, color: Colors.black54)),
                      ]),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
}

String? requiredText(String? value) => value == null || value.trim().isEmpty ? 'Required' : null;

class HomeScreen extends StatefulWidget {
  final ApiClient api;
  final Map<String, dynamic> user;
  final Future<void> Function() onSignOut;
  const HomeScreen({super.key, required this.api, required this.user, required this.onSignOut});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int tab = 0;
  int revision = 0;
  Map<String, dynamic>? patient;
  bool loading = true;
  String? error;

  bool get family => widget.user['role'] == 'family';
  bool get caregiver => widget.user['role'] == 'caregiver';
  bool get doctor => widget.user['role'] == 'doctor';

  @override
  void initState() { super.initState(); refresh(); }

  Future<void> refresh() async {
    setState(() { loading = true; error = null; });
    try {
      dynamic data;
      if (family) data = await widget.api.get('/patient/me');
      if (caregiver) {
        final patients = asList(await widget.api.get('/caregiver/patients'));
        data = patients.isEmpty ? null : patients.first;
      }
      if (doctor) data = await widget.api.get('/doctor/patient');
      patient = data == null ? null : asMap(data);
    } catch (e) { error = e.toString(); }
    if (mounted) setState(() { loading = false; revision++; });
  }

  @override
  Widget build(BuildContext context) {
    final tabs = doctor
        ? const [('Overview', Icons.dashboard_outlined), ('Patient', Icons.person_outline), ('Health', Icons.favorite_outline), ('Medication', Icons.medication_outlined), ('Visits', Icons.calendar_month_outlined)]
        : const [('Overview', Icons.dashboard_outlined), ('Patient', Icons.person_outline), ('Health', Icons.favorite_outline), ('Medication', Icons.medication_outlined), ('Alerts', Icons.notifications_outlined), ('Care team', Icons.groups_outlined), ('Sensors', Icons.sensors_outlined)];
    return Scaffold(
      appBar: AppBar(title: Text('ElderlyCare · ${display(widget.user['role'])}'), actions: [
        IconButton(tooltip: 'Refresh', onPressed: refresh, icon: const Icon(Icons.refresh)),
        PopupMenuButton<String>(onSelected: (v) { if (v == 'logout') widget.onSignOut(); }, itemBuilder: (_) => [
          PopupMenuItem(value: 'logout', child: Text('Sign out · ${display(widget.user['full_name'])}')),
        ]),
      ]),
      drawer: patient == null ? null : Drawer(child: SafeArea(child: ListView(children: [
        const ListTile(title: Text('ElderlyCare', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold))),
        for (var i = 0; i < tabs.length; i++) ListTile(
          leading: Icon(tabs[i].$2), title: Text(tabs[i].$1), selected: tab == i,
          onTap: () { Navigator.pop(context); setState(() => tab = i); },
        ),
      ]))),
      body: loading ? const Center(child: CircularProgressIndicator())
        : error != null ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [Text(error!), TextButton(onPressed: refresh, child: const Text('Retry'))]))
        : patient == null && family ? PatientForm(api: widget.api, onSaved: refresh)
        : patient == null ? doctor
            ? VisitsPage(api: widget.api, patient: const {}, role: 'doctor')
            : const Center(child: Text('No patient assigned yet.'))
        : IndexedStack(key: ValueKey(revision), index: tab, children: doctor
            ? [OverviewPage(api: widget.api, patient: patient!, role: 'doctor'), PatientPage(api: widget.api, patient: patient!, role: 'doctor', onChanged: refresh), HealthPage(api: widget.api, patient: patient!, role: 'doctor'), MedicationPage(api: widget.api, patient: patient!, role: 'doctor'), VisitsPage(api: widget.api, patient: patient!, role: 'doctor')]
            : [OverviewPage(api: widget.api, patient: patient!, role: family ? 'family' : 'caregiver'), PatientPage(api: widget.api, patient: patient!, role: family ? 'family' : 'caregiver', onChanged: refresh), HealthPage(api: widget.api, patient: patient!, role: family ? 'family' : 'caregiver'), MedicationPage(api: widget.api, patient: patient!, role: family ? 'family' : 'caregiver'), AlertsPage(api: widget.api, patient: patient!, role: family ? 'family' : 'caregiver'), CareTeamPage(api: widget.api, patient: patient!, role: family ? 'family' : 'caregiver'), tab == 6 ? SensorPage(api: widget.api, patientId: patient!['id'] as int) : const SizedBox.shrink()]),
      bottomNavigationBar: patient == null ? null : SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: SizedBox(width: tabs.length * 88.0, child: NavigationBar(
          selectedIndex: tab,
          onDestinationSelected: (i) => setState(() => tab = i),
          destinations: [for (final item in tabs) NavigationDestination(icon: Icon(item.$2), label: item.$1)],
        )),
      ),
    );
  }
}

Widget pageBody(List<Widget> children) => ListView(padding: const EdgeInsets.all(16), children: [
  ConstrainedBox(constraints: const BoxConstraints(maxWidth: 800), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: children)),
]);

Widget infoCard(String title, List<Widget> children) => Card(child: Padding(
  padding: const EdgeInsets.all(16),
  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)), const SizedBox(height: 12), ...children]),
));

Widget detail(String label, dynamic value) => Padding(padding: const EdgeInsets.symmetric(vertical: 4), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
  SizedBox(width: 140, child: Text(label, style: const TextStyle(color: Colors.black54))),
  Expanded(child: Text(display(value))),
]));

class OverviewPage extends StatefulWidget {
  final ApiClient api;
  final Map<String, dynamic> patient;
  final String role;
  const OverviewPage({super.key, required this.api, required this.patient, required this.role});
  @override
  State<OverviewPage> createState() => _OverviewPageState();
}

class _OverviewPageState extends State<OverviewPage> {
  Map<String, dynamic>? vitals;
  Map<String, dynamic>? prediction;
  bool loading = true;
  @override
  void initState() { super.initState(); load(); }
  Future<void> load() async {
    setState(() => loading = true);
    final id = widget.patient['id'];
    try {
      final path = widget.role == 'family' ? '/vitals/me' : widget.role == 'caregiver' ? '/vitals/caregiver/patient/$id/latest' : '/vitals/doctor/patient/$id/history';
      final result = await widget.api.get(path);
      vitals = result is List ? (asList(result).isEmpty ? null : asList(result).first) : result == null ? null : asMap(result);
    } catch (_) { vitals = null; }
    if (widget.role != 'doctor') {
      try { prediction = asMap(await widget.api.get('/ai/latest/$id')); } catch (_) { prediction = null; }
    }
    if (mounted) setState(() => loading = false);
  }
  @override
  Widget build(BuildContext context) => loading ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(
    onRefresh: load,
    child: pageBody([
      Text('Hello, ${display(widget.patient['full_name'])}', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
      const SizedBox(height: 4),
      Text('Patient overview · ${widget.role}', style: const TextStyle(color: Colors.black54)),
      const SizedBox(height: 16),
      infoCard('Latest vitals', vitals == null ? [const Text('No vital readings yet.')] : [
        detail('Heart rate', '${display(vitals!['heart_rate'])} bpm'),
        detail('Blood pressure', '${display(vitals!['systolic_bp'])}/${display(vitals!['diastolic_bp'])} mmHg'),
        detail('SpO₂', '${display(vitals!['spo2'])}%'),
        detail('Temperature', '${display(vitals!['temperature'])} °C'),
        detail('Respiration', '${display(vitals!['respiratory_rate'])}/min'),
        detail('Recorded', vitals!['created_at']),
      ]),
      infoCard('Health assessment', prediction == null ? [const Text('No AI assessment available yet.')] : [
        detail('Health score', prediction!['overall_health_score']),
        detail('Risk', prediction!['health_risk']),
        detail('Clinical event', prediction!['clinical_event']),
        detail('Alert level', prediction!['alert_level']),
        Text(display(prediction!['ai_summary'], display(prediction!['alert_message']))),
      ]),
      if (widget.role == 'family') FilledButton.icon(onPressed: () async {
        try { await widget.api.post('/ai/predict/${widget.patient['id']}'); await load(); if (context.mounted) showSuccess(context, 'Assessment updated'); }
        catch (e) { if (context.mounted) showError(context, e); }
      }, icon: const Icon(Icons.auto_awesome), label: const Text('Run health assessment')),
      const SizedBox(height: 10),
      const Text('AI results support care decisions and are not a diagnosis.', style: TextStyle(color: Colors.black54, fontSize: 12)),
    ]),
  );
}

class PatientPage extends StatelessWidget {
  final ApiClient api;
  final Map<String, dynamic> patient;
  final String role;
  final VoidCallback onChanged;
  const PatientPage({super.key, required this.api, required this.patient, required this.role, required this.onChanged});
  @override
  Widget build(BuildContext context) => pageBody([
    Text('Patient profile', style: Theme.of(context).textTheme.headlineSmall),
    infoCard('Personal details', [
      detail('Name', patient['full_name']), detail('Age', patient['age']), detail('Gender', patient['gender']),
      detail('Blood group', patient['blood_group']), detail('Phone', patient['phone']), detail('Address', patient['address']),
      detail('Height', patient['height_cm']), detail('Weight', patient['weight_kg']),
    ]),
    infoCard('Medical details', [
      detail('Conditions', patient['medical_conditions']), detail('Allergies', patient['allergies']),
      detail('Medications', patient['medications']), detail('Mobility', patient['mobility']),
      detail('Notes', patient['notes']),
    ]),
    infoCard('Emergency contact', [
      detail('Name', patient['emergency_contact_name']), detail('Phone', patient['emergency_contact_phone']),
      detail('Relationship', patient['relationship']),
    ]),
    if (role == 'family') FilledButton.icon(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => Scaffold(
      appBar: AppBar(title: const Text('Edit patient')),
      body: PatientForm(api: api, existing: patient, onSaved: () { Navigator.pop(context); onChanged(); }),
    ))), icon: const Icon(Icons.edit), label: const Text('Edit profile')),
    if (role == 'doctor') ...[
      const SizedBox(height: 12),
      FilledButton.icon(onPressed: () async {
        final value = await textPrompt(context, 'Doctor notes', initial: display(patient['notes'], ''));
        if (value == null) return;
        try { await api.patch('/doctor/patient/notes', {'notes': value}); onChanged(); if (context.mounted) showSuccess(context, 'Notes saved'); }
        catch (e) { if (context.mounted) showError(context, e); }
      }, icon: const Icon(Icons.note_add_outlined), label: const Text('Update notes')),
    ],
  ]);
}

Future<String?> textPrompt(BuildContext context, String title, {String initial = ''}) async {
  final controller = TextEditingController(text: initial);
  final result = await showDialog<String>(context: context, builder: (dialogContext) => AlertDialog(
    title: Text(title), content: TextField(controller: controller, maxLines: 4, autofocus: true),
    actions: [TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Cancel')),
      FilledButton(onPressed: () => Navigator.pop(dialogContext, controller.text.trim()), child: const Text('Save'))],
  ));
  controller.dispose();
  return result;
}

class PatientForm extends StatefulWidget {
  final ApiClient api;
  final Map<String, dynamic>? existing;
  final VoidCallback onSaved;
  const PatientForm({super.key, required this.api, this.existing, required this.onSaved});
  @override
  State<PatientForm> createState() => _PatientFormState();
}

class _PatientFormState extends State<PatientForm> {
  final form = GlobalKey<FormState>();
  final fields = <String, TextEditingController>{};
  bool busy = false;
  static const labels = <String, String>{
    'full_name': 'Full name', 'age': 'Age', 'gender': 'Gender', 'blood_group': 'Blood group',
    'ethnicity': 'Ethnicity',
    'phone': 'Phone', 'address': 'Address', 'height_cm': 'Height (cm)', 'weight_kg': 'Weight (kg)',
    'bmi': 'BMI',
    'medical_conditions': 'Medical conditions', 'allergies': 'Allergies', 'medications': 'Current medications',
    'mobility': 'Mobility', 'memory_status': 'Memory status', 'smoking': 'Smoking', 'alcohol': 'Alcohol',
    'exercise_level': 'Exercise level', 'diet_quality': 'Diet quality', 'water_intake_liters': 'Water intake (L)',
    'medication_adherence': 'Medication adherence',
    'baseline_heart_rate': 'Baseline heart rate', 'baseline_systolic_bp': 'Baseline systolic BP',
    'baseline_diastolic_bp': 'Baseline diastolic BP', 'baseline_spo2': 'Baseline SpO₂',
    'baseline_temperature': 'Baseline temperature', 'baseline_respiratory_rate': 'Baseline respiratory rate',
    'emergency_contact_name': 'Emergency contact name', 'emergency_contact_phone': 'Emergency contact phone',
    'relationship': 'Emergency contact relationship', 'secondary_contact': 'Secondary contact',
    'assigned_doctor': 'Doctor name', 'assigned_caregiver': 'Caregiver name',
    'hospital': 'Hospital', 'doctor_phone': 'Doctor phone', 'notes': 'Notes',
  };
  static const requiredFields = {'full_name', 'age', 'gender', 'blood_group', 'phone', 'address'};
  static const numericFields = {'age', 'height_cm', 'weight_kg', 'bmi', 'water_intake_liters',
    'baseline_heart_rate', 'baseline_systolic_bp', 'baseline_diastolic_bp', 'baseline_spo2',
    'baseline_temperature', 'baseline_respiratory_rate'};
  @override
  void initState() {
    super.initState();
    for (final key in labels.keys) { fields[key] = TextEditingController(text: widget.existing?[key]?.toString() ?? ''); }
  }
  @override
  void dispose() { for (final c in fields.values) { c.dispose(); } super.dispose(); }
  Future<void> save() async {
    if (!form.currentState!.validate()) return;
    setState(() => busy = true);
    final body = <String, dynamic>{};
    for (final entry in fields.entries) {
      final text = entry.value.text.trim();
      body[entry.key] = text.isEmpty ? null : numericFields.contains(entry.key) ? num.tryParse(text) : text;
    }
    // PUT expects all required fields; optional values absent from the editor retain their old values.
    if (widget.existing != null) {
      for (final entry in widget.existing!.entries) {
        body.putIfAbsent(entry.key, () => entry.value);
      }
    }
    try {
      await widget.api.request(widget.existing == null ? 'POST' : 'PUT', widget.existing == null ? '/patient/create' : '/patient/update', body);
      widget.onSaved();
    } catch (e) { if (mounted) showError(context, e); }
    finally { if (mounted) setState(() => busy = false); }
  }
  @override
  Widget build(BuildContext context) => pageBody([
    Text(widget.existing == null ? 'Set up patient' : 'Edit patient', style: Theme.of(context).textTheme.headlineSmall),
    const SizedBox(height: 8),
    const Text('Enter the patient details used by the care team and health assessment.'),
    const SizedBox(height: 12),
    Form(key: form, child: Column(children: [
      for (final entry in labels.entries) Padding(padding: const EdgeInsets.only(bottom: 12), child: TextFormField(
        controller: fields[entry.key], decoration: InputDecoration(labelText: entry.value),
        keyboardType: numericFields.contains(entry.key) ? TextInputType.number : TextInputType.text,
        validator: requiredFields.contains(entry.key) ? requiredText : null,
      )),
    ])),
    FilledButton(onPressed: busy ? null : save, child: Text(busy ? 'Saving…' : 'Save patient')),
  ]);
}

class HealthPage extends StatefulWidget {
  final ApiClient api;
  final Map<String, dynamic> patient;
  final String role;
  const HealthPage({super.key, required this.api, required this.patient, required this.role});
  @override
  State<HealthPage> createState() => _HealthPageState();
}

class _HealthPageState extends State<HealthPage> {
  Map<String, dynamic>? vital;
  Map<String, dynamic>? prediction;
  List<Map<String, dynamic>> history = [];
  bool loading = true;
  @override
  void initState() { super.initState(); load(); }
  Future<void> load() async {
    setState(() => loading = true);
    final id = widget.patient['id'];
    try {
      if (widget.role == 'doctor') {
        history = asList(await widget.api.get('/vitals/doctor/patient/$id/history'));
        vital = history.isEmpty ? null : history.first;
      } else {
        final path = widget.role == 'family' ? '/vitals/me' : '/vitals/caregiver/patient/$id/latest';
        final data = await widget.api.get(path);
        vital = data == null ? null : asMap(data);
        final result = asMap(await widget.api.get('/ai/history/$id'));
        history = asList(result['history']);
      }
    } catch (e) { if (mounted) showError(context, e); }
    if (widget.role != 'doctor') {
      try { prediction = asMap(await widget.api.get('/ai/latest/$id')); } catch (_) { prediction = null; }
    }
    if (mounted) setState(() => loading = false);
  }
  @override
  Widget build(BuildContext context) => loading ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(onRefresh: load, child: pageBody([
    Text('Health', style: Theme.of(context).textTheme.headlineSmall),
    infoCard('Latest reading', vital == null ? [const Text('No readings yet.')] : [
      detail('Heart rate', vital!['heart_rate']), detail('Systolic BP', vital!['systolic_bp']), detail('Diastolic BP', vital!['diastolic_bp']),
      detail('SpO₂', vital!['spo2']), detail('Temperature', vital!['temperature']), detail('Respiration', vital!['respiratory_rate']),
      detail('Sleep', vital!['sleep_hours']), detail('Steps', vital!['activity_steps']), detail('Recorded', vital!['created_at']),
    ]),
    if (widget.role == 'family') FilledButton.icon(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => VitalForm(api: widget.api, patientId: widget.patient['id'] as int, onSaved: () { Navigator.pop(context); load(); }))), icon: const Icon(Icons.add), label: const Text('Record vitals')),
    if (widget.role == 'doctor') OutlinedButton(onPressed: () async {
      final systolic = await textPrompt(context, 'Systolic blood pressure');
      if (systolic == null) return;
      if (!context.mounted) return;
      final diastolic = await textPrompt(context, 'Diastolic blood pressure');
      if (diastolic == null) return;
      try { await widget.api.post('/doctor/patient/blood-pressure', {'systolic_bp': double.parse(systolic), 'diastolic_bp': double.parse(diastolic)}); await load(); }
      catch (e) { if (context.mounted) showError(context, e); }
    }, child: const Text('Record blood pressure')),
    if (prediction != null) infoCard('AI assessment', [
      detail('Health risk', prediction!['health_risk']), detail('Confidence', prediction!['health_confidence']),
      detail('Clinical event', prediction!['clinical_event']), detail('Alert level', prediction!['alert_level']),
      detail('Health score', prediction!['overall_health_score']),
      Text(display(prediction!['ai_summary'], display(prediction!['alert_message']))),
      const SizedBox(height: 10),
      for (final item in (prediction!['recommendations'] is List ? prediction!['recommendations'] as List : []))
        Padding(padding: const EdgeInsets.symmetric(vertical: 3), child: Text('• ${display(item)}')),
    ]),
    if (prediction?['rag_explanation'] is Map) infoCard('Clinical context', [
      Text(display(asMap(prediction!['rag_explanation'])['summary'])),
      const SizedBox(height: 8),
      for (final factor in (asMap(prediction!['rag_explanation'])['key_factors'] is List
          ? asMap(prediction!['rag_explanation'])['key_factors'] as List : []))
        Text('• ${display(factor)}'),
      const SizedBox(height: 8),
      for (final guidance in (asMap(prediction!['rag_explanation'])['caregiver_guidance'] is List
          ? asMap(prediction!['rag_explanation'])['caregiver_guidance'] as List : []))
        Text('• ${display(guidance)}'),
      Text(display(asMap(prediction!['rag_explanation'])['disclaimer'], ''), style: const TextStyle(fontSize: 12, color: Colors.black54)),
    ]),
    infoCard(widget.role == 'doctor' ? 'Vital history' : 'Assessment history', history.isEmpty ? [const Text('No history yet.')] : [
      for (final item in history.take(20)) ListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(widget.role == 'doctor' ? 'Heart rate: ${display(item['heart_rate'])} · SpO₂: ${display(item['spo2'])}' : '${display(item['health_risk'])} · ${display(item['clinical_event'])}'),
        subtitle: Text(display(item['created_at'])),
      ),
    ]),
  ]));
}

class VitalForm extends StatefulWidget {
  final ApiClient api;
  final int patientId;
  final VoidCallback onSaved;
  const VitalForm({super.key, required this.api, required this.patientId, required this.onSaved});
  @override
  State<VitalForm> createState() => _VitalFormState();
}

class _VitalFormState extends State<VitalForm> {
  final form = GlobalKey<FormState>();
  final values = <String, TextEditingController>{};
  bool busy = false;
  static const labels = {'heart_rate': 'Heart rate (bpm)', 'systolic_bp': 'Systolic BP (mmHg)', 'diastolic_bp': 'Diastolic BP (mmHg)', 'spo2': 'SpO₂ (%)', 'temperature': 'Temperature (°C)', 'respiratory_rate': 'Respiratory rate (/min)', 'sleep_hours': 'Sleep (hours)', 'activity_steps': 'Steps'};
  @override
  void initState() { super.initState(); for (final key in labels.keys) { values[key] = TextEditingController(); } }
  @override
  void dispose() { for (final c in values.values) { c.dispose(); } super.dispose(); }
  Future<void> save() async {
    if (!form.currentState!.validate()) return;
    setState(() => busy = true);
    try {
      final data = <String, dynamic>{};
      for (final entry in values.entries) { data[entry.key] = entry.key == 'activity_steps' ? int.parse(entry.value.text) : double.parse(entry.value.text); }
      await widget.api.post('/vitals/${widget.patientId}', data);
      widget.onSaved();
    } catch (e) { if (mounted) showError(context, e); }
    finally { if (mounted) setState(() => busy = false); }
  }
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Record vitals')), body: pageBody([
    Form(key: form, child: Column(children: [for (final entry in labels.entries) Padding(padding: const EdgeInsets.only(bottom: 12), child: TextFormField(
      controller: values[entry.key], decoration: InputDecoration(labelText: entry.value), keyboardType: const TextInputType.numberWithOptions(decimal: true),
      validator: (v) => num.tryParse(v ?? '') == null ? 'Enter a number' : null,
    ))])),
    FilledButton(onPressed: busy ? null : save, child: Text(busy ? 'Saving…' : 'Save reading')),
  ]));
}

class MedicationPage extends StatefulWidget {
  final ApiClient api;
  final Map<String, dynamic> patient;
  final String role;
  const MedicationPage({super.key, required this.api, required this.patient, required this.role});
  @override
  State<MedicationPage> createState() => _MedicationPageState();
}

class _MedicationPageState extends State<MedicationPage> {
  List<Map<String, dynamic>> items = [];
  bool loading = true;
  @override
  void initState() { super.initState(); load(); }
  Future<void> load() async {
    setState(() => loading = true);
    try {
      final id = widget.patient['id'];
      final path = widget.role == 'family' ? '/medications/me' : widget.role == 'caregiver' ? '/medications/caregiver' : '/medications/doctor/patient/$id';
      items = asList(await widget.api.get(path));
    } catch (e) { if (mounted) showError(context, e); }
    if (mounted) setState(() => loading = false);
  }
  @override
  Widget build(BuildContext context) => loading ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(onRefresh: load, child: pageBody([
    Text('Medication', style: Theme.of(context).textTheme.headlineSmall),
    if (widget.role == 'doctor') FilledButton.icon(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MedicationForm(api: widget.api, patientId: widget.patient['id'] as int, onSaved: () { Navigator.pop(context); load(); }))), icon: const Icon(Icons.add), label: const Text('Prescribe medication')),
    if (items.isEmpty) infoCard('Medication', [const Text('No medication records yet.')]),
    for (final item in items) Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(display(item['medicine_name']), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
      detail('Dosage', item['dosage']), detail('Reminder', item['reminder_time']),
      detail('Schedule', ['morning', 'afternoon', 'evening', 'night'].where((part) => item[part] == true).join(', ')),
      detail('Food', item['before_food'] == true ? 'Before food' : 'After food / unspecified'),
      if (widget.role != 'doctor') detail('Today', item['status']),
      if (widget.role == 'caregiver' && item['status'] != 'taken') FilledButton(onPressed: () async {
        try { await widget.api.post('/medications/${item['id']}/given'); await load(); if (context.mounted) showSuccess(context, 'Marked as given'); }
        catch (e) { if (context.mounted) showError(context, e); }
      }, child: const Text('Mark as given')),
    ]))),
  ]));
}

class MedicationForm extends StatefulWidget {
  final ApiClient api;
  final int patientId;
  final VoidCallback onSaved;
  const MedicationForm({super.key, required this.api, required this.patientId, required this.onSaved});
  @override
  State<MedicationForm> createState() => _MedicationFormState();
}

class _MedicationFormState extends State<MedicationForm> {
  final form = GlobalKey<FormState>();
  final name = TextEditingController();
  final dose = TextEditingController();
  final reminder = TextEditingController();
  final selected = <String, bool>{'morning': false, 'afternoon': false, 'evening': false, 'night': false, 'before_food': false};
  bool busy = false;
  @override
  void dispose() { name.dispose(); dose.dispose(); reminder.dispose(); super.dispose(); }
  Future<void> save() async {
    if (!form.currentState!.validate()) return;
    setState(() => busy = true);
    try {
      await widget.api.post('/medications/patient/${widget.patientId}', {
        'medicine_name': name.text.trim(), 'dosage': dose.text.trim().isEmpty ? null : dose.text.trim(),
        'reminder_time': reminder.text.trim().isEmpty ? null : reminder.text.trim(), ...selected,
      });
      widget.onSaved();
    } catch (e) { if (mounted) showError(context, e); }
    finally { if (mounted) setState(() => busy = false); }
  }
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Prescribe medication')), body: pageBody([
    Form(key: form, child: Column(children: [
      TextFormField(controller: name, decoration: const InputDecoration(labelText: 'Medicine name'), validator: requiredText),
      const SizedBox(height: 12), TextFormField(controller: dose, decoration: const InputDecoration(labelText: 'Dosage')),
      const SizedBox(height: 12), TextFormField(controller: reminder, decoration: const InputDecoration(labelText: 'Reminder time (HH:MM:SS)')),
    ])),
    for (final key in selected.keys) SwitchListTile(title: Text(key.replaceAll('_', ' ')), value: selected[key]!, onChanged: (v) => setState(() => selected[key] = v)),
    FilledButton(onPressed: busy ? null : save, child: const Text('Save prescription')),
  ]));
}

class AlertsPage extends StatefulWidget {
  final ApiClient api;
  final Map<String, dynamic> patient;
  final String role;
  const AlertsPage({super.key, required this.api, required this.patient, required this.role});
  @override
  State<AlertsPage> createState() => _AlertsPageState();
}

class _AlertsPageState extends State<AlertsPage> {
  List<Map<String, dynamic>> alerts = [];
  bool loading = true;
  @override
  void initState() { super.initState(); load(); }
  Future<void> load() async {
    setState(() => loading = true);
    try { alerts = asList(await widget.api.get('/emergency/patients/${widget.patient['id']}/alerts')); }
    catch (e) { if (mounted) showError(context, e); }
    if (mounted) setState(() => loading = false);
  }
  Future<void> confirm(Map<String, dynamic> alert, bool safe) async {
    try {
      final who = widget.role == 'caregiver' ? 'caregiver' : 'patient';
      await widget.api.patch('/emergency/alerts/${alert['id']}/$who-confirm?is_safe=$safe');
      await load();
    } catch (e) { if (mounted) showError(context, e); }
  }
  @override
  Widget build(BuildContext context) => loading ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(onRefresh: load, child: pageBody([
    Text('Emergency alerts', style: Theme.of(context).textTheme.headlineSmall),
    const Text('For an immediate emergency, call local emergency services.'),
    if (alerts.isEmpty) infoCard('Alerts', [const Text('No emergency alerts recorded.')]),
    for (final alert in alerts) infoCard('${display(alert['event_type'])} · ${display(alert['status'])}', [
      detail('Detected', alert['detected_at']), detail('Notes', alert['notes']),
      detail('Resolution', alert['resolution']),
      Row(children: [TextButton(onPressed: () => confirm(alert, true), child: const Text('Confirm safe')),
        TextButton(onPressed: () => confirm(alert, false), child: const Text('Need help'))]),
    ]),
  ]));
}

class CareTeamPage extends StatefulWidget {
  final ApiClient api;
  final Map<String, dynamic> patient;
  final String role;
  const CareTeamPage({super.key, required this.api, required this.patient, required this.role});
  @override
  State<CareTeamPage> createState() => _CareTeamPageState();
}

class _CareTeamPageState extends State<CareTeamPage> {
  List<Map<String, dynamic>> caregivers = [];
  List<Map<String, dynamic>> doctors = [];
  List<Map<String, dynamic>> consultations = [];
  bool loading = true;
  @override
  void initState() { super.initState(); load(); }
  Future<void> load() async {
    setState(() => loading = true);
    if (widget.role == 'family') {
      try { caregivers = asList(await widget.api.get('/patient/caregivers')); } catch (_) { caregivers = []; }
      try { doctors = asList(await widget.api.get('/doctor/doctors')); } catch (_) { doctors = []; }
      try { consultations = asList(await widget.api.get('/doctor/consultations/my')); } catch (_) { consultations = []; }
    }
    if (mounted) setState(() => loading = false);
  }
  Future<void> book(Map<String, dynamic> doctor) async {
    final date = await showDatePicker(context: context, firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)), initialDate: DateTime.now());
    if (date == null || !mounted) return;
    final time = await showTimePicker(context: context, initialTime: TimeOfDay.now());
    if (time == null || !mounted) return;
    final reason = await textPrompt(context, 'Reason for visit');
    if (reason == null) return;
    final dateText = '${date.year.toString().padLeft(4, '0')}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
    final timeText = '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}:00';
    try {
      await widget.api.post('/doctor/consultations/book', {'patient_id': widget.patient['id'], 'doctor_id': doctor['doctor_id'], 'scheduled_date': dateText, 'scheduled_time': timeText, 'reason': reason});
      await load();
      if (mounted) showSuccess(context, 'Consultation booked');
    } catch (e) { if (mounted) showError(context, e); }
  }
  @override
  Widget build(BuildContext context) => loading ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(onRefresh: load, child: pageBody([
    Text('Care team', style: Theme.of(context).textTheme.headlineSmall),
    infoCard('Assigned care', [detail('Caregiver', widget.patient['assigned_caregiver']), detail('Doctor', widget.patient['assigned_doctor']), detail('Hospital', widget.patient['hospital'])]),
    if (widget.role == 'family') ...[
      infoCard('Available caregivers', caregivers.isEmpty ? [const Text('No available caregivers.')] : [
        for (final person in caregivers) ListTile(title: Text(display(person['full_name'])), subtitle: Text(display(person['phone'])), trailing: TextButton(onPressed: () async {
          try { await widget.api.post('/patient/assign-caregiver?caregiver_id=${person['id']}'); await load(); if (context.mounted) showSuccess(context, 'Caregiver assigned'); }
          catch (e) { if (context.mounted) showError(context, e); }
        }, child: const Text('Assign'))),
      ]),
      infoCard('Verified doctors', doctors.isEmpty ? [const Text('No verified doctors available.')] : [
        for (final doctor in doctors) ListTile(title: Text(display(doctor['full_name'])), subtitle: Text(display(doctor['specialization'])), trailing: TextButton(onPressed: () => book(doctor), child: const Text('Book'))),
      ]),
      infoCard('Consultations', consultations.isEmpty ? [const Text('No consultations booked.')] : [
        for (final visit in consultations) ListTile(title: Text('${display(visit['scheduled_date'])} · ${display(visit['scheduled_time'])}'), subtitle: Text('${display(visit['status'])} · ${display(visit['reason'])}')),
      ]),
    ],
  ]));
}

class VisitsPage extends StatefulWidget {
  final ApiClient api;
  final Map<String, dynamic> patient;
  final String role;
  const VisitsPage({super.key, required this.api, required this.patient, required this.role});
  @override
  State<VisitsPage> createState() => _VisitsPageState();
}

class _VisitsPageState extends State<VisitsPage> {
  List<Map<String, dynamic>> visits = [];
  Map<String, dynamic>? profile;
  Map<String, dynamic>? verification;
  bool loading = true;
  @override
  void initState() { super.initState(); load(); }
  Future<void> load() async {
    setState(() => loading = true);
    try { visits = asList(await widget.api.get('/doctor/consultations')); } catch (e) { if (mounted) showError(context, e); }
    try { profile = asMap(await widget.api.get('/doctor/profile')); } catch (_) { profile = null; }
    try { verification = asMap(await widget.api.get('/doctor/verification-status')); } catch (_) { verification = null; }
    if (mounted) setState(() => loading = false);
  }
  Future<void> uploadDocuments() async {
    try {
      final certificate = await FilePicker.pickFile(type: FileType.custom, allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png']);
      if (certificate?.path == null) return;
      final license = await FilePicker.pickFile(type: FileType.custom, allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png']);
      if (license?.path == null) return;
      await widget.api.uploadDoctorDocuments(verification!['doctor_id'] as int, certificate!.path!, license!.path!);
      await load();
      if (mounted) showSuccess(context, 'Documents uploaded');
    } catch (e) { if (mounted) showError(context, e); }
  }
  Future<void> updateStatus(Map<String, dynamic> visit, String status) async {
    try { await widget.api.patch('/doctor/consultations/${visit['id']}/status', {'status': status}); await load(); }
    catch (e) { if (mounted) showError(context, e); }
  }
  @override
  Widget build(BuildContext context) => loading ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(onRefresh: load, child: pageBody([
    Text('Doctor workspace', style: Theme.of(context).textTheme.headlineSmall),
    infoCard('Profile', [
      detail('Verification', verification?['verification_status'] ?? profile?['verification_status']),
      detail('Medical certificate', verification?['medical_certificate_uploaded'] == true ? 'Uploaded' : 'Missing'),
      detail('Clinic license', verification?['clinic_license_uploaded'] == true ? 'Uploaded' : 'Missing'),
      detail('Specialization', profile?['specialization']),
      detail('Clinic', profile?['clinic_name']),
      OutlinedButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => DoctorProfileForm(api: widget.api, existing: profile, onSaved: () { Navigator.pop(context); load(); }))), child: const Text('Edit doctor profile')),
      if (verification != null) OutlinedButton.icon(onPressed: uploadDocuments, icon: const Icon(Icons.upload_file), label: const Text('Upload verification documents')),
    ]),
    infoCard('Consultations', visits.isEmpty ? [const Text('No consultations scheduled.')] : [
      for (final visit in visits) Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        ListTile(contentPadding: EdgeInsets.zero, title: Text('${display(visit['scheduled_date'])} · ${display(visit['scheduled_time'])}'), subtitle: Text('${display(visit['reason'])} · ${display(visit['status'])}')),
        Wrap(spacing: 8, children: [
          if (visit['status'] == 'scheduled') TextButton(onPressed: () => updateStatus(visit, 'in_progress'), child: const Text('Start')),
          if (visit['status'] == 'in_progress') TextButton(onPressed: () => updateStatus(visit, 'completed'), child: const Text('Complete')),
          TextButton(onPressed: () async {
            final notes = await textPrompt(context, 'Consultation notes', initial: display(visit['consultation_notes'], ''));
            if (notes == null) return;
            try { await widget.api.patch('/doctor/consultations/${visit['id']}/notes', {'consultation_notes': notes}); await load(); }
            catch (e) { if (context.mounted) showError(context, e); }
          }, child: const Text('Notes')),
        ]),
        const Divider(),
      ]),
    ]),
  ]));
}

class DoctorProfileForm extends StatefulWidget {
  final ApiClient api;
  final Map<String, dynamic>? existing;
  final VoidCallback onSaved;
  const DoctorProfileForm({super.key, required this.api, this.existing, required this.onSaved});
  @override
  State<DoctorProfileForm> createState() => _DoctorProfileFormState();
}

class _DoctorProfileFormState extends State<DoctorProfileForm> {
  final fields = <String, TextEditingController>{};
  static const labels = {'specialization': 'Specialization', 'clinic_name': 'Clinic name', 'clinic_address': 'Clinic address', 'experience_years': 'Years of experience', 'bio': 'Biography'};
  @override
  void initState() { super.initState(); for (final key in labels.keys) { fields[key] = TextEditingController(text: widget.existing?[key]?.toString() ?? ''); } }
  @override
  void dispose() { for (final c in fields.values) { c.dispose(); } super.dispose(); }
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Doctor profile')), body: pageBody([
    for (final entry in labels.entries) Padding(padding: const EdgeInsets.only(bottom: 12), child: TextField(controller: fields[entry.key], decoration: InputDecoration(labelText: entry.value))),
    FilledButton(onPressed: () async {
      try {
        final data = <String, dynamic>{};
        for (final entry in fields.entries) { data[entry.key] = entry.key == 'experience_years' ? int.tryParse(entry.value.text) : entry.value.text.trim(); }
        await widget.api.post('/doctor/profile', data);
        widget.onSaved();
      } catch (e) { if (context.mounted) showError(context, e); }
    }, child: const Text('Save profile')),
  ]));
}

class SensorPage extends StatefulWidget {
  final ApiClient api;
  final int patientId;
  const SensorPage({super.key, required this.api, required this.patientId});
  @override
  State<SensorPage> createState() => _SensorPageState();
}

class _SensorPageState extends State<SensorPage> {
  StreamSubscription<AccelerometerEvent>? accelerometer;
  StreamSubscription<GyroscopeEvent>? gyroscope;
  bool monitoring = false;
  bool sending = false;
  double acceleration = 0;
  double rotation = 0;
  String status = 'Monitoring is off';
  DateTime? lastAlert;

  @override
  void dispose() { accelerometer?.cancel(); gyroscope?.cancel(); super.dispose(); }

  void toggleMonitoring() {
    if (monitoring) {
      accelerometer?.cancel(); gyroscope?.cancel();
      setState(() { monitoring = false; status = 'Monitoring is off'; });
      return;
    }
    accelerometer = accelerometerEventStream().listen((sample) {
      final magnitude = math.sqrt(sample.x * sample.x + sample.y * sample.y + sample.z * sample.z);
      if (!mounted) return;
      setState(() => acceleration = magnitude);
      if (magnitude > 20 && (lastAlert == null || DateTime.now().difference(lastAlert!).inSeconds > 15)) {
        lastAlert = DateTime.now();
        sendAlert('FALL');
      }
    }, onError: (Object error) { if (mounted) setState(() => status = 'Motion sensor unavailable: $error'); });
    gyroscope = gyroscopeEventStream().listen((sample) {
      if (!mounted) return;
      setState(() => rotation = math.sqrt(sample.x * sample.x + sample.y * sample.y + sample.z * sample.z));
    });
    setState(() { monitoring = true; status = 'Monitoring while this screen is open'; });
  }

  Future<Position?> currentPosition() async {
    try {
      if (!await Geolocator.isLocationServiceEnabled()) return null;
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) return null;
      return await Geolocator.getCurrentPosition(locationSettings: const LocationSettings(accuracy: LocationAccuracy.medium, timeLimit: Duration(seconds: 8)));
    } catch (_) { return null; }
  }

  Future<void> sendAlert(String eventType) async {
    if (sending) return;
    setState(() { sending = true; status = 'Sending $eventType alert…'; });
    try {
      final position = await currentPosition();
      await widget.api.post('/emergency/alerts', {
        'patient_id': widget.patientId, 'event_type': eventType,
        'latitude': position?.latitude, 'longitude': position?.longitude,
      });
      if (mounted) { setState(() => status = '$eventType alert recorded on server'); showSuccess(context, '$eventType alert recorded on server'); }
    } catch (e) {
      if (mounted) { setState(() => status = '$eventType alert failed'); showError(context, e); }
    } finally { if (mounted) setState(() => sending = false); }
  }

  @override
  Widget build(BuildContext context) => pageBody([
    Text('Motion monitoring', style: Theme.of(context).textTheme.headlineSmall),
    const SizedBox(height: 8),
    const Text('Keep this screen open while monitoring. A strong impact may be treated as a possible fall.'),
    infoCard('Device sensors', [
      detail('Acceleration', '${acceleration.toStringAsFixed(1)} m/s²'),
      detail('Rotation', '${rotation.toStringAsFixed(1)} rad/s'),
      detail('Status', status),
      SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Monitor for falls'), value: monitoring, onChanged: (_) => toggleMonitoring()),
    ]),
    FilledButton.icon(onPressed: sending ? null : () async {
      final confirmed = await showDialog<bool>(context: context, builder: (dialogContext) => AlertDialog(
        title: const Text('Record SOS alert?'), content: const Text('This creates an alert on the server. It does not place an emergency call.'),
        actions: [TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Send SOS'))],
      ));
      if (confirmed == true) sendAlert('SOS');
    }, icon: const Icon(Icons.sos), label: const Text('Record SOS alert')),
    const SizedBox(height: 12),
    const Text('Prototype detection can miss falls or trigger on other movements. For immediate danger, call local emergency services.', style: TextStyle(color: Colors.black54, fontSize: 12)),
  ]);
}
