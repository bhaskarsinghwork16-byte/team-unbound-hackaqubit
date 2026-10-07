import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../utils/app_theme.dart';
import '../widgets/app_text_field.dart';

class PatientInfoScreen extends StatefulWidget {
  final String screeningType;

  const PatientInfoScreen({super.key, required this.screeningType});

  @override
  State<PatientInfoScreen> createState() => _PatientInfoScreenState();
}

class _PatientInfoScreenState extends State<PatientInfoScreen> {
  final _formKey        = GlobalKey<FormState>();
  final _patientIdCtrl  = TextEditingController();
  final _ageCtrl        = TextEditingController();

  String? _selectedSex;
  final List<String> _selectedRisks = [];

  bool get _isEye => widget.screeningType == 'eye';

  // Risk factors relevant to each screening type
  List<String> get _riskFactors => _isEye
      ? ['Diabetes', 'Hypertension', 'Known DR', 'Poor glycemic control']
      : ['Tobacco use', 'Alcohol use', 'Betel nut', 'Previous lesion'];

  @override
  void dispose() {
    _patientIdCtrl.dispose();
    _ageCtrl.dispose();
    super.dispose();
  }

  void _continue() {
    if (!_formKey.currentState!.validate()) return;

    final patientData = {
      'patientId':   _patientIdCtrl.text.trim(),
      'age':         int.tryParse(_ageCtrl.text.trim()),
      'sex':         _selectedSex,
      'riskFactors': _selectedRisks.join(', '),
    };

    Navigator.pushNamed(
      context,
      '/camera',
      arguments: {
        'screeningType': widget.screeningType,
        'patientData':   patientData,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        title: Text(_isEye ? 'Eye Screening' : 'Oral Screening'),
        leading: const BackButton(),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [

                // ── Header ──────────────────────────────────────────────
                _StepIndicator(step: 1, total: 3, label: 'Patient Information')
                    .animate().fadeIn(duration: 400.ms),

                const SizedBox(height: 24),

                _SectionLabel(
                  icon: _isEye
                      ? Icons.visibility_rounded
                      : Icons.sentiment_satisfied_alt_rounded,
                  title: _isEye ? 'Diabetic Retinopathy Screening' : 'Oral Lesion Screening',
                  colors: _isEye ? AppTheme.eyeGradient : AppTheme.oralGradient,
                ).animate().fadeIn(delay: 100.ms),

                const SizedBox(height: 28),

                // ── Patient ID (required) ────────────────────────────────
                Text('Patient Information',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 4),
                Text(
                  'Only essential information is collected. No personal data is sent externally.',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 16),

                AppTextField(
                  id: 'patient_id_field',
                  controller: _patientIdCtrl,
                  label: 'Patient ID *',
                  hint: 'e.g. HSA-001',
                  prefixIcon: Icons.badge_outlined,
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) {
                      return 'Patient ID is required';
                    }
                    return null;
                  },
                ).animate().fadeIn(delay: 200.ms),

                const SizedBox(height: 12),

                // ── Age ──────────────────────────────────────────────────
                AppTextField(
                  id: 'age_field',
                  controller: _ageCtrl,
                  label: 'Age',
                  hint: 'e.g. 45',
                  prefixIcon: Icons.calendar_today_outlined,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  validator: (v) {
                    if (v != null && v.isNotEmpty) {
                      final age = int.tryParse(v);
                      if (age == null || age < 1 || age > 120) {
                        return 'Enter a valid age (1–120)';
                      }
                    }
                    return null;
                  },
                ).animate().fadeIn(delay: 300.ms),

                const SizedBox(height: 12),

                // ── Sex ──────────────────────────────────────────────────
                _SexSelector(
                  selected: _selectedSex,
                  onChanged: (v) => setState(() => _selectedSex = v),
                ).animate().fadeIn(delay: 400.ms),

                const SizedBox(height: 28),

                // ── Risk Factors ─────────────────────────────────────────
                Text(
                  'Relevant Risk Factors (optional)',
                  style: Theme.of(context).textTheme.titleMedium,
                ).animate().fadeIn(delay: 450.ms),
                const SizedBox(height: 4),
                Text(
                  'Select any that apply',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 12),

                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _riskFactors.map((factor) {
                    final selected = _selectedRisks.contains(factor);
                    return FilterChip(
                      label: Text(factor,
                          style: TextStyle(
                            color: selected
                                ? Colors.white
                                : AppTheme.textSecondary,
                            fontWeight: selected
                                ? FontWeight.w600
                                : FontWeight.w400,
                          )),
                      selected: selected,
                      onSelected: (v) => setState(() {
                        if (v) {
                          _selectedRisks.add(factor);
                        } else {
                          _selectedRisks.remove(factor);
                        }
                      }),
                      backgroundColor: AppTheme.cardDark,
                      selectedColor: AppTheme.primary.withOpacity(0.2),
                      checkmarkColor: AppTheme.primary,
                      side: BorderSide(
                        color: selected ? AppTheme.primary : AppTheme.cardBorder,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    );
                  }).toList(),
                ).animate().fadeIn(delay: 500.ms),

                const SizedBox(height: 40),

                // ── Continue button ───────────────────────────────────────
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    key: const Key('continue_to_camera_btn'),
                    onPressed: _continue,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _isEye
                          ? AppTheme.primary
                          : const Color(0xFF7C3AED),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Continue to Camera'),
                        SizedBox(width: 8),
                        Icon(Icons.camera_alt_rounded, size: 18),
                      ],
                    ),
                  ),
                ).animate().fadeIn(delay: 600.ms),

                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Sub-widgets ──────────────────────────────────────────────────────────────

class _StepIndicator extends StatelessWidget {
  final int step;
  final int total;
  final String label;

  const _StepIndicator({required this.step, required this.total, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text('Step $step of $total',
                style: Theme.of(context).textTheme.labelMedium
                    ?.copyWith(color: AppTheme.primary)),
            const Spacer(),
            Text('$label',
                style: Theme.of(context).textTheme.labelMedium),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: step / total,
            backgroundColor: AppTheme.cardBorder,
            valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary),
            minHeight: 4,
          ),
        ),
      ],
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final IconData icon;
  final String title;
  final List<Color> colors;

  const _SectionLabel({required this.icon, required this.title, required this.colors});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [colors[0].withOpacity(0.15), colors[1].withOpacity(0.05)]),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: colors[0].withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, color: colors[1], size: 22),
          const SizedBox(width: 12),
          Text(title,
              style: Theme.of(context).textTheme.titleMedium
                  ?.copyWith(color: colors[1])),
        ],
      ),
    );
  }
}

class _SexSelector extends StatelessWidget {
  final String? selected;
  final ValueChanged<String?> onChanged;

  const _SexSelector({required this.selected, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Sex',
            style: Theme.of(context).textTheme.labelLarge
                ?.copyWith(color: AppTheme.textSecondary)),
        const SizedBox(height: 8),
        Row(
          children: ['Male', 'Female', 'Other'].map((sex) {
            final isSelected = selected == sex;
            return Padding(
              padding: const EdgeInsets.only(right: 10),
              child: GestureDetector(
                onTap: () => onChanged(sex),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppTheme.primary.withOpacity(0.15)
                        : AppTheme.cardDark,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? AppTheme.primary : AppTheme.cardBorder,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Text(sex,
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: isSelected ? AppTheme.primary : AppTheme.textSecondary)),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}
