import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../utils/app_theme.dart';
import '../database/database_service.dart';
import '../models/screening_record.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<ScreeningRecord> _records = [];
  bool _isLoading = true;
  String _filter = 'all'; // 'all', 'eye', 'oral', 'referral'
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadHistory() async {
    setState(() => _isLoading = true);
    final list = await DatabaseService.instance.getAllScreenings();
    if (mounted) {
      setState(() {
        _records = list;
        _isLoading = false;
      });
    }
  }

  List<ScreeningRecord> get _filteredRecords {
    return _records.where((r) {
      // Type / referral filter
      if (_filter == 'eye' && r.screeningType != 'eye') return false;
      if (_filter == 'oral' && r.screeningType != 'oral') return false;
      if (_filter == 'referral' && !r.needsReferral) return false;

      // Search query
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchPatient = r.patientId.toLowerCase().contains(q);
        final matchLabel = r.label.toLowerCase().contains(q);
        return matchPatient || matchLabel;
      }
      return true;
    }).toList();
  }

  Color _riskColor(String riskLevel) {
    switch (riskLevel) {
      case 'low':      return AppTheme.success;
      case 'moderate': return AppTheme.warning;
      case 'high':     return AppTheme.danger;
      default:         return AppTheme.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        title: const Text('Screening History'),
        leading: const BackButton(),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loadHistory,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search Bar & Filter Chips
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
              child: Column(
                children: [
                  TextField(
                    controller: _searchController,
                    onChanged: (val) => setState(() => _searchQuery = val.trim()),
                    decoration: InputDecoration(
                      hintText: 'Search by Patient ID or Finding...',
                      prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.textMuted),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear_rounded, size: 18),
                              onPressed: () {
                                _searchController.clear();
                                setState(() => _searchQuery = '');
                              },
                            )
                          : null,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                  ),

                  const SizedBox(height: 12),

                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildFilterChip('all', 'All Records (${_records.length})'),
                        const SizedBox(width: 8),
                        _buildFilterChip('referral', 'Referrals Only', icon: Icons.local_hospital_rounded),
                        const SizedBox(width: 8),
                        _buildFilterChip('eye', '👁 Eye DR'),
                        const SizedBox(width: 8),
                        _buildFilterChip('oral', '👄 Oral'),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const Divider(height: 16),

            // Records List
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                  : _filteredRecords.isEmpty
                      ? _buildEmptyState()
                      : ListView.separated(
                          padding: const EdgeInsets.all(20),
                          itemCount: _filteredRecords.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final record = _filteredRecords[index];
                            return _buildRecordCard(record, index);
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String key, String label, {IconData? icon}) {
    final isSelected = _filter == key;
    return ChoiceChip(
      avatar: icon != null
          ? Icon(
              icon,
              size: 14,
              color: isSelected ? Colors.white : AppTheme.textSecondary,
            )
          : null,
      label: Text(
        label,
        style: TextStyle(
          color: isSelected ? Colors.white : AppTheme.textSecondary,
          fontSize: 12,
          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
        ),
      ),
      selected: isSelected,
      onSelected: (val) {
        if (val) setState(() => _filter = key);
      },
      selectedColor: AppTheme.primary,
      backgroundColor: AppTheme.cardDark,
      side: BorderSide(color: isSelected ? AppTheme.primary : AppTheme.cardBorder),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    );
  }

  Widget _buildRecordCard(ScreeningRecord record, int index) {
    final color = _riskColor(record.riskLevel);
    final dateStr = DateFormat('MMM dd, yyyy • HH:mm').format(record.createdAt);
    final isEye = record.screeningType == 'eye';

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () {
        // Open result view for historical item
        Navigator.pushNamed(
          context,
          '/result',
          arguments: {
            'result': {
              'id': record.id,
              'riskLevel': record.riskLevel,
              'confidence': record.confidence,
              'label': record.label,
              'description': record.description ?? '',
              'recommendation': record.recommendation ?? '',
              'isDemoData': record.isDemo,
              'imagePath': record.imagePath,
              'heatmapPath': record.heatmapPath,
              'screeningType': record.screeningType,
              'qualityScore': record.qualityScore,
              'patientId': record.patientId,
              'createdAt': record.createdAt.toIso8601String(),
            },
          },
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.cardDark,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.cardBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: (isEye ? AppTheme.primary : const Color(0xFF7C3AED)).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    isEye ? '👁 EYE' : '👄 ORAL',
                    style: TextStyle(
                      color: isEye ? AppTheme.primaryLight : const Color(0xFFA78BFA),
                      fontWeight: FontWeight.w700,
                      fontSize: 10,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  'Patient: ${record.patientId}',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                ),
                if (record.isDemo) ...[
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.info.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'DEMO',
                      style: TextStyle(color: AppTheme.info, fontSize: 9, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    record.riskLevelLabel,
                    style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 10),

            Text(
              record.label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimary,
                  ),
            ),

            const SizedBox(height: 8),

            Row(
              children: [
                Text(
                  dateStr,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.textMuted),
                ),
                const Spacer(),
                Text(
                  'Conf: ${record.confidencePercent}% • Quality: ${record.qualityPercent}%',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: AppTheme.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: (index * 40).ms);
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.inventory_2_outlined, size: 56, color: AppTheme.textMuted),
            const SizedBox(height: 16),
            Text(
              'No Screenings Found',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 6),
            Text(
              _searchQuery.isNotEmpty || _filter != 'all'
                  ? 'Try adjusting your search query or filters.'
                  : 'Screenings saved offline during health camps will appear here.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}
