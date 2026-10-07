import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';

/// Monitors network connectivity state.
/// HealthScreen AI is offline-first: connectivity is shown as informational only.
class ConnectivityService {
  ConnectivityService._();
  static final ConnectivityService instance = ConnectivityService._();

  final _connectivity = Connectivity();
  final _statusController = StreamController<bool>.broadcast();

  bool _isOnline = false;
  bool get isOnline => _isOnline;

  Stream<bool> get statusStream => _statusController.stream;

  Future<void> init() async {
    final result = await _connectivity.checkConnectivity();
    _isOnline = _isConnected(result);

    _connectivity.onConnectivityChanged.listen((result) {
      _isOnline = _isConnected(result);
      _statusController.add(_isOnline);
      debugPrint('[Connectivity] Status changed: ${_isOnline ? "Online" : "Offline"}');
    });
  }

  bool _isConnected(List<ConnectivityResult> result) {
    return result.any((r) =>
      r == ConnectivityResult.wifi ||
      r == ConnectivityResult.mobile ||
      r == ConnectivityResult.ethernet,
    );
  }

  void dispose() {
    _statusController.close();
  }
}
