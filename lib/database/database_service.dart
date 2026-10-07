import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';

import '../models/screening_record.dart';

/// Singleton SQLite service for offline-first local storage.
class DatabaseService {
  DatabaseService._();
  static final DatabaseService instance = DatabaseService._();

  Database? _db;

  // ─── Initialisation ──────────────────────────────────────────────────────
  Future<void> init() async {
    if (_db != null) return;
    final docsDir = await getApplicationDocumentsDirectory();
    final dbPath  = join(docsDir.path, 'healthscreen.db');

    _db = await openDatabase(
      dbPath,
      version: 1,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE screenings (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id    TEXT    NOT NULL,
        age           INTEGER,
        sex           TEXT,
        risk_factors  TEXT,
        screening_type TEXT   NOT NULL,
        image_path    TEXT    NOT NULL,
        quality_score REAL    NOT NULL,
        risk_level    TEXT    NOT NULL,
        confidence    REAL    NOT NULL,
        label         TEXT    NOT NULL,
        description   TEXT,
        recommendation TEXT,
        is_demo       INTEGER NOT NULL DEFAULT 0,
        heatmap_path  TEXT,
        created_at    TEXT    NOT NULL
      )
    ''');

    await db.execute('''
      CREATE INDEX idx_created_at ON screenings(created_at DESC)
    ''');
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    // Add migration logic here for future schema versions
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  Future<int> insertScreening(ScreeningRecord record) async {
    await init();
    return _db!.insert('screenings', record.toMap());
  }

  Future<List<ScreeningRecord>> getAllScreenings() async {
    await init();
    final maps = await _db!.query(
      'screenings',
      orderBy: 'created_at DESC',
      limit: 500,
    );
    return maps.map(ScreeningRecord.fromMap).toList();
  }

  Future<ScreeningRecord?> getScreeningById(int id) async {
    await init();
    final maps = await _db!.query(
      'screenings',
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );
    if (maps.isEmpty) return null;
    return ScreeningRecord.fromMap(maps.first);
  }

  Future<List<ScreeningRecord>> getScreeningsForToday() async {
    await init();
    final today = DateTime.now();
    final start = DateTime(today.year, today.month, today.day).toIso8601String();
    final end   = DateTime(today.year, today.month, today.day, 23, 59, 59).toIso8601String();
    final maps = await _db!.query(
      'screenings',
      where: 'created_at BETWEEN ? AND ?',
      whereArgs: [start, end],
      orderBy: 'created_at DESC',
    );
    return maps.map(ScreeningRecord.fromMap).toList();
  }

  Future<int> getTodayScreeningCount() async {
    final records = await getScreeningsForToday();
    return records.length;
  }

  Future<int> getTodayReferralCount() async {
    final records = await getScreeningsForToday();
    return records.where((r) => r.riskLevel == 'high' || r.riskLevel == 'moderate').length;
  }

  Future<int> deleteScreening(int id) async {
    await init();
    return _db!.delete('screenings', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> deleteAllScreenings() async {
    await init();
    await _db!.delete('screenings');
  }

  Future<void> close() async {
    await _db?.close();
    _db = null;
  }
}
