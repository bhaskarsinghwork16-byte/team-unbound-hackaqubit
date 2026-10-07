import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../utils/app_theme.dart';
import '../widgets/screening_card.dart';

class ScreeningSelectionScreen extends StatelessWidget {
  const ScreeningSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        title: const Text('Choose Screening'),
        leading: const BackButton(),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Select Clinical Protocol',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ).animate().fadeIn(),

              const SizedBox(height: 6),

              Text(
                'Both protocols work entirely offline with on-device computer vision models.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppTheme.textSecondary,
                    ),
              ).animate().fadeIn(delay: 100.ms),

              const SizedBox(height: 24),

              // Eye Screening Card
              ScreeningCard(
                id: 'select_eye',
                icon: Icons.visibility_rounded,
                title: '👁 Retinal Eye Screening',
                subtitle: 'Diabetic Retinopathy (DR)',
                description:
                    'Automated classification for referable diabetic retinopathy. Works on low-end smartphone cameras or low-cost portable lens adapters.',
                gradient: AppTheme.eyeGradient,
                onStart: () => Navigator.pushNamed(
                  context,
                  '/patient-info',
                  arguments: {'screeningType': 'eye'},
                ),
                tags: const ['Fundus / Retinal', 'Microaneurysm Detection', '100% Offline'],
              ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1),

              const SizedBox(height: 20),

              // Oral Screening Card
              ScreeningCard(
                id: 'select_oral',
                icon: Icons.sentiment_satisfied_alt_rounded,
                title: '👄 Oral Lesion Screening',
                subtitle: 'Pre-Malignant / Suspicious Lesions',
                description:
                    'AI-assisted screening of buccal mucosa, tongue, and oral cavity for suspicious lesions, leukoplakia, and referral signs.',
                gradient: AppTheme.oralGradient,
                onStart: () => Navigator.pushNamed(
                  context,
                  '/patient-info',
                  arguments: {'screeningType': 'oral'},
                ),
                tags: const ['Oral Cavity', 'Grad-CAM Localized', 'Community Friendly'],
              ).animate().fadeIn(delay: 350.ms).slideY(begin: 0.1),

              const SizedBox(height: 32),

              // Quality Assurance notice
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.cardDark,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.cardBorder),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.verified_outlined, color: AppTheme.primary, size: 22),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Every screening automatically runs our pre-screening Image Quality Assurance pipeline before disease inference.',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppTheme.textSecondary,
                              height: 1.4,
                            ),
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(delay: 500.ms),
            ],
          ),
        ),
      ),
    );
  }
}
