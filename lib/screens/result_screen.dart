import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';

import '../utils/app_theme.dart';

class ResultScreen extends StatelessWidget {
  final Map<String, dynamic> result;

  const ResultScreen({super.key, required this.result});

  String get _riskLevel     => result['riskLevel'] as String;
  double get _confidence    => result['confidence'] as double;
  String get _label         => result['label'] as String;
  String get _description   => result['description'] as String;
  String get _recommendation => result['recommendation'] as String;
  bool   get _isDemoData    => result['isDemoData'] as bool? ?? false;
  String get _imagePath     => result['imagePath'] as String;
  String get _screeningType => result['screeningType'] as String;
  double get _qualityScore  => result['qualityScore'] as double;
  String get _patientId     => result['patientId'] as String;

  bool get _isInconclusive => _riskLevel == 'inconclusive';
  bool get _isHighRisk     => _riskLevel == 'high';
  bool get _isLowRisk      => _riskLevel == 'low';

  Color get _riskColor {
    switch (_riskLevel) {
      case 'low':          return AppTheme.success;
      case 'moderate':     return AppTheme.warning;
      case 'high':         return AppTheme.danger;
      default:             return AppTheme.textMuted;
    }
  }

  List<Color> get _riskGradient {
    switch (_riskLevel) {
      case 'low':      return AppTheme.successGradient;
      case 'moderate': return AppTheme.warningGradient;
      case 'high':     return AppTheme.dangerGradient;
      default:         return [AppTheme.textMuted, AppTheme.textMuted];
    }
  }

  String get _riskIcon {
    switch (_riskLevel) {
      case 'low':          return '✅';
      case 'moderate':     return '⚠️';
      case 'high':         return '🔴';
      default:             return '❓';
    }
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final dateStr = DateFormat('d MMM yyyy, HH:mm').format(now);

    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('Screening Complete'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pushNamedAndRemoveUntil(
                context, '/home', (r) => false),
            child: const Text('Done'),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [

              // ── Demo banner ────────────────────────────────────────────
              if (_isDemoData)
                Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppTheme.info.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.info.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.science_rounded,
                          color: AppTheme.info, size: 16),
                      const SizedBox(width: 8),
                      Text(
                        'DEMO / RESEARCH DATA — Not for clinical use',
                        style: Theme.of(context).textTheme.labelSmall
                            ?.copyWith(color: AppTheme.info),
                      ),
                    ],
                  ),
                ).animate().fadeIn(),

              // ── Inconclusive special view ──────────────────────────────
              if (_isInconclusive)
                _InconclusiveCard(
                  confidence: _confidence,
                  onRetake: () => Navigator.pushNamedAndRemoveUntil(
                      context, '/home', (r) => false),
                  onRefer:  () {},
                ).animate().fadeIn().slideY(begin: 0.2)
              else ...[

                // ── Risk level card ──────────────────────────────────────
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        _riskColor.withOpacity(0.12),
                        _riskColor.withOpacity(0.04),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: _riskColor.withOpacity(0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(_riskIcon,
                              style: const TextStyle(fontSize: 32)),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _label,
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineSmall
                                      ?.copyWith(
                                        color: _riskColor,
                                        fontWeight: FontWeight.w800,
                                      ),
                                ),
                                const SizedBox(height: 4),
                                _RiskBadge(
                                  riskLevel: _riskLevel,
                                  color: _riskColor,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),

                      // Confidence bar
                      _ConfidenceBar(confidence: _confidence, color: _riskColor),

                      const SizedBox(height: 16),

                      Text(
                        _description,
                        style: Theme.of(context).textTheme.bodyMedium
                            ?.copyWith(height: 1.5),
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 100.ms).scale(begin: const Offset(0.95, 0.95)),

                const SizedBox(height: 16),

                // ── Recommendation ─────────────────────────────────────
                _RecommendationCard(
                  recommendation: _recommendation,
                  needsReferral: _riskLevel == 'high' || _riskLevel == 'moderate',
                ).animate().fadeIn(delay: 250.ms).slideY(begin: 0.2),

                const SizedBox(height: 16),
              ],

              // ── Screening metadata ─────────────────────────────────────
              _MetadataCard(
                screeningType: _screeningType,
                qualityScore:  _qualityScore,
                patientId:     _patientId,
                dateStr:       dateStr,
              ).animate().fadeIn(delay: 350.ms),

              const SizedBox(height: 24),

              // ── Actions ────────────────────────────────────────────────
              ElevatedButton.icon(
                key: const Key('view_analysis_btn'),
                onPressed: () => Navigator.pushNamed(
                  context,
                  '/analysis',
                  arguments: {'result': result},
                ),
                icon: const Icon(Icons.analytics_rounded, size: 18),
                label: const Text('View Analysis & Explanation'),
              ).animate().fadeIn(delay: 450.ms),

              const SizedBox(height: 12),

              OutlinedButton.icon(
                key: const Key('new_screening_btn'),
                onPressed: () => Navigator.pushNamedAndRemoveUntil(
                    context, '/home', (r) => false),
                icon: const Icon(Icons.add_circle_outline_rounded, size: 18),
                label: const Text('New Screening'),
              ).animate().fadeIn(delay: 550.ms),

              const SizedBox(height: 40),

              // ── Medical disclaimer ─────────────────────────────────────
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.cardDark,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.cardBorder),
                ),
                child: Text(
                  '⚕️ HealthScreen AI provides preliminary screening support only. '
                  'This result does not replace professional medical diagnosis. '
                  'All suspicious findings must be evaluated by a qualified healthcare professional.',
                  style: Theme.of(context).textTheme.bodySmall
                      ?.copyWith(color: AppTheme.textMuted, height: 1.5),
                ),
              ).animate().fadeIn(delay: 650.ms),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Sub-widgets ──────────────────────────────────────────────────────────────

class _RiskBadge extends StatelessWidget {
  final String riskLevel;
  final Color  color;

  const _RiskBadge({required this.riskLevel, required this.color});

  String get _label {
    switch (riskLevel) {
      case 'low':          return 'Low Risk';
      case 'moderate':     return 'Needs Attention';
      case 'high':         return 'High Risk — Refer';
      default:             return 'Inconclusive';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        _label,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.3,
        ),
      ),
    );
  }
}

class _ConfidenceBar extends StatelessWidget {
  final double confidence;
  final Color color;

  const _ConfidenceBar({required this.confidence, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Model Confidence',
                style: Theme.of(context).textTheme.labelMedium),
            Text('${(confidence * 100).round()}%',
                style: TextStyle(
                    color: color,
                    fontWeight: FontWeight.w700,
                    fontSize: 14)),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: confidence,
            backgroundColor: color.withOpacity(0.15),
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 8,
          ),
        ),
      ],
    );
  }
}

class _RecommendationCard extends StatelessWidget {
  final String recommendation;
  final bool   needsReferral;

  const _RecommendationCard({
    required this.recommendation,
    required this.needsReferral,
  });

  @override
  Widget build(BuildContext context) {
    final color = needsReferral ? AppTheme.warning : AppTheme.success;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: color.withOpacity(0.07),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                needsReferral
                    ? Icons.local_hospital_rounded
                    : Icons.check_circle_rounded,
                color: color,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Recommendation',
                style: Theme.of(context).textTheme.titleMedium
                    ?.copyWith(color: color),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            recommendation,
            style: Theme.of(context).textTheme.bodyMedium
                ?.copyWith(height: 1.5),
          ),
          if (needsReferral) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.arrow_forward_rounded, color: color, size: 14),
                  const SizedBox(width: 6),
                  Text('Further clinical examination recommended',
                      style: TextStyle(
                          color: color,
                          fontSize: 12,
                          fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _MetadataCard extends StatelessWidget {
  final String screeningType;
  final double qualityScore;
  final String patientId;
  final String dateStr;

  const _MetadataCard({
    required this.screeningType,
    required this.qualityScore,
    required this.patientId,
    required this.dateStr,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.cardBorder),
      ),
      child: Column(
        children: [
          _Row(icon: Icons.badge_outlined,
              label: 'Patient ID', value: patientId),
          _Row(icon: Icons.medical_services_outlined,
              label: 'Screening Type',
              value: screeningType == 'eye' ? '👁 Eye (DR)' : '👄 Oral'),
          _Row(icon: Icons.photo_camera_outlined,
              label: 'Image Quality',
              value: '${(qualityScore * 100).round()}%'),
          _Row(icon: Icons.schedule_rounded,
              label: 'Date & Time', value: dateStr, isLast: true),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool isLast;

  const _Row({
    required this.icon,
    required this.label,
    required this.value,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            children: [
              Icon(icon, color: AppTheme.textMuted, size: 16),
              const SizedBox(width: 10),
              Text(label,
                  style: Theme.of(context).textTheme.bodySmall
                      ?.copyWith(color: AppTheme.textMuted)),
              const Spacer(),
              Text(value,
                  style: Theme.of(context).textTheme.labelMedium
                      ?.copyWith(color: AppTheme.textPrimary)),
            ],
          ),
        ),
        if (!isLast) const Divider(height: 1),
      ],
    );
  }
}

class _InconclusiveCard extends StatelessWidget {
  final double confidence;
  final VoidCallback onRetake;
  final VoidCallback onRefer;

  const _InconclusiveCard({
    required this.confidence,
    required this.onRetake,
    required this.onRefer,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.cardBorder),
      ),
      child: Column(
        children: [
          const Text('❓', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 16),
          Text(
            'Unable to determine reliably',
            style: Theme.of(context).textTheme.headlineSmall,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            'The image or model confidence (${(confidence * 100).round()}%) is insufficient for reliable screening.',
            style: Theme.of(context).textTheme.bodyMedium
                ?.copyWith(height: 1.5, color: AppTheme.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            key: const Key('retake_inconclusive_btn'),
            onPressed: onRetake,
            icon: const Icon(Icons.camera_alt_rounded, size: 18),
            label: const Text('Retake Image'),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            key: const Key('refer_manual_btn'),
            onPressed: onRefer,
            icon: const Icon(Icons.local_hospital_rounded, size: 18),
            label: const Text('Refer for Manual Review'),
          ),
        ],
      ),
    );
  }
}
