import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // ─── Color Palette ───────────────────────────────────────────────────────
  static const Color backgroundDark   = Color(0xFF0A0E1A);
  static const Color surfaceDark      = Color(0xFF111827);
  static const Color cardDark         = Color(0xFF1C2333);
  static const Color cardBorder       = Color(0xFF2D3748);

  static const Color primary          = Color(0xFF3B82F6); // Electric blue
  static const Color primaryLight     = Color(0xFF60A5FA);
  static const Color primaryDark      = Color(0xFF1D4ED8);

  static const Color success          = Color(0xFF10B981); // Emerald green
  static const Color successLight     = Color(0xFFD1FAE5);
  static const Color warning          = Color(0xFFF59E0B); // Amber
  static const Color warningLight     = Color(0xFFFEF3C7);
  static const Color danger           = Color(0xFFEF4444); // Red
  static const Color dangerLight      = Color(0xFFFEE2E2);
  static const Color info             = Color(0xFF8B5CF6); // Violet

  static const Color textPrimary      = Color(0xFFF8FAFC);
  static const Color textSecondary    = Color(0xFF94A3B8);
  static const Color textMuted        = Color(0xFF64748B);
  static const Color textInverse      = Color(0xFF0A0E1A);

  static const Color divider          = Color(0xFF1E2A3B);

  // Eye / DR gradient
  static const List<Color> eyeGradient = [Color(0xFF1D4ED8), Color(0xFF3B82F6)];
  // Oral gradient  
  static const List<Color> oralGradient = [Color(0xFF7C3AED), Color(0xFFDB2777)];
  // Success gradient
  static const List<Color> successGradient = [Color(0xFF059669), Color(0xFF10B981)];
  // Warning gradient
  static const List<Color> warningGradient = [Color(0xFFD97706), Color(0xFFF59E0B)];
  // Danger gradient
  static const List<Color> dangerGradient  = [Color(0xFFDC2626), Color(0xFFEF4444)];

  // ─── Typography ──────────────────────────────────────────────────────────
  static TextTheme get textTheme => TextTheme(
    displayLarge:  _manrope(32, FontWeight.w800, textPrimary),
    displayMedium: _manrope(28, FontWeight.w700, textPrimary),
    displaySmall:  _manrope(24, FontWeight.w700, textPrimary),
    headlineLarge: _manrope(22, FontWeight.w700, textPrimary),
    headlineMedium:_manrope(20, FontWeight.w600, textPrimary),
    headlineSmall: _manrope(18, FontWeight.w600, textPrimary),
    titleLarge:    _manrope(16, FontWeight.w600, textPrimary),
    titleMedium:   _manrope(15, FontWeight.w500, textPrimary),
    titleSmall:    _manrope(14, FontWeight.w500, textSecondary),
    bodyLarge:     _manrope(16, FontWeight.w400, textPrimary),
    bodyMedium:    _manrope(14, FontWeight.w400, textSecondary),
    bodySmall:     _manrope(12, FontWeight.w400, textMuted),
    labelLarge:    _manrope(14, FontWeight.w600, textPrimary),
    labelMedium:   _manrope(12, FontWeight.w600, textSecondary),
    labelSmall:    _manrope(11, FontWeight.w500, textMuted),
  );

  static TextStyle _manrope(double size, FontWeight weight, Color color) =>
      GoogleFonts.manrope(fontSize: size, fontWeight: weight, color: color);

  // ─── Dark Theme ──────────────────────────────────────────────────────────
  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: backgroundDark,
    colorScheme: const ColorScheme.dark(
      primary:   primary,
      secondary: info,
      surface:   surfaceDark,
      error:     danger,
    ),
    textTheme: textTheme,
    cardTheme: CardThemeData(
      color: cardDark,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: cardBorder, width: 1),
      ),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: backgroundDark,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: _manrope(18, FontWeight.w700, textPrimary),
      iconTheme: const IconThemeData(color: textPrimary),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 56),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: _manrope(15, FontWeight.w600, Colors.white),
        elevation: 0,
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: primary,
        minimumSize: const Size(double.infinity, 56),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        side: const BorderSide(color: primary, width: 1.5),
        textStyle: _manrope(15, FontWeight.w600, primary),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: cardDark,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: cardBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: cardBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primary, width: 2),
      ),
      labelStyle: _manrope(14, FontWeight.w500, textSecondary),
      hintStyle: _manrope(14, FontWeight.w400, textMuted),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
    dividerTheme: const DividerThemeData(color: divider, thickness: 1),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: cardDark,
      contentTextStyle: _manrope(14, FontWeight.w500, textPrimary),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      behavior: SnackBarBehavior.floating,
    ),
  );
}
