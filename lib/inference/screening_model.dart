import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:image/image.dart' as img;

// ─── Abstract interface ───────────────────────────────────────────────────────
/// Contract that all screening models must satisfy.
/// Swap [MockScreeningModel] with a real TFLite model without changing callers.
abstract class ScreeningModel {
  /// Human-readable name of this model.
  String get modelName;

  /// The screening category: 'eye' or 'oral'
  String get category;

  /// Load model weights into memory (call once at startup).
  Future<void> load();

  /// Release model resources.
  Future<void> dispose();

  /// Run inference on [imageBytes] and return a [ScreeningResult].
  Future<ScreeningResult> predict(Uint8List imageBytes);

  /// Generate a Grad-CAM heatmap for explainability.
  /// Returns pixel data (RGBA) for overlaying on the original image, or null
  /// if not supported by this model.
  Future<Uint8List?> generateHeatmap(Uint8List imageBytes);
}

// ─── Result model ─────────────────────────────────────────────────────────────
enum RiskLevel { low, moderate, high, inconclusive }

class ScreeningResult {
  final RiskLevel riskLevel;
  final double    confidence;      // 0.0 – 1.0
  final String    label;           // e.g. "No DR detected"
  final String    description;     // Plain-language explanation
  final String    recommendation;  // Referral or reassurance
  final bool      isDemoData;      // true for mock/demo results
  final Map<String, dynamic> rawOutput; // Raw model outputs for logging

  const ScreeningResult({
    required this.riskLevel,
    required this.confidence,
    required this.label,
    required this.description,
    required this.recommendation,
    this.isDemoData = false,
    this.rawOutput  = const {},
  });

  bool get isInconclusive => riskLevel == RiskLevel.inconclusive;
  bool get needsReferral  => riskLevel == RiskLevel.high || riskLevel == RiskLevel.moderate;

  int get confidencePercent => (confidence * 100).round();

  String get riskLevelLabel {
    switch (riskLevel) {
      case RiskLevel.low:          return 'Low Risk';
      case RiskLevel.moderate:     return 'Needs Attention';
      case RiskLevel.high:         return 'High Risk';
      case RiskLevel.inconclusive: return 'Inconclusive';
    }
  }

  Map<String, dynamic> toJson() => {
    'riskLevel':      riskLevel.name,
    'confidence':     confidence,
    'label':          label,
    'description':    description,
    'recommendation': recommendation,
    'isDemoData':     isDemoData,
  };
}

// ─── Configurable confidence threshold ───────────────────────────────────────
class InferenceConfig {
  /// Below this threshold the result is shown as inconclusive.
  static double confidenceThreshold = 0.60;
}

// ─── TFLite model implementation ──────────────────────────────────────────────
/// Real model using tflite_flutter. Requires .tflite file in assets/models/.
/// This class is the plug-in point for the actual trained model.
///
/// HOW TO USE:
///   1. Place your .tflite file in assets/models/
///   2. Update [_modelPath] and [_inputSize]
///   3. Replace [_runInference] with real TFLite interpreter call
class TFLiteScreeningModel extends ScreeningModel {
  final String _modelPath;
  final String _category;
  final int    _inputSize;

  // Uncomment when tflite_flutter is available:
  // Interpreter? _interpreter;

  TFLiteScreeningModel({
    required String modelPath,
    required String category,
    int inputSize = 224,
  })  : _modelPath = modelPath,
        _category  = category,
        _inputSize = inputSize;

  @override String get modelName => 'TFLite ($_category)';
  @override String get category  => _category;

  @override
  Future<void> load() async {
    // TODO: uncomment when tflite_flutter is wired in
    // _interpreter = await Interpreter.fromAsset(_modelPath);
    debugPrint('[TFLiteScreeningModel] Model loaded: $_modelPath');
  }

  @override
  Future<void> dispose() async {
    // _interpreter?.close();
    debugPrint('[TFLiteScreeningModel] Model disposed');
  }

  @override
  Future<ScreeningResult> predict(Uint8List imageBytes) async {
    // ─ Pre-process ─
    final image    = img.decodeImage(imageBytes)!;
    final resized  = img.copyResize(image, width: _inputSize, height: _inputSize);
    final input    = _imageToFloat32(resized);

    // ─ Inference ─
    // TODO: Replace with actual TFLite inference:
    // final output = List.filled(1 * numClasses, 0.0).reshape([1, numClasses]);
    // _interpreter!.run(input, output);
    // final probs = output[0] as List<double>;

    // ─ Fallback to mock while model isn't wired ─
    final mock = _category == 'eye'
        ? MockEyeModel()
        : MockOralModel();
    return mock.predict(imageBytes);
  }

  @override
  Future<Uint8List?> generateHeatmap(Uint8List imageBytes) async {
    // TODO: Implement Grad-CAM using tflite_flutter gradient tape
    return null;
  }

  List<List<List<List<double>>>> _imageToFloat32(img.Image image) {
    return List.generate(1, (_) =>
      List.generate(image.height, (y) =>
        List.generate(image.width, (x) {
          final pixel = image.getPixel(x, y);
          return [
            pixel.r / 255.0,
            pixel.g / 255.0,
            pixel.b / 255.0,
          ];
        })
      )
    );
  }
}

// ─── Mock implementations (clearly labeled demo/research data) ───────────────

/// Mock DR screening model. NEVER use for real clinical decisions.
/// All outputs are randomly generated for demo purposes only.
class MockEyeModel extends ScreeningModel {
  @override String get modelName => 'Mock DR Model (Demo)';
  @override String get category  => 'eye';

  @override Future<void> load()    async {}
  @override Future<void> dispose() async {}

  @override
  Future<ScreeningResult> predict(Uint8List imageBytes) async {
    // Simulate processing delay
    await Future.delayed(const Duration(milliseconds: 1200));

    // Demo: cycle through outcomes based on image size
    final imageSize = imageBytes.length;
    final scenario  = imageSize % 3;

    switch (scenario) {
      case 0:
        return const ScreeningResult(
          riskLevel:      RiskLevel.low,
          confidence:     0.91,
          label:          'No obvious DR detected',
          description:    'The retinal image shows no clear signs of diabetic retinopathy at this time.',
          recommendation: 'Continue regular annual eye examinations. Maintain good blood sugar control.',
          isDemoData:     true,
        );
      case 1:
        return const ScreeningResult(
          riskLevel:      RiskLevel.high,
          confidence:     0.82,
          label:          'Suspected / Referable DR',
          description:    'The retinal image shows features that may indicate diabetic retinopathy. Clinical confirmation is required.',
          recommendation: 'Referral to an ophthalmologist is strongly recommended for comprehensive evaluation.',
          isDemoData:     true,
        );
      default:
        return const ScreeningResult(
          riskLevel:      RiskLevel.inconclusive,
          confidence:     0.48,
          label:          'Unable to determine reliably',
          description:    'Model confidence is below the minimum threshold for a reliable result.',
          recommendation: 'Retake image in better lighting conditions, or refer for manual review.',
          isDemoData:     true,
        );
    }
  }

  @override
  Future<Uint8List?> generateHeatmap(Uint8List imageBytes) async {
    // Generate a simple synthetic heatmap for demo
    final image    = img.decodeImage(imageBytes);
    if (image == null) return null;
    final resized  = img.copyResize(image, width: 224, height: 224);
    final heatmap  = img.Image(width: 224, height: 224);

    // Simulate a central activation region (optic disc area)
    for (int y = 0; y < 224; y++) {
      for (int x = 0; x < 224; x++) {
        final dx = x - 140; // Offset from center (optic disc region)
        final dy = y - 112;
        final dist = (dx * dx + dy * dy).toDouble();
        final maxDist = 60.0 * 60.0;
        final intensity = (1.0 - (dist / maxDist).clamp(0.0, 1.0));
        final alpha = (intensity * 180).toInt().clamp(0, 255);
        final r = 255;
        final g = ((1.0 - intensity) * 255).toInt();
        final b = 0;
        heatmap.setPixelRgba(x, y, r, g, b, alpha);
      }
    }
    return Uint8List.fromList(img.encodePng(heatmap));
  }
}

/// Mock Oral screening model. NEVER use for real clinical decisions.
class MockOralModel extends ScreeningModel {
  @override String get modelName => 'Mock Oral Model (Demo)';
  @override String get category  => 'oral';

  @override Future<void> load()    async {}
  @override Future<void> dispose() async {}

  @override
  Future<ScreeningResult> predict(Uint8List imageBytes) async {
    await Future.delayed(const Duration(milliseconds: 1000));

    final scenario = imageBytes.length % 2;

    if (scenario == 0) {
      return const ScreeningResult(
        riskLevel:      RiskLevel.low,
        confidence:     0.88,
        label:          'No suspicious lesion detected',
        description:    'The oral image does not show obvious signs of suspicious lesions.',
        recommendation: 'Maintain good oral hygiene. Schedule regular dental check-ups.',
        isDemoData:     true,
      );
    } else {
      return const ScreeningResult(
        riskLevel:      RiskLevel.high,
        confidence:     0.78,
        label:          'Suspicious lesion present',
        description:    'The oral image shows features that may indicate a suspicious lesion requiring clinical evaluation.',
        recommendation: 'Referral to an oral physician or dentist for biopsy evaluation is strongly recommended.',
        isDemoData:     true,
      );
    }
  }

  @override
  Future<Uint8List?> generateHeatmap(Uint8List imageBytes) async {
    final image = img.decodeImage(imageBytes);
    if (image == null) return null;
    final heatmap = img.Image(width: 224, height: 224);

    // Simulate lesion region highlight
    for (int y = 0; y < 224; y++) {
      for (int x = 0; x < 224; x++) {
        final dx = x - 100;
        final dy = y - 130;
        final dist = (dx * dx + dy * dy).toDouble();
        final maxDist = 50.0 * 50.0;
        final intensity = (1.0 - (dist / maxDist).clamp(0.0, 1.0));
        final alpha = (intensity * 160).toInt().clamp(0, 255);
        heatmap.setPixelRgba(x, y, 255, (1.0 - intensity) * 200 as int, 0, alpha);
      }
    }
    return Uint8List.fromList(img.encodePng(heatmap));
  }
}

// ─── Model registry / factory ─────────────────────────────────────────────────
class ModelRegistry {
  static ScreeningModel getModel(String category, {bool useMock = true}) {
    if (useMock) {
      return category == 'eye' ? MockEyeModel() : MockOralModel();
    }
    return TFLiteScreeningModel(
      modelPath:  'assets/models/${category}_model.tflite',
      category:   category,
      inputSize:  224,
    );
  }
}
