import 'package:flutter/foundation.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import '../services/subscription_service.dart';
import '../services/amplitude_analytics_service.dart';

class SubscriptionProvider extends ChangeNotifier {
  final SubscriptionService _subscriptionService = SubscriptionService();
  final AmplitudeAnalyticsService _analyticsService =
      AmplitudeAnalyticsService();

  bool _isLoading = false;
  bool _isPremium = false;
  List<Package> _packages = [];
  String? _selectedPackageId;
  String? _error;

  bool get isLoading => _isLoading;
  bool get isPremium => _isPremium;
  List<Package> get packages => _packages;
  String? get selectedPackageId => _selectedPackageId;
  String? get error => _error;

  /// Initialize subscription system
  Future<void> initialize(String? userId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _subscriptionService.initialize(userId);
      _packages = _subscriptionService.packages ?? [];
      _isPremium = _subscriptionService.isPremium;

      notifyListeners();
    } catch (e) {
      _error = 'Failed to initialize subscriptions: $e';
      notifyListeners();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Purchase a package
  Future<bool> purchasePackage(Package package) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Track subscription event
      await _analyticsService.trackSubscriptionEvent(
        'purchase_initiated',
        packageId: package.identifier,
      );

      final success =
          await _subscriptionService.purchasePackage(package);

      if (success) {
        _isPremium = _subscriptionService.isPremium;
        _selectedPackageId = package.identifier;

        // Track successful purchase
        await _analyticsService.trackSubscriptionEvent(
          'purchase_successful',
          packageId: package.identifier,
        );
      } else {
        _error = 'Purchase failed';
        await _analyticsService.trackSubscriptionEvent('purchase_failed',
            packageId: package.identifier);
      }

      notifyListeners();
      return success;
    } catch (e) {
      _error = 'Purchase error: $e';
      await _analyticsService.trackSubscriptionEvent('purchase_error',
          packageId: package.identifier);
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Restore purchases
  Future<bool> restorePurchases() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final success = await _subscriptionService.restorePurchases();

      if (success) {
        _isPremium = _subscriptionService.isPremium;
        await _analyticsService
            .trackSubscriptionEvent('purchases_restored');
      } else {
        _error = 'Failed to restore purchases';
      }

      notifyListeners();
      return success;
    } catch (e) {
      _error = 'Restore error: $e';
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Refresh subscription status
  Future<void> refreshSubscriptionStatus() async {
    try {
      await _subscriptionService.refreshCustomerInfo();
      _isPremium = _subscriptionService.isPremium;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to refresh subscription: $e';
      notifyListeners();
    }
  }

  /// Get subscription details
  String? getSubscriptionDetails() {
    if (!_isPremium) return null;

    final customerInfo = _subscriptionService.customerInfo;
    if (customerInfo == null) return null;

    final entitlements = customerInfo.entitlements.active.values.toList();
    if (entitlements.isEmpty) return null;

    final entitlement = entitlements.first;
    return 'Premium - Expires: ${entitlement.expirationDate}';
  }

  /// Check if specific feature is available
  bool hasFeature(String featureName) {
    if (!_isPremium) return false;
    return _subscriptionService.activeEntitlements.contains(featureName);
  }

  /// Set selected package
  void setSelectedPackage(String packageId) {
    _selectedPackageId = packageId;
    notifyListeners();
  }

  /// Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
