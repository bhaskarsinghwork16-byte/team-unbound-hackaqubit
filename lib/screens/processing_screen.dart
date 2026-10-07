import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../utils/app_theme.dart';
import '../inference/screening_model.dart';
import '../database/database_service.dart';
import '../models/screening_record.dart';
import '../services/image_quality_service.dart';

class ProcessingScreen extends StatefulWidget {
  final String imagePath;
  final String screeningType;
  final Map<String, dynamic> patientData;
  final double qualityScore;

  const ProcessingScreen({
    super.key,
    required this.imagePath,
    required this.screeningType,
    required this.patientData,
    required this.qualityScore,
  });

  @override
  State<ProcessingScreen> createState() => _ProcessingScreenState();
}

class _ProcessingScreenState extends State<ProcessingScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _spinController;
  String _currentStep = 'Loading model...';
  int    _stepIndex    = 0;

  static const _steps = [
    'Loading AI model...',
    'Pre-processing image...',
    'Running inference...',
    'Generating explanation...',
    'Saving result...',
  ];

  @override
  void initState() {
    super.initState();
    _spinController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
    _runInference();
  }

  Future<void> _setStep(int i) async {
    if (mounted) setState(() {
      _stepIndex   = i;
      _currentStep = _steps[i];
    });
    await Future.delayed(const Duration(milliseconds: 600));
  }

  Future<void> _runInference() async {
    try {
      await _setStep(0);
      final model = ModelRegistry.getModel(widget.screeningType, useMock: true);
      await model.load();

      await _setStep(1);
      final bytes = await File(widget.imagePath).readAsBytes();

      await _setStep(2);
      final result = await model.predict(bytes);

      // Check confidence threshold
      if (result.confidence < InferenceConfig.confidenceThreshold &&
          result.riskLevel != RiskLevel.inconclusive) {
        // Treat as inconclusive
        final inconclusiveResult = ScreeningResult(
          riskLevel:      RiskLevel.inconclusive,
          confidence:     result.confidence,
          label:          'Unable to determine reliably',
          description:    'Model confidence (${result.confidencePercent}%) is below the minimum threshold of ${(InferenceConfig.confidenceThreshold * 100).round()}%.',
          recommendation: 'Retake the image in better conditions, or refer for manual clinical review.',
          isDemoData:     result.isDemoData,
        );
        await _finalize(inconclusiveResult, model, bytes);
        return;
      }

      await _setStep(3);
      final heatmapBytes = await model.generateHeatmap(bytes);
      String? heatmapPath;

      if (heatmapBytes != null) {
        final dir  = Directory(widget.imagePath).parent;
        final path = '${dir.path}/heatmap_${DateTime.now().millisecondsSinceEpoch}.png';
        await File(path).writeAsBytes(heatmapBytes);
        heatmapPath = path;
      }

      await _finalize(result, model, bytes, heatmapPath: heatmapPath);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Inference error: $e')),
        );
        Navigator.pop(context);
      }
    }
  }

  Future<void> _finalize(
    ScreeningResult result,
    ScreeningModel model,
    Uint8List bytes, {
    String? heatmapPath,
  }) async {
    await _setStep(4);

    final record = ScreeningRecord(
      patientId:      widget.patientData['patientId'] as String,
      age:            widget.patientData['age'] as int?,
      sex:            widget.patientData['sex'] as String?,
      riskFactors:    widget.patientData['riskFactors'] as String?,
      screeningType:  widget.screeningType,
      imagePath:      widget.imagePath,
      qualityScore:   widget.qualityScore,
      riskLevel:      result.riskLevel.name,
      confidence:     result.confidence,
      label:          result.label,
      description:    result.description,
      recommendation: result.recommendation,
      isDemo:         result.isDemoData,
      heatmapPath:    heatmapPath,
      createdAt:      DateTime.now(),
    );

    final id = await DatabaseService.instance.insertScreening(record);

    await model.dispose();

    if (mounted) {
      Navigator.pushReplacementNamed(
        context,
        '/result',
        arguments: {
          'result': {
            'id':           id,
            'riskLevel':    result.riskLevel.name,
            'confidence':   result.confidence,
            'label':        result.label,
            'description':  result.description,
            'recommendation': result.recommendation,
            'isDemoData':   result.isDemoData,
            'imagePath':    widget.imagePath,
            'heatmapPath':  heatmapPath,
            'screeningType': widget.screeningType,
            'qualityScore': widget.qualityScore,
            'patientId':    widget.patientData['patientId'],
            'createdAt':    DateTime.now().toIso8601String(),
          },
        },
      );
    }
  }

  @override
  void dispose() {
    _spinController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(40),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // ── Spinner ────────────────────────────────────────────
                AnimatedBuilder(
                  animation: _spinController,
                  builder: (context, child) {
                    return Transform.rotate(
                      angle: _spinController.value * 6.28,
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: SweepGradient(
                            colors: [
                              AppTheme.primary,
                              AppTheme.primary.withOpacity(0),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 8),

                Container(
                  width: 70,
                  height: 70,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppTheme.backgroundDark,
                  ),
                  child: const Icon(
                    Icons.psychology_rounded,
                    color: AppTheme.primary,
                    size: 36,
                  ),
                ),

                const SizedBox(height: 32),

                Text(
                  'AI Screening in Progress',
                  style: Theme.of(context).textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ).animate().fadeIn(),

                const SizedBox(height: 8),

                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 400),
                  child: Text(
                    _currentStep,
                    key: ValueKey(_currentStep),
                    style: Theme.of(context).textTheme.bodyMedium
                        ?.copyWith(color: AppTheme.primary),
                    textAlign: TextAlign.center,
                  ),
                ),

                const SizedBox(height: 40),

                // ── Step dots ──────────────────────────────────────────
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(_steps.length, (i) {
                    final active = i == _stepIndex;
                    final done   = i < _stepIndex;
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width:  active ? 24 : 8,
                      height: 8,
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      decoration: BoxDecoration(
                        color: done
                            ? AppTheme.success
                            : active
                                ? AppTheme.primary
                                : AppTheme.cardBorder,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    );
                  }),
                ),

                const SizedBox(height: 48),

                // ── Note ───────────────────────────────────────────────
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.cardDark,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.cardBorder),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.wifi_off_rounded,
                          color: AppTheme.success, size: 18),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Running on-device AI — no internet required',
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(color: AppTheme.success),
                        ),
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 600.ms),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
