/// Local data model representing one completed screening session.
class ScreeningRecord {
  final int?   id;
  final String patientId;
  final int?   age;
  final String? sex;
  final String? riskFactors;
  final String screeningType; // 'eye' | 'oral'
  final String imagePath;
  final double qualityScore;
  final String riskLevel;     // 'low' | 'moderate' | 'high' | 'inconclusive'
  final double confidence;
  final String label;
  final String? description;
  final String? recommendation;
  final bool   isDemo;
  final String? heatmapPath;
  final DateTime createdAt;

  const ScreeningRecord({
    this.id,
    required this.patientId,
    this.age,
    this.sex,
    this.riskFactors,
    required this.screeningType,
    required this.imagePath,
    required this.qualityScore,
    required this.riskLevel,
    required this.confidence,
    required this.label,
    this.description,
    this.recommendation,
    this.isDemo = false,
    this.heatmapPath,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() => {
    'patient_id':     patientId,
    'age':            age,
    'sex':            sex,
    'risk_factors':   riskFactors,
    'screening_type': screeningType,
    'image_path':     imagePath,
    'quality_score':  qualityScore,
    'risk_level':     riskLevel,
    'confidence':     confidence,
    'label':          label,
    'description':    description,
    'recommendation': recommendation,
    'is_demo':        isDemo ? 1 : 0,
    'heatmap_path':   heatmapPath,
    'created_at':     createdAt.toIso8601String(),
  };

  static ScreeningRecord fromMap(Map<String, dynamic> map) => ScreeningRecord(
    id:             map['id'] as int?,
    patientId:      map['patient_id'] as String,
    age:            map['age'] as int?,
    sex:            map['sex'] as String?,
    riskFactors:    map['risk_factors'] as String?,
    screeningType:  map['screening_type'] as String,
    imagePath:      map['image_path'] as String,
    qualityScore:   (map['quality_score'] as num).toDouble(),
    riskLevel:      map['risk_level'] as String,
    confidence:     (map['confidence'] as num).toDouble(),
    label:          map['label'] as String,
    description:    map['description'] as String?,
    recommendation: map['recommendation'] as String?,
    isDemo:         (map['is_demo'] as int) == 1,
    heatmapPath:    map['heatmap_path'] as String?,
    createdAt:      DateTime.parse(map['created_at'] as String),
  );

  String get riskLevelLabel {
    switch (riskLevel) {
      case 'low':          return 'Low Risk';
      case 'moderate':     return 'Needs Attention';
      case 'high':         return 'High Risk';
      default:             return 'Inconclusive';
    }
  }

  bool get needsReferral => riskLevel == 'high' || riskLevel == 'moderate';
  int  get qualityPercent => (qualityScore * 100).round();
  int  get confidencePercent => (confidence * 100).round();
}
