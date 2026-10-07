import 'package:flutter/material.dart';
import '../utils/app_theme.dart';

/// Camera viewfinder overlay painter that renders the circular target guide
/// and alignment ticks for eye or oral positioning.
class CameraGuideOverlay extends StatelessWidget {
  final bool isEye;
  final double pulseValue;

  const CameraGuideOverlay({
    super.key,
    required this.isEye,
    required this.pulseValue,
  });

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: CustomPaint(
        size: Size.infinite,
        painter: _OverlayPainter(
          isEye: isEye,
          pulse: pulseValue,
        ),
      ),
    );
  }
}

class _OverlayPainter extends CustomPainter {
  final bool isEye;
  final double pulse;

  _OverlayPainter({required this.isEye, required this.pulse});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2 - 30);
    final radius = isEye ? 115.0 : 135.0;

    // Darkened semi-transparent vignette outside the target ring
    final backgroundPath = Path()
      ..addRect(Rect.fromLTWH(0, 0, size.width, size.height));
    final circlePath = Path()
      ..addOval(Rect.fromCircle(center: center, radius: radius));
    final vignettePath = Path.combine(
      PathOperation.difference,
      backgroundPath,
      circlePath,
    );

    final vignettePaint = Paint()
      ..color = Colors.black.withOpacity(0.45)
      ..style = PaintingStyle.fill;
    canvas.drawPath(vignettePath, vignettePaint);

    // Guide ring outline with glowing pulse
    final glowPaint = Paint()
      ..color = (isEye ? AppTheme.primary : const Color(0xFF8B5CF6))
          .withOpacity(0.25 + pulse * 0.25)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 5.0 + pulse * 2.0
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);
    canvas.drawCircle(center, radius, glowPaint);

    final ringPaint = Paint()
      ..color = Colors.white.withOpacity(0.85)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;
    canvas.drawCircle(center, radius, ringPaint);

    // Reticle crosshair ticks
    final tickPaint = Paint()
      ..color = Colors.white.withOpacity(0.9)
      ..strokeWidth = 3.0
      ..strokeCap = StrokeCap.round;

    const tickLength = 16.0;
    // Top
    canvas.drawLine(Offset(center.dx, center.dy - radius - 5),
        Offset(center.dx, center.dy - radius - 5 - tickLength), tickPaint);
    // Bottom
    canvas.drawLine(Offset(center.dx, center.dy + radius + 5),
        Offset(center.dx, center.dy + radius + 5 + tickLength), tickPaint);
    // Left
    canvas.drawLine(Offset(center.dx - radius - 5, center.dy),
        Offset(center.dx - radius - 5 - tickLength, center.dy), tickPaint);
    // Right
    canvas.drawLine(Offset(center.dx + radius + 5, center.dy),
        Offset(center.dx + radius + 5 + tickLength, center.dy), tickPaint);
  }

  @override
  bool shouldRepaint(covariant _OverlayPainter oldDelegate) {
    return oldDelegate.pulse != pulse || oldDelegate.isEye != isEye;
  }
}
