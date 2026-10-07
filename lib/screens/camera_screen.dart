import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';

import '../utils/app_theme.dart';

class CameraScreen extends StatefulWidget {
  final String screeningType;
  final Map<String, dynamic> patientData;

  const CameraScreen({
    super.key,
    required this.screeningType,
    required this.patientData,
  });

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen>
    with SingleTickerProviderStateMixin {
  CameraController? _cameraController;
  List<CameraDescription>? _cameras;
  bool _isInitializing = true;
  bool _isCapturing    = false;
  String? _liveHint;
  String _cameraError = '';

  late AnimationController _pulseController;

  bool get _isEye => widget.screeningType == 'eye';

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _initCamera();
    _startLiveHints();
  }

  Future<void> _initCamera() async {
    final status = await Permission.camera.request();
    if (!status.isGranted) {
      setState(() {
        _cameraError = 'Camera permission denied. Please enable in Settings.';
        _isInitializing = false;
      });
      return;
    }

    try {
      _cameras = await availableCameras();
      if (_cameras == null || _cameras!.isEmpty) {
        setState(() {
          _cameraError = 'No camera found on this device.';
          _isInitializing = false;
        });
        return;
      }

      _cameraController = CameraController(
        _cameras!.first,
        ResolutionPreset.high,
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.jpeg,
      );

      await _cameraController!.initialize();

      if (mounted) {
        setState(() => _isInitializing = false);
      }
    } catch (e) {
      setState(() {
        _cameraError = 'Failed to initialize camera: $e';
        _isInitializing = false;
      });
    }
  }

  void _startLiveHints() {
    final hints = [
      'Center the ${_isEye ? "eye" : "mouth"} in the circle',
      'Hold the phone steady',
      'Ensure adequate lighting',
      _isEye ? 'Ask patient to look straight ahead' : 'Ask patient to open mouth wide',
      'Move closer if needed',
    ];
    int i = 0;
    Future.doWhile(() async {
      if (!mounted) return false;
      setState(() => _liveHint = hints[i % hints.length]);
      i++;
      await Future.delayed(const Duration(seconds: 3));
      return mounted;
    });
  }

  Future<void> _captureImage() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) return;
    if (_isCapturing) return;

    setState(() => _isCapturing = true);
    try {
      final xFile = await _cameraController!.takePicture();
      if (mounted) {
        Navigator.pushNamed(
          context,
          '/image-quality',
          arguments: {
            'imagePath':     xFile.path,
            'screeningType': widget.screeningType,
            'patientData':   widget.patientData,
          },
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Capture failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isCapturing = false);
    }
  }

  Future<void> _pickFromGallery() async {
    final picker = ImagePicker();
    final xFile = await picker.pickImage(source: ImageSource.gallery, imageQuality: 95);
    if (xFile != null && mounted) {
      Navigator.pushNamed(
        context,
        '/image-quality',
        arguments: {
          'imagePath':     xFile.path,
          'screeningType': widget.screeningType,
          'patientData':   widget.patientData,
        },
      );
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _cameraController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            // ── Camera preview ─────────────────────────────────────────
            if (_isInitializing)
              const Center(child: CircularProgressIndicator(color: AppTheme.primary))
            else if (_cameraError.isNotEmpty)
              _CameraErrorView(
                error: _cameraError,
                onPickGallery: _pickFromGallery,
              )
            else if (_cameraController != null)
              Positioned.fill(
                child: CameraPreview(_cameraController!),
              ),

            // ── Overlay ────────────────────────────────────────────────
            if (!_isInitializing && _cameraError.isEmpty) ...[
              // Top bar
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: _TopBar(
                  screeningType: widget.screeningType,
                  patientId: widget.patientData['patientId'] as String,
                  onBack: () => Navigator.pop(context),
                ),
              ),

              // Guide circle
              Center(
                child: _GuideCircle(
                  isEye: _isEye,
                  pulseController: _pulseController,
                ),
              ),

              // Live hint
              Positioned(
                bottom: 160,
                left: 20,
                right: 20,
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 400),
                  child: Container(
                    key: ValueKey(_liveHint),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 10),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.tips_and_updates_rounded,
                            color: AppTheme.warning, size: 16),
                        const SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            _liveHint ?? '',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Bottom controls
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: _BottomControls(
                  isCapturing: _isCapturing,
                  onCapture: _captureImage,
                  onGallery: _pickFromGallery,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ─── Sub-widgets ──────────────────────────────────────────────────────────────

class _TopBar extends StatelessWidget {
  final String screeningType;
  final String patientId;
  final VoidCallback onBack;

  const _TopBar({required this.screeningType, required this.patientId, required this.onBack});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Colors.black.withOpacity(0.7), Colors.transparent],
        ),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: onBack,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.4),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.arrow_back_rounded,
                  color: Colors.white, size: 20),
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${screeningType == "eye" ? "👁 Eye" : "👄 Oral"} Screening',
                style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 16),
              ),
              Text(
                'Patient: $patientId',
                style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                    fontSize: 12),
              ),
            ],
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.success.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.success.withOpacity(0.4)),
            ),
            child: const Row(
              children: [
                Icon(Icons.circle, color: AppTheme.success, size: 6),
                SizedBox(width: 4),
                Text('Offline', style: TextStyle(color: AppTheme.success, fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _GuideCircle extends StatelessWidget {
  final bool isEye;
  final AnimationController pulseController;

  const _GuideCircle({required this.isEye, required this.pulseController});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: pulseController,
      builder: (context, child) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: Colors.white.withOpacity(0.4 + pulseController.value * 0.3),
                  width: 2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withOpacity(0.2 + pulseController.value * 0.1),
                    blurRadius: 20,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  isEye ? '👁' : '👄',
                  style: TextStyle(
                    fontSize: 48,
                    color: Colors.white.withOpacity(0.3),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              isEye
                  ? 'Position the eye within the circle'
                  : 'Position the open mouth within the circle',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white.withOpacity(0.8),
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        );
      },
    );
  }
}

class _BottomControls extends StatelessWidget {
  final bool isCapturing;
  final VoidCallback onCapture;
  final VoidCallback onGallery;

  const _BottomControls({
    required this.isCapturing,
    required this.onCapture,
    required this.onGallery,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(32, 24, 32, 48),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.bottomCenter,
          end: Alignment.topCenter,
          colors: [Colors.black.withOpacity(0.85), Colors.transparent],
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Gallery picker
          GestureDetector(
            onTap: onGallery,
            child: Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.photo_library_rounded,
                  color: Colors.white, size: 24),
            ),
          ),

          // Capture button
          GestureDetector(
            onTap: isCapturing ? null : onCapture,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isCapturing
                    ? Colors.white.withOpacity(0.6)
                    : Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.white.withOpacity(0.3),
                    blurRadius: 16,
                    spreadRadius: 4,
                  ),
                ],
              ),
              child: isCapturing
                  ? const Padding(
                      padding: EdgeInsets.all(20),
                      child: CircularProgressIndicator(
                          color: AppTheme.primary, strokeWidth: 3))
                  : const Icon(Icons.camera_alt_rounded,
                      color: Colors.black, size: 36),
            ),
          ),

          // Placeholder to center capture button
          const SizedBox(width: 52),
        ],
      ),
    );
  }
}

class _CameraErrorView extends StatelessWidget {
  final String error;
  final VoidCallback onPickGallery;

  const _CameraErrorView({required this.error, required this.onPickGallery});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.camera_alt_outlined, color: AppTheme.textMuted, size: 64),
            const SizedBox(height: 16),
            Text('Camera Unavailable',
                style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            Text(error,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: onPickGallery,
              icon: const Icon(Icons.photo_library_rounded),
              label: const Text('Pick from Gallery'),
            ),
          ],
        ),
      ),
    );
  }
}
