import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';

import 'screens/splash_screen.dart';
import 'screens/home_screen.dart';
import 'screens/screening_selection_screen.dart';
import 'screens/patient_info_screen.dart';
import 'screens/camera_screen.dart';
import 'screens/image_quality_screen.dart';
import 'screens/processing_screen.dart';
import 'screens/result_screen.dart';
import 'screens/analysis_screen.dart';
import 'screens/history_screen.dart';
import 'screens/settings_screen.dart';
import 'services/database_service.dart';
import 'utils/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Lock to portrait mode for consistent UX
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: AppTheme.backgroundDark,
    ),
  );

  // Initialize database
  await DatabaseService.instance.init();

  runApp(const HealthScreenApp());
}

class HealthScreenApp extends StatelessWidget {
  const HealthScreenApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HealthScreen AI',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      initialRoute: '/splash',
      routes: {
        '/splash': (context) => const SplashScreen(),
        '/home': (context) => const HomeScreen(),
        '/screening-selection': (context) => const ScreeningSelectionScreen(),
        '/history': (context) => const HistoryScreen(),
        '/settings': (context) => const SettingsScreen(),
      },
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case '/patient-info':
            final args = settings.arguments as Map<String, dynamic>;
            return MaterialPageRoute(
              builder: (context) => PatientInfoScreen(
                screeningType: args['screeningType'] as String,
              ),
            );
          case '/camera':
            final args = settings.arguments as Map<String, dynamic>;
            return MaterialPageRoute(
              builder: (context) => CameraScreen(
                screeningType: args['screeningType'] as String,
                patientData: args['patientData'] as Map<String, dynamic>,
              ),
            );
          case '/image-quality':
            final args = settings.arguments as Map<String, dynamic>;
            return MaterialPageRoute(
              builder: (context) => ImageQualityScreen(
                imagePath: args['imagePath'] as String,
                screeningType: args['screeningType'] as String,
                patientData: args['patientData'] as Map<String, dynamic>,
              ),
            );
          case '/processing':
            final args = settings.arguments as Map<String, dynamic>;
            return MaterialPageRoute(
              builder: (context) => ProcessingScreen(
                imagePath: args['imagePath'] as String,
                screeningType: args['screeningType'] as String,
                patientData: args['patientData'] as Map<String, dynamic>,
                qualityScore: args['qualityScore'] as double,
              ),
            );
          case '/result':
            final args = settings.arguments as Map<String, dynamic>;
            return MaterialPageRoute(
              builder: (context) => ResultScreen(
                result: args['result'] as Map<String, dynamic>,
              ),
            );
          case '/analysis':
            final args = settings.arguments as Map<String, dynamic>;
            return MaterialPageRoute(
              builder: (context) => AnalysisScreen(
                result: args['result'] as Map<String, dynamic>,
              ),
            );
          default:
            return MaterialPageRoute(
              builder: (context) => const HomeScreen(),
            );
        }
      },
    );
  }
}
