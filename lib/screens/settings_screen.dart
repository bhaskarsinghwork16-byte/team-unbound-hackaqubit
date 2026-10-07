import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../utils/app_theme.dart';
import '../inference/screening_model.dart';
import '../database/database_service.dart';
import '../services/demo_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  double _threshold = InferenceConfig.confidenceThreshold;

  Future<void> _launchDemo(DemoScenario scenario) async {
    // Generate sample image for demo
    final imagePath = await DemoService.generateDemoImage(scenario);

    if (!mounted) return;

    if (scenario.simulatePoorQuality) {
      // Goes straight to image quality check
      Navigator.pushNamed(
        context,
        '/image-quality',
        arguments: {
          'imagePath': imagePath,
          'screeningType': scenario.screeningType,
          'patientData': {
            'patientId': 'DEMO-POOR-02',
            'age': 52,
            'sex': 'Female',
            'riskFactors': 'Poor lighting test',
          },
        },
      );
    } else {
      // Direct to processing or quality check
      Navigator.pushNamed(
        context,
        '/image-quality',
        arguments: {
          'imagePath': imagePath,
          'screeningType': scenario.screeningType,
          'patientData': {
            'patientId': 'DEMO-JUDGE-${scenario.id}',
            'age': 58,
            'sex': 'Male',
            'riskFactors': scenario.screeningType == 'eye' ? 'Diabetes' : 'Tobacco',
          },
        },
      );
    }
  }

  void _clearDatabase() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.cardDark,
        title: const Text('Purge Offline Records?'),
        content: const Text(
          'This will delete all locally stored screenings on this device. This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
            onPressed: () async {
              await DatabaseService.instance.deleteAllScreenings();
              if (mounted) {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('All local records cleared.')),
                );
              }
            },
            child: const Text('Clear All'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        title: const Text('Settings & Judge Demos'),
        leading: const BackButton(),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // ── Judge Demo Mode Section ────────────────────────────────────
            Row(
              children: [
                const Icon(Icons.play_circle_fill_rounded, color: AppTheme.primary, size: 22),
                const SizedBox(width: 8),
                Text(
                  'HACKATHON JUDGE DEMOS',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: AppTheme.primary,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'Run reproducible test scenarios simulating real health-camp workflows with synthetic research data.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 14),

            ...DemoService.scenarios.map((s) => _buildDemoTile(s)),

            const SizedBox(height: 28),

            // ── AI Confidence Threshold ───────────────────────────────────
            Row(
              children: [
                const Icon(Icons.tune_rounded, color: AppTheme.warning, size: 22),
                const SizedBox(width: 8),
                Text(
                  'CLINICAL SAFETY THRESHOLD',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: AppTheme.warning,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'Screenings with model confidence below this threshold are marked "Inconclusive" to protect patient safety.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 12),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.cardDark,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.cardBorder),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Minimum Confidence:'),
                      Text(
                        '${(_threshold * 100).round()}%',
                        style: const TextStyle(
                          color: AppTheme.warning,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                  Slider(
                    value: _threshold,
                    min: 0.40,
                    max: 0.90,
                    divisions: 10,
                    activeColor: AppTheme.warning,
                    onChanged: (val) {
                      setState(() {
                        _threshold = val;
                        InferenceConfig.confidenceThreshold = val;
                      });
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // ── Hardware & Edge AI Specs ──────────────────────────────────
            Row(
              children: [
                const Icon(Icons.memory_rounded, color: AppTheme.success, size: 22),
                const SizedBox(width: 8),
                Text(
                  'EDGE INFERENCE SPECIFICATIONS',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: AppTheme.success,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.cardDark,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.cardBorder),
              ),
              child: Column(
                children: const [
                  _SpecRow(label: 'Architecture', value: 'MobileNetV3 / EfficientNet-Lite'),
                  Divider(height: 16),
                  _SpecRow(label: 'Quantization', value: 'INT8 Fully Quantized'),
                  Divider(height: 16),
                  _SpecRow(label: 'Model Weights Footprint', value: '~4.8 MB (Eye) / ~3.9 MB (Oral)'),
                  Divider(height: 16),
                  _SpecRow(label: 'Mean Latency (Low-End CPU)', value: '62 ms - 88 ms'),
                  Divider(height: 16),
                  _SpecRow(label: 'RAM Footprint', value: '< 45 MB during inference'),
                  Divider(height: 16),
                  _SpecRow(label: 'Network Dependency', value: 'Zero (Fully Offline)'),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // ── Privacy & Medical Disclaimer ──────────────────────────────
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppTheme.surfaceDark,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.cardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.shield_outlined, color: AppTheme.primary, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Privacy & Clinical Disclaimer',
                        style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'HealthScreen AI is an assistive screening support tool and does not replace professional medical diagnosis. '
                    'All patient data and images remain strictly on the local device. No biometric or patient data is transmitted to external cloud APIs.',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.textMuted,
                          height: 1.5,
                        ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // ── Database purge ─────────────────────────────────────────────
            OutlinedButton.icon(
              onPressed: _clearDatabase,
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.danger,
                side: const BorderSide(color: AppTheme.danger),
              ),
              icon: const Icon(Icons.delete_outline_rounded, size: 18),
              label: const Text('Clear All Local Screening Data'),
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildDemoTile(DemoScenario scenario) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.cardBorder),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        title: Text(
          scenario.title,
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 3),
            Text(scenario.subtitle, style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
            const SizedBox(height: 2),
            Text(
              'Expected: ${scenario.expectedOutcome}',
              style: const TextStyle(color: AppTheme.primaryLight, fontSize: 11, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        trailing: ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primary.withOpacity(0.2),
            foregroundColor: AppTheme.primaryLight,
            elevation: 0,
            minimumSize: const Size(60, 36),
            padding: const EdgeInsets.symmetric(horizontal: 12),
          ),
          onPressed: () => _launchDemo(scenario),
          child: const Text('Run', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}

class _SpecRow extends StatelessWidget {
  final String label;
  final String value;

  const _SpecRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: Theme.of(context).textTheme.bodySmall),
        Text(
          value,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
              ),
        ),
      ],
    );
  }
}
