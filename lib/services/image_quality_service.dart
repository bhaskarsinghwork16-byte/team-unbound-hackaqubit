import 'dart:math' as math;
import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:image/image.dart' as img;

/// Assesses the quality of a captured image before running disease inference.
/// Returns a [QualityResult] with overall score and per-metric breakdown.
class ImageQualityService {
  // Thresholds
  static const double kMinAcceptableScore = 0.60;
  static const double kGoodScore          = 0.75;

  // ─── Public API ────────────────────────────────────────────────────────
  /// Evaluate image quality from raw JPEG/PNG bytes.
  static Future<QualityResult> evaluate(Uint8List imageBytes) async {
    return compute(_computeQuality, imageBytes);
  }

  // ─── Private computation (runs on isolate) ──────────────────────────────
  static QualityResult _computeQuality(Uint8List bytes) {
    final image = img.decodeImage(bytes);
    if (image == null) {
      return QualityResult(
        overallScore: 0.0,
        blurScore: 0.0,
        brightnessScore: 0.0,
        contrastScore: 0.0,
        noiseScore: 0.0,
        framingScore: 0.5,
        issueDescription: 'Could not decode image.',
        isAcceptable: false,
      );
    }

    final blur       = _blurScore(image);
    final brightness = _brightnessScore(image);
    final contrast   = _contrastScore(image);
    final noise      = _noiseScore(image);
    final framing    = _framingScore(image);

    // Weighted average
    final overall = (blur * 0.35 + brightness * 0.20 + contrast * 0.20 +
                     noise * 0.15 + framing * 0.10).clamp(0.0, 1.0);

    final issue = _primaryIssue(blur, brightness, contrast, noise, framing);

    return QualityResult(
      overallScore:     overall,
      blurScore:        blur,
      brightnessScore:  brightness,
      contrastScore:    contrast,
      noiseScore:       noise,
      framingScore:     framing,
      issueDescription: issue,
      isAcceptable:     overall >= kMinAcceptableScore,
    );
  }

  /// Laplacian variance — higher = sharper
  static double _blurScore(img.Image image) {
    final gray = img.grayscale(image);
    final w = gray.width;
    final h = gray.height;

    double variance = 0.0;
    int count = 0;

    for (int y = 1; y < h - 1; y++) {
      for (int x = 1; x < w - 1; x++) {
        final center  = img.getLuminance(gray.getPixel(x,     y    ));
        final top     = img.getLuminance(gray.getPixel(x,     y - 1));
        final bottom  = img.getLuminance(gray.getPixel(x,     y + 1));
        final left    = img.getLuminance(gray.getPixel(x - 1, y    ));
        final right   = img.getLuminance(gray.getPixel(x + 1, y    ));
        final lap = (center * 4 - top - bottom - left - right).abs();
        variance += lap * lap;
        count++;
      }
    }

    if (count == 0) return 0.5;
    variance /= count;

    // Empirically: < 100 = very blurry, > 2000 = sharp
    return (math.log(variance + 1) / math.log(2001)).clamp(0.0, 1.0);
  }

  /// Mean luminance normalized to [0,1]
  static double _brightnessScore(img.Image image) {
    final gray = img.grayscale(image);
    double sum = 0;
    int count = 0;
    for (int y = 0; y < gray.height; y++) {
      for (int x = 0; x < gray.width; x++) {
        sum += img.getLuminance(gray.getPixel(x, y)) / 255.0;
        count++;
      }
    }
    if (count == 0) return 0.5;
    final mean = sum / count;

    // Ideal range: 0.25 – 0.75
    if (mean < 0.05)  return 0.1;   // Too dark
    if (mean > 0.95)  return 0.1;   // Overexposed
    if (mean < 0.20)  return 0.5;
    if (mean > 0.80)  return 0.5;
    // Bell curve peaking at 0.5
    return 1.0 - ((mean - 0.5).abs() * 2.5).clamp(0.0, 1.0);
  }

  /// Standard deviation of luminance
  static double _contrastScore(img.Image image) {
    final gray = img.grayscale(image);
    double sum = 0;
    int count = 0;
    final pixels = <double>[];
    for (int y = 0; y < gray.height; y++) {
      for (int x = 0; x < gray.width; x++) {
        final v = img.getLuminance(gray.getPixel(x, y)) / 255.0;
        pixels.add(v);
        sum += v;
        count++;
      }
    }
    if (count == 0) return 0.5;
    final mean = sum / count;
    double variance = 0;
    for (final p in pixels) {
      variance += (p - mean) * (p - mean);
    }
    variance /= count;
    final stdDev = math.sqrt(variance);

    // Ideal std dev: 0.12 – 0.30
    if (stdDev < 0.03) return 0.1;   // Very flat
    if (stdDev < 0.08) return 0.4;
    if (stdDev < 0.12) return 0.7;
    if (stdDev > 0.40) return 0.6;   // Possibly overexposed
    return 1.0;
  }

  /// Estimate noise via high-freq residuals
  static double _noiseScore(img.Image image) {
    final small = img.copyResize(image, width: 64);
    final gray  = img.grayscale(small);
    final w = gray.width;
    final h = gray.height;

    double diff = 0;
    int count = 0;
    for (int y = 0; y < h - 1; y++) {
      for (int x = 0; x < w - 1; x++) {
        final c = img.getLuminance(gray.getPixel(x, y)) / 255.0;
        final r = img.getLuminance(gray.getPixel(x + 1, y)) / 255.0;
        final b = img.getLuminance(gray.getPixel(x, y + 1)) / 255.0;
        diff += (c - r).abs() + (c - b).abs();
        count++;
      }
    }
    if (count == 0) return 0.5;
    final meanDiff = diff / count;

    // High diff = high noise. Ideal < 0.03
    if (meanDiff < 0.02) return 1.0;
    if (meanDiff < 0.05) return 0.8;
    if (meanDiff < 0.10) return 0.6;
    if (meanDiff < 0.15) return 0.4;
    return 0.2;
  }

  /// Check if image is not cropped/blank at edges
  static double _framingScore(img.Image image) {
    // Check corner luminance vs center
    final w = image.width;
    final h = image.height;
    if (w < 100 || h < 100) return 0.3;

    final cx = w ~/ 2;
    final cy = h ~/ 2;
    final centerLum = img.getLuminance(image.getPixel(cx, cy)) / 255.0;

    if (centerLum < 0.05) return 0.3; // Black center = bad framing

    // Check resolution adequacy
    if (w < 224 || h < 224) return 0.5;
    if (w >= 512 && h >= 512) return 1.0;
    return 0.8;
  }

  static String _primaryIssue(double blur, double brightness, double contrast,
      double noise, double framing) {
    final issues = <String, double>{
      'Too blurry. Hold the phone steady and tap the screen to focus before capturing.':
          blur,
      'Image is too dark. Move to a brighter area or use a flashlight.':
          brightness,
      'Poor contrast. Ensure the area is evenly lit.': contrast,
      'Too much noise/grain in the image. Ensure adequate lighting.': noise,
      'Poor framing. Center the eye or mouth within the guide circle.': framing,
    };

    double minScore = 1.0;
    String primaryIssue = '';
    for (final entry in issues.entries) {
      if (entry.value < minScore) {
        minScore = entry.value;
        primaryIssue = entry.key;
      }
    }
    return primaryIssue.isEmpty ? 'Image quality is acceptable.' : primaryIssue;
  }
}

// ─── Data Model ─────────────────────────────────────────────────────────────

class QualityResult {
  final double overallScore;
  final double blurScore;
  final double brightnessScore;
  final double contrastScore;
  final double noiseScore;
  final double framingScore;
  final String issueDescription;
  final bool   isAcceptable;

  const QualityResult({
    required this.overallScore,
    required this.blurScore,
    required this.brightnessScore,
    required this.contrastScore,
    required this.noiseScore,
    required this.framingScore,
    required this.issueDescription,
    required this.isAcceptable,
  });

  int get scorePercent => (overallScore * 100).round();

  String get label {
    if (overallScore >= 0.80) return 'Excellent';
    if (overallScore >= 0.70) return 'Good';
    if (overallScore >= 0.60) return 'Acceptable';
    if (overallScore >= 0.40) return 'Poor';
    return 'Very Poor';
  }

  String get labelEmoji {
    if (overallScore >= 0.80) return '✅';
    if (overallScore >= 0.60) return '⚠️';
    return '❌';
  }
}
