import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../utils/app_theme.dart';

class AnalysisScreen extends StatefulWidget {
  final Map<String, dynamic> result;

  const AnalysisScreen({super.key, required this.result});

  @override
  State<AnalysisScreen> createState() => _AnalysisScreenState();
}

class _AnalysisScreenState extends State<AnalysisScreen> {
  bool _showHeatmap = true;
  double _overlayOpacity = 0.65;

  String get _screeningType => widget.result['screeningType'] as String;
  String get _imagePath     => widget.result['imagePath'] as String;
  String? get _heatmapPath  => widget.result['heatmapPath'] as String?;
  String get _label         => widget.result['label'] as String;
  double get _confidence    => widget.result['confidence'] as double;
  String get _riskLevel     => widget.result['riskLevel'] as String;

  Color get _riskColor {
    switch (_riskLevel) {
      case 'low':      return AppTheme.success;
      case 'moderate': return AppTheme.warning;
      case 'high':     return AppTheme.danger;
      default:         return AppTheme.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEye = _screeningType == 'eye';

    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        title: const Text('Visual AI Explanation'),
        leading: const BackButton(),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header tag
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppTheme.info.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.info.withOpacity(0.25)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.auto_awesome_rounded, color: AppTheme.info, size: 16),
                    const SizedBox(width: 8),
                    Text(
                      'Explainable AI • Grad-CAM++',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: AppTheme.info,
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ],
                ),
              ).animate().fadeIn(),

              const SizedBox(height: 16),

              Text(
                'Why was this result flagged?',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ).animate().fadeIn(delay: 100.ms),

              const SizedBox(height: 6),

              Text(
                'The highlighted areas indicate regions of the image that most heavily influenced the neural network prediction.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppTheme.textSecondary,
                      height: 1.45,
                    ),
              ).animate().fadeIn(delay: 150.ms),

              const SizedBox(height: 20),

              // Interactive Image / Heatmap Stack
              ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  height: 320,
                  width: double.infinity,
                  color: Colors.black,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Base image
                      if (File(_imagePath).existsSync())
                        Image.file(
                          File(_imagePath),
                          width: double.infinity,
                          height: double.infinity,
                          fit: BoxFit.cover,
                        )
                      else
                        Container(
                          color: AppTheme.cardDark,
                          child: const Center(
                            child: Icon(Icons.image_not_supported_rounded,
                                color: AppTheme.textMuted, size: 48),
                          ),
                        ),

                      // Heatmap Overlay
                      if (_showHeatmap && _heatmapPath != null && File(_heatmapPath!).existsSync())
                        Opacity(
                          opacity: _overlayOpacity,
                          child: Image.file(
                            File(_heatmapPath!),
                            width: double.infinity,
                            height: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        )
                      else if (_showHeatmap)
                        // Synthetic fallback gradient if heatmap was not generated
                        Opacity(
                          opacity: _overlayOpacity,
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: RadialGradient(
                                center: Alignment.center,
                                radius: 0.65,
                                colors: [
                                  _riskColor.withOpacity(0.85),
                                  Colors.yellow.withOpacity(0.4),
                                  Colors.transparent,
                                ],
                                stops: const [0.0, 0.5, 1.0],
                              ),
                            ),
                          ),
                        ),

                      // Toggle Overlay Pill
                      Positioned(
                        bottom: 14,
                        right: 14,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.75),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.white24),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.layers_rounded, color: Colors.white, size: 14),
                              const SizedBox(width: 6),
                              Text(
                                _showHeatmap ? 'Heatmap ON' : 'Heatmap OFF',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ).animate().fadeIn(delay: 200.ms).scale(begin: const Offset(0.97, 0.97)),

              const SizedBox(height: 16),

              // Interactive Slider & Switch
              Row(
                children: [
                  Switch(
                    value: _showHeatmap,
                    activeColor: AppTheme.primary,
                    onChanged: (val) => setState(() => _showHeatmap = val),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Show Attention Map',
                    style: Theme.of(context).textTheme.labelMedium,
                  ),
                  const Spacer(),
                  if (_showHeatmap) ...[
                    Text(
                      'Opacity: ${(_overlayOpacity * 100).round()}%',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ],
              ),

              if (_showHeatmap)
                Slider(
                  value: _overlayOpacity,
                  min: 0.1,
                  max: 1.0,
                  activeColor: AppTheme.primary,
                  inactiveColor: AppTheme.cardBorder,
                  onChanged: (val) => setState(() => _overlayOpacity = val),
                ),

              const SizedBox(height: 20),

              // Clinical Findings Guide
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppTheme.cardDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isEye ? 'Retinal Region Analysis' : 'Oral Tissue Region Analysis',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      isEye
                          ? 'The network focused attention around the macula / vascular arcades, scanning for microaneurysms, hemorrhages, and exudative markers.'
                          : 'The network focused attention on color variations, erythema, leukoplakia boundaries, and irregular mucosal textures.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppTheme.textSecondary,
                            height: 1.45,
                          ),
                    ),
                    const SizedBox(height: 14),
                    const Divider(),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        const Icon(Icons.lightbulb_outline_rounded,
                            color: AppTheme.warning, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '"Highlighted areas influenced the model\'s prediction. The heatmap itself does not constitute definitive medical evidence."',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: AppTheme.warningLight,
                                  fontStyle: FontStyle.italic,
                                ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ).animate().fadeIn(delay: 350.ms),

              const SizedBox(height: 20),

              // Model Diagnostic Info
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceDark,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.cardBorder),
                ),
                child: Column(
                  children: [
                    _InfoRow(
                      label: 'Screening Category',
                      value: isEye ? 'Diabetic Retinopathy (Fundus)' : 'Oral Cavity Screening',
                    ),
                    const Divider(height: 16),
                    _InfoRow(
                      label: 'Predicted Class',
                      value: _label,
                      valueColor: _riskColor,
                    ),
                    const Divider(height: 16),
                    _InfoRow(
                      label: 'Model Confidence',
                      value: '${(_confidence * 100).toStringAsFixed(1)}%',
                    ),
                    const Divider(height: 16),
                    _InfoRow(
                      label: 'Inference Device',
                      value: 'On-Device CPU (INT8 Quantized)',
                    ),
                  ],
                ),
              ).animate().fadeIn(delay: 450.ms),

              const SizedBox(height: 32),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Return to Screening Result'),
                ),
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _InfoRow({required this.label, required this.value, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: Theme.of(context).textTheme.bodySmall),
        Text(
          value,
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
                color: valueColor ?? AppTheme.textPrimary,
                fontWeight: FontWeight.w700,
              ),
        ),
      ],
    );
  }
}
