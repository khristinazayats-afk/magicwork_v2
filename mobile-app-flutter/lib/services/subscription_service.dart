import 'package:purchases_flutter/purchases_flutter.dart';
import 'package:flutter/foundation.dart';

class SubscriptionService {
  static const String _revenueCatApiKey = String.fromEnvironment(
    'REVENUECAT_API_KEY',
    defaultValue: '',
  );

  static const String _apiKeyAndroid = String.fromEnvironment(
    'REVENUECAT_API_KEY_ANDROID',
    defaultValue: '',
  );

  static const String _apiKeyiOS = String.fromEnvironment(
    'REVENUECAT_API_KEY_IOS',
    defaultValue: '',
  );

  bool _isInitialized = false;
  CustomerInfo? _customerInfo;
  List<Package>? _packages;

  bool get isInitialized => _isInitialized;
  CustomerInfo? get customerInfo => _customerInfo;
  List<Package>? get packages => _packages;

  /// Initialize RevenueCat
  Future<void> initialize(String? userId) async {
    if (_isInitialized) return;

    try {
      // Get API key based on platform
      final apiKey = defaultTargetPlatform == TargetPlatform.android
          ? _apiKeyAndroid
          : _apiKeyiOS;

      if (apiKey.isEmpty) {
        debugPrint('RevenueCat API key not configured');
        return;
      }

      // Configure Purchases SDK
      await Purchases.configure(
        PurchasesConfiguration(apiKey),
      );

      // Set user ID if available
      if (userId != null && userId.isNotEmpty) {
        await Purchases.logIn(userId);
      }

      _isInitialized = true;

      // Fetch offerings
      await _loadOfferings();
    } catch (e) {
      debugPrint('RevenueCat initialization error: $e');
    }
  }

  /// Load offerings and packages
  Future<void> _loadOfferings() async {
    try {
      final offerings = await Purchases.getOfferings();

      if (offerings.current != null) {
        _packages = offerings.current!.availablePackages;
      }
    } catch (e) {
      debugPrint('Error loading offerings: $e');
    }
  }

  /// Purchase a package
  Future<bool> purchasePackage(Package package) async {
    try {
      final customerInfo = await Purchases.purchasePackage(package);
      _customerInfo = customerInfo;

      debugPrint('Purchase successful: ${package.identifier}');
      return true;
    } catch (e) {
      debugPrint('Purchase error: $e');
      return false;
    }
  }

  /// Restore purchases
  Future<bool> restorePurchases() async {
    try {
      final customerInfo = await Purchases.restorePurchases();
      _customerInfo = customerInfo;

      debugPrint('Purchases restored successfully');
      return true;
    } catch (e) {
      debugPrint('Error restoring purchases: $e');
      return false;
    }
  }

  /// Check if user is premium
  bool get isPremium {
    if (_customerInfo == null) return false;
    return _customerInfo!.entitlements.active.isNotEmpty;
  }

  /// Get active entitlements
  List<String> get activeEntitlements {
    if (_customerInfo == null) return [];
    return _customerInfo!.entitlements.active.keys.toList();
  }

  /// Get subscription status
  bool get hasActiveSubscription {
    if (_customerInfo == null) return false;
    return _customerInfo!.allPurchasedProductIds.isNotEmpty;
  }

  /// Fetch current customer info
  Future<void> refreshCustomerInfo() async {
    try {
      _customerInfo = await Purchases.getCustomerInfo();
    } catch (e) {
      debugPrint('Error refreshing customer info: $e');
    }
  }

  /// Log in user
  Future<void> logInUser(String userId) async {
    try {
      _customerInfo = await Purchases.logIn(userId);
    } catch (e) {
      debugPrint('Error logging in user: $e');
    }
  }

  /// Log out user
  Future<void> logOutUser() async {
    try {
      await Purchases.logOut();
      _customerInfo = null;
    } catch (e) {
      debugPrint('Error logging out: $e');
    }
  }
}
