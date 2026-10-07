import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:percent_indicator/percent_indicator.dart';

import '../utils/app_theme.dart';
import '../services/image_quality_service.dart';

class ImageQualityScreen extends StatefulWidget {
  final String imagePath;
  final String screeningType;
  final Map<String, dynamic> patientData;

  const ImageQualityScreen({
    super.key,
    required this.imagePath,
    required this.screeningType,
    required this.patientData,
  });

  @override
  State<ImageQualityScreen> createState() => _ImageQualityScreenState();
}

class _ImageQualityScreenState extends State<ImageQualityScreen> {
  QualityResult? _result;
  bool _isAnalyzing = true;

  @override
  void initState() {
    super.initState();
    _analyzeImage();
  }

  Future<void> _analyzeImage() async {
    final bytes = await File(widget.imagePath).readAsBytes();
    final result = await ImageQualityService.evaluate(bytes);
    if (mounted) {
      setState(() {
        _result = result;
        _isAnalyzing = false;
      });
    }
  }

  void _proceed() {
    Navigator.pushNamed(
      context,
      '/processing',
      arguments: {
        'imagePath':     widget.imagePath,
        'screeningType': widget.screeningType,
        'patientData':   widget.patientData,
        'qualityScore':  _result!.overallScore,
      },
    );
  }

  void _retake() {
    Navigator.pop(context); // go back to camera
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        title: const Text('Image Quality Check'),
        leading: const BackButton(),
      ),
      body: SafeArea(
        child: _isAnalyzing
            ? _AnalyzingView()
            : _ResultView(
                imagePath:    widget.imagePath,
                result:       _result!,
                screeningType: widget.screeningType,
                onProceed:    _proceed,
                onRetake:     _retake,
              ),
      ),
    );
  }
}

// ─── Analyzing view ───────────────────────────────────────────────────────────
class _AnalyzingView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(
            width: 64,
            height: 64,
            child: CircularProgressIndicator(
              color: AppTheme.primary,
              strokeWidth: 3,
            ),
          ),
          const SizedBox(height: 24),
          Text('Analyzing image quality...',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Text('Checking blur, brightness, contrast, noise',
              style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    ).animate().fadeIn();
  }
}

// ─── Result view ──────────────────────────────────────────────────────────────
class _ResultView extends StatelessWidget {
  final String imagePath;
  final QualityResult result;
  final String screeningType;
  final VoidCallback onProceed;
  final VoidCallback onRetake;

  const _ResultView({
    required this.imagePath,
    required this.result,
    required this.screeningType,
    required this.onProceed,
    required this.onRetake,
  });

  @override
  Widget build(BuildContext context) {
    final color = result.isAcceptable ? AppTheme.success : AppTheme.danger;
    final bgColor = result.isAcceptable
        ? AppTheme.success.withOpacity(0.08)
        : AppTheme.danger.withOpacity(0.08);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [

          // ── Image thumbnail ────────────────────────────────────────────
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: AspectRatio(
              aspectRatio: 4 / 3,
              child: Image.file(File(imagePath), fit: BoxFit.cover),
            ),
          ).animate().fadeIn(duration: 400.ms).scale(begin: const Offset(0.95, 0.95)),

          const SizedBox(height: 20),

          // ── Quality score banner ───────────────────────────────────────
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: color.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                CircularPercentIndicator(
                  radius: 40,
                  lineWidth: 7,
                  percent: result.overallScore.clamp(0.0, 1.0),
                  center: Text(
                    '${result.scorePercent}%',
                    style: TextStyle(
                      color: color,
                      fontWeight: FontWeight.w800,
                      fontSize: 15,
                    ),
                  ),
                  progressColor: color,
                  backgroundColor: color.withOpacity(0.15),
                  animation: true,
                  animationDuration: 800,
                ).animate().fadeIn(delay: 200.ms),

                const SizedBox(width: 16),

                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Image Quality: ${result.scorePercent}%',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(color: color, fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        result.isAcceptable
                            ? '${result.label} — Ready for screening'
                            : 'Image quality too low',
                        style: Theme.of(context).textTheme.bodySmall
                            ?.copyWith(color: color.withOpacity(0.8)),
                      ),
                    ],
                  ),
                ),

                Text(
                  result.isAcceptable ? '✅' : '❌',
                  style: const TextStyle(fontSize: 28),
                ),
              ],
            ),
          ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.2),

          const SizedBox(height: 20),

          // ── Issue explanation ──────────────────────────────────────────
          if (!result.isAcceptable) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.warning.withOpacity(0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.warning.withOpacity(0.3)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.warning_amber_rounded,
                      color: AppTheme.warning, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      result.issueDescription,
                      style: Theme.of(context).textTheme.bodyMedium
                          ?.copyWith(color: AppTheme.warning, height: 1.4),
                    ),
                  ),
                ],
              ),
            ).animate().fadeIn(delay: 400.ms),
            const SizedBox(height: 20),
          ],

          // ── Metric breakdown ───────────────────────────────────────────
          Text('Quality Breakdown',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),

          _MetricRow(label: 'Sharpness',    score: result.blurScore),
          _MetricRow(label: 'Brightness',   score: result.brightnessScore),
          _MetricRow(label: 'Contrast',     score: result.contrastScore),
          _MetricRow(label: 'Noise Level',  score: result.noiseScore),
          _MetricRow(label: 'Framing',      score: result.framingScore),

          const SizedBox(height: 32),

          // ── Action buttons ─────────────────────────────────────────────
          if (result.isAcceptable) ...[
            ElevatedButton(
              key: const Key('proceed_to_screening_btn'),
              onPressed: onProceed,
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Proceed to AI Screening'),
                  SizedBox(width: 8),
                  Icon(Icons.psychology_rounded, size: 18),
                ],
              ),
            ).animate().fadeIn(delay: 600.ms),
            const SizedBox(height: 12),
            OutlinedButton(
              key: const Key('retake_image_btn_quality'),
              onPressed: onRetake,
              child: const Text('Retake Image'),
            ).animate().fadeIn(delay: 700.ms),
          ] else ...[
            ElevatedButton(
              key: const Key('retake_image_btn_poor'),
              onPressed: onRetake,
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.camera_alt_rounded, size: 18),
                  SizedBox(width: 8),
                  Text('Retake Image'),
                ],
              ),
            ).animate().fadeIn(delay: 600.ms),
            const SizedBox(height: 12),
            // Allow proceeding anyway with a warning
            OutlinedButton(
              key: const Key('proceed_anyway_btn'),
              onPressed: onProceed,
              style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.warning,
                  side: const BorderSide(color: AppTheme.warning)),
              child: const Text('Proceed Anyway (not recommended)'),
            ).animate().fadeIn(delay: 700.ms),
          ],

          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _MetricRow extends StatelessWidget {
  final String label;
  final double score;

  const _MetricRow({required this.label, required this.score});

  @override
  Widget build(BuildContext context) {
    final color = score >= 0.7
        ? AppTheme.success
        : score >= 0.5
            ? AppTheme.warning
            : AppTheme.danger;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          SizedBox(
            width: 90,
            child: Text(label,
                style: Theme.of(context).textTheme.bodySmall),
          ),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: score.clamp(0.0, 1.0),
                backgroundColor: AppTheme.cardBorder,
                valueColor: AlwaysStoppedAnimation<Color>(color),
                minHeight: 6,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Text(
            '${(score * 100).round()}%',
            style: Theme.of(context).textTheme.labelSmall
                ?.copyWith(color: color, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
