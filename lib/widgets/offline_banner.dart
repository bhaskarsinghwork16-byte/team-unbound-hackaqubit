import 'package:flutter/material.dart';
import '../utils/app_theme.dart';

class OfflineBanner extends StatelessWidget {
  final bool isOnline;

  const OfflineBanner({
    super.key,
    required this.isOnline,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: isOnline
            ? AppTheme.primary.withOpacity(0.08)
            : AppTheme.success.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isOnline
              ? AppTheme.primary.withOpacity(0.25)
              : AppTheme.success.withOpacity(0.3),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isOnline ? AppTheme.primary : AppTheme.success,
              boxShadow: [
                BoxShadow(
                  color: (isOnline ? AppTheme.primary : AppTheme.success)
                      .withOpacity(0.5),
                  blurRadius: 6,
                  spreadRadius: 2,
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              isOnline
                  ? 'Online — Local AI active'
                  : '● Offline — Screening fully available',
              style: TextStyle(
                color: isOnline ? AppTheme.primaryLight : AppTheme.success,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Icon(
            isOnline ? Icons.cloud_done_outlined : Icons.offline_bolt_rounded,
            color: isOnline ? AppTheme.primaryLight : AppTheme.success,
            size: 18,
          ),
        ],
      ),
    );
  }
}
