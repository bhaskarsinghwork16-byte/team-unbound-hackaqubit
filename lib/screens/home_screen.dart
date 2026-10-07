import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';

import '../utils/app_theme.dart';
import '../database/database_service.dart';
import '../services/connectivity_service.dart';
import '../widgets/offline_banner.dart';
import '../widgets/stat_card.dart';
import '../widgets/screening_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _screeningsToday = 0;
  int _referralsToday  = 0;
  bool _isOnline       = false;
  StreamSubscription<bool>? _connectivitySub;

  @override
  void initState() {
    super.initState();
    _loadStats();
    _isOnline = ConnectivityService.instance.isOnline;
    _connectivitySub = ConnectivityService.instance.statusStream.listen((online) {
      if (mounted) setState(() => _isOnline = online);
    });
  }

  Future<void> _loadStats() async {
    final screenings = await DatabaseService.instance.getTodayScreeningCount();
    final referrals  = await DatabaseService.instance.getTodayReferralCount();
    if (mounted) {
      setState(() {
        _screeningsToday = screenings;
        _referralsToday  = referrals;
      });
    }
  }

  @override
  void dispose() {
    _connectivitySub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final greeting = _greeting(now.hour);
    final dateStr  = DateFormat('EEEE, d MMMM').format(now);

    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppTheme.primary,
          backgroundColor: AppTheme.cardDark,
          onRefresh: _loadStats,
          child: CustomScrollView(
            slivers: [
              // ── App Bar ───────────────────────────────────────────────
              SliverAppBar(
                pinned: false,
                floating: true,
                backgroundColor: AppTheme.backgroundDark,
                automaticallyImplyLeading: false,
                toolbarHeight: 72,
                title: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(
                          colors: AppTheme.eyeGradient,
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: const Icon(
                        Icons.health_and_safety_rounded,
                        color: Colors.white,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'HealthScreen AI',
                          style: Theme.of(context).textTheme.titleLarge
                              ?.copyWith(fontWeight: FontWeight.w800),
                        ),
                        Text(
                          dateStr,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ],
                ),
                actions: [
                  IconButton(
                    icon: const Icon(Icons.history_rounded),
                    onPressed: () => Navigator.pushNamed(context, '/history')
                        .then((_) => _loadStats()),
                    tooltip: 'Screening History',
                  ),
                  IconButton(
                    icon: const Icon(Icons.settings_rounded),
                    onPressed: () => Navigator.pushNamed(context, '/settings'),
                    tooltip: 'Settings',
                  ),
                  const SizedBox(width: 8),
                ],
              ),

              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [

                      // ── Offline Banner ─────────────────────────────────
                      OfflineBanner(isOnline: _isOnline)
                          .animate().fadeIn(duration: 400.ms),

                      const SizedBox(height: 24),

                      // ── Greeting ───────────────────────────────────────
                      Text(
                        greeting,
                        style: Theme.of(context).textTheme.bodyMedium
                            ?.copyWith(color: AppTheme.textSecondary),
                      ).animate().fadeIn(delay: 100.ms),
                      const SizedBox(height: 4),
                      Text(
                        'What screening\nwould you like to run?',
                        style: Theme.of(context).textTheme.displaySmall
                            ?.copyWith(height: 1.2),
                      ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2, end: 0),

                      const SizedBox(height: 24),

                      // ── Stats Row ──────────────────────────────────────
                      Row(
                        children: [
                          Expanded(
                            child: StatCard(
                              icon: Icons.monitor_heart_rounded,
                              label: 'Screenings Today',
                              value: '$_screeningsToday',
                              color: AppTheme.primary,
                            ).animate().fadeIn(delay: 300.ms).slideX(begin: -0.2),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: StatCard(
                              icon: Icons.local_hospital_rounded,
                              label: 'Referrals',
                              value: '$_referralsToday',
                              color: AppTheme.warning,
                            ).animate().fadeIn(delay: 400.ms).slideX(begin: 0.2),
                          ),
                        ],
                      ),

                      const SizedBox(height: 32),

                      // ── Section header ─────────────────────────────────
                      Text(
                        'Select Screening Type',
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: AppTheme.textSecondary,
                          letterSpacing: 0.8,
                          fontSize: 13,
                        ),
                      ).animate().fadeIn(delay: 450.ms),

                      const SizedBox(height: 16),

                      // ── Eye Screening Card ─────────────────────────────
                      ScreeningCard(
                        id: 'eye_screening_card',
                        icon: Icons.visibility_rounded,
                        title: 'Eye Screening',
                        subtitle: 'Diabetic Retinopathy',
                        description:
                            'AI-powered preliminary screening for diabetic retinopathy using retinal images.',
                        gradient: AppTheme.eyeGradient,
                        onStart: () => Navigator.pushNamed(
                          context,
                          '/patient-info',
                          arguments: {'screeningType': 'eye'},
                        ).then((_) => _loadStats()),
                        tags: const ['Retinal', 'Offline', 'No Equipment'],
                      ).animate().fadeIn(delay: 500.ms).slideY(begin: 0.2, end: 0),

                      const SizedBox(height: 16),

                      // ── Oral Screening Card ────────────────────────────
                      ScreeningCard(
                        id: 'oral_screening_card',
                        icon: Icons.sentiment_satisfied_alt_rounded,
                        title: 'Oral Screening',
                        subtitle: 'Oral Lesion Detection',
                        description:
                            'AI-assisted preliminary screening for suspicious oral lesions using smartphone camera.',
                        gradient: AppTheme.oralGradient,
                        onStart: () => Navigator.pushNamed(
                          context,
                          '/patient-info',
                          arguments: {'screeningType': 'oral'},
                        ).then((_) => _loadStats()),
                        tags: const ['Oral', 'Offline', 'Explainable AI'],
                      ).animate().fadeIn(delay: 650.ms).slideY(begin: 0.2, end: 0),

                      const SizedBox(height: 24),

                      // ── Demo mode banner ───────────────────────────────
                      _DemoModeBanner(),

                      const SizedBox(height: 32),

                      // ── Disclaimer ─────────────────────────────────────
                      _DisclaimerCard(),

                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _greeting(int hour) {
    if (hour < 12) return 'Good morning 👋';
    if (hour < 17) return 'Good afternoon 👋';
    return 'Good evening 👋';
  }
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _DemoModeBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: () => Navigator.pushNamed(context, '/settings'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.info.withOpacity(0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.info.withOpacity(0.25)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTheme.info.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.play_circle_outline_rounded,
                  color: AppTheme.info, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Demo Mode Available',
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: AppTheme.info)),
                  const SizedBox(height: 2),
                  Text('6 sample scenarios with anonymized data',
                      style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios_rounded,
                size: 14, color: AppTheme.textMuted),
          ],
        ),
      ),
    );
  }
}

class _DisclaimerCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.cardBorder),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info_outline_rounded,
              color: AppTheme.textMuted, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'HealthScreen AI provides preliminary screening support only. '
              'Results do not replace professional medical diagnosis. '
              'All suspicious results must be evaluated by a qualified healthcare professional.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppTheme.textMuted,
                    height: 1.5,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
