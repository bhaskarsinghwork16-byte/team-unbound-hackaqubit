import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:image/image.dart' as img;

class DemoScenario {
  final int id;
  final String title;
  final String subtitle;
  final String screeningType; // 'eye' or 'oral'
  final String expectedOutcome;
  final String description;
  final bool simulatePoorQuality;
  final bool simulateSuspicious;
  final bool simulateLowConfidence;

  const DemoScenario({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.screeningType,
    required this.expectedOutcome,
    required this.description,
    this.simulatePoorQuality = false,
    this.simulateSuspicious = false,
    this.simulateLowConfidence = false,
  });
}

class DemoService {
  static const List<DemoScenario> scenarios = [
    DemoScenario(
      id: 1,
      title: 'Demo 1: Normal Retinal Screening',
      subtitle: 'Clear fundus image • High quality',
      screeningType: 'eye',
      expectedOutcome: 'Low Risk — No obvious DR',
      description: 'Tests standard clear retinal capture. Demonstrates passing quality check and negative DR screening.',
    ),
    DemoScenario(
      id: 2,
      title: 'Demo 2: Poor Retinal Image Rejection',
      subtitle: 'Severely blurred & underexposed eye capture',
      screeningType: 'eye',
      expectedOutcome: 'Quality Rejection — Retake Prompt',
      description: 'Tests quality triage defense. Verifies disease model is safely blocked when image fails clarity thresholds.',
      simulatePoorQuality: true,
    ),
    DemoScenario(
      id: 3,
      title: 'Demo 3: Suspicious Retinal Image (DR)',
      subtitle: 'Microaneurysms & exudates present',
      screeningType: 'eye',
      expectedOutcome: 'High Risk — Urgent Referral',
      description: 'Tests positive diabetic retinopathy case with Grad-CAM heatmap highlighting macular/retinal lesions.',
      simulateSuspicious: true,
    ),
    DemoScenario(
      id: 4,
      title: 'Demo 4: Healthy Oral Mucosa',
      subtitle: 'Clear buccal / tongue view',
      screeningType: 'oral',
      expectedOutcome: 'Low Risk — No suspicious lesion',
      description: 'Tests oral screening baseline. Validates normal oral mucosa without pathological flags.',
    ),
    DemoScenario(
      id: 5,
      title: 'Demo 5: Suspicious Oral Lesion',
      subtitle: 'Erythroplakia / Leukoplakia signs',
      screeningType: 'oral',
      expectedOutcome: 'High Risk — Clinical Referral',
      description: 'Tests oral lesion triage. Triggers urgent dental/oncological clinical referral recommendation with visual explanation.',
      simulateSuspicious: true,
    ),
    DemoScenario(
      id: 6,
      title: 'Demo 6: Offline Health-Camp Screening',
      subtitle: 'Airplane mode / Zero network connectivity',
      screeningType: 'eye',
      expectedOutcome: '100% Local Inference & Offline SQLite Save',
      description: 'Proves complete offline autonomy. Image quality analysis, CNN inference, and SQLite storage execute strictly on-device.',
    ),
  ];

  /// Generates a test JPEG file on disk for the demo scenario
  static Future<String> generateDemoImage(DemoScenario scenario) async {
    final tempDir = await getTemporaryDirectory();
    final filePath = '${tempDir.path}/demo_sample_${scenario.id}.jpg';

    // Create a 300x300 procedural medical-like demonstration image
    final image = img.Image(width: 300, height: 300);

    final isEye = scenario.screeningType == 'eye';

    if (scenario.simulatePoorQuality) {
      // Extremely low brightness, heavy blur simulation
      for (int y = 0; y < 300; y++) {
        for (int x = 0; x < 300; x++) {
          image.setPixelRgba(x, y, 20, 15, 15, 255);
        }
      }
    } else if (isEye) {
      // Retinal fundus disc style (orange-red disk with darker background)
      for (int y = 0; y < 300; y++) {
        for (int x = 0; x < 300; x++) {
          final dx = x - 150;
          final dy = y - 150;
          final dist = dx * dx + dy * dy;
          if (dist < 130 * 130) {
            // Retinal interior
            final r = 190 + (x % 20);
            final g = 70 + (y % 15);
            final b = 40;
            image.setPixelRgba(x, y, r.clamp(0, 255), g.clamp(0, 255), b, 255);
          } else {
            image.setPixelRgba(x, y, 10, 10, 10, 255);
          }
        }
      }
    } else {
      // Oral mucosal style (pinkish flesh tone with oral cavity structures)
      for (int y = 0; y < 300; y++) {
        for (int x = 0; x < 300; x++) {
          final r = 210 + (x % 30);
          final g = 110 + (y % 20);
          final b = 130;
          image.setPixelRgba(x, y, r.clamp(0, 255), g.clamp(0, 255), b, 255);
        }
      }
    }

    final bytes = img.encodeJpg(image, quality: 90);
    final file = File(filePath);
    await file.writeAsBytes(bytes);
    return file.path;
  }
}
