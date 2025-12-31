import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import '../providers/subscription_provider.dart';
import '../theme/app_theme.dart';

class PaywallScreen extends StatefulWidget {
  const PaywallScreen({Key? key}) : super(key: key);

  @override
  State<PaywallScreen> createState() => _PaywallScreenState();
}

class _PaywallScreenState extends State<PaywallScreen> {
  @override
  void initState() {
    super.initState();
    // Track paywall view
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final subscriptionProvider =
          context.read<SubscriptionProvider>();
      // Track analytics event
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Upgrade to Premium'),
        centerTitle: true,
        elevation: 0,
      ),
      body: Consumer<SubscriptionProvider>(
        builder: (context, subscriptionProvider, _) {
          if (subscriptionProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final packages = subscriptionProvider.packages;

          if (packages.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('No premium plans available'),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Go Back'),
                  ),
                ],
              ),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                const SizedBox(height: 20),
                const Text(
                  'Unlock Premium Features',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Access unlimited meditations, personalized guidance, and more',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 40),

                // Features list
                _buildFeatureItem(
                  'Unlimited Meditations',
                  'Access our complete library',
                ),
                _buildFeatureItem(
                  'Ad-Free Experience',
                  'Uninterrupted meditation sessions',
                ),
                _buildFeatureItem(
                  'Personalized Journeys',
                  'Tailored guidance for your goals',
                ),
                _buildFeatureItem(
                  'Offline Access',
                  'Download meditations to listen anywhere',
                ),
                _buildFeatureItem(
                  'Premium Content',
                  'Exclusive expert-led meditations',
                ),

                const SizedBox(height: 40),

                // Subscription packages
                ...packages.asMap().entries.map((entry) {
                  final index = entry.key;
                  final package = entry.value;
                  final isSelected =
                      subscriptionProvider.selectedPackageId ==
                          package.identifier;

                  return Padding(
                    padding: EdgeInsets.only(
                      bottom: index < packages.length - 1 ? 16 : 0,
                    ),
                    child: _buildPackageOption(
                      context,
                      package,
                      isSelected,
                    ),
                  );
                }).toList(),

                const SizedBox(height: 20),

                // Purchase button
                if (subscriptionProvider.selectedPackageId != null)
                  ElevatedButton(
                    onPressed: () async {
                      final selectedPackage = packages.firstWhere(
                        (p) =>
                            p.identifier ==
                            subscriptionProvider.selectedPackageId,
                      );

                      final success = await subscriptionProvider
                          .purchasePackage(selectedPackage);

                      if (success && mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Welcome to Premium!'),
                            duration: Duration(seconds: 2),
                          ),
                        );
                        Navigator.pop(context);
                      } else if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              subscriptionProvider.error ??
                                  'Purchase failed',
                            ),
                            isError: true,
                          ),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: AppTheme.primaryColor,
                    ),
                    child: const Text(
                      'Subscribe Now',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),

                const SizedBox(height: 16),

                // Restore purchases
                TextButton(
                  onPressed: () async {
                    await subscriptionProvider.restorePurchases();
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Purchases restored!'),
                        ),
                      );
                    }
                  },
                  child: const Text('Already purchased? Restore purchases'),
                ),

                const SizedBox(height: 20),

                // Terms
                const Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(
                    'Subscription will auto-renew. Cancel anytime in app settings.',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildFeatureItem(String title, String subtitle) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          const Icon(
            Icons.check_circle,
            color: AppTheme.primaryColor,
            size: 24,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPackageOption(
    BuildContext context,
    Package package,
    bool isSelected,
  ) {
    return GestureDetector(
      onTap: () {
        context
            .read<SubscriptionProvider>()
            .setSelectedPackage(package.identifier);
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected
                ? AppTheme.primaryColor
                : Colors.grey.withOpacity(0.3),
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
          color: isSelected
              ? AppTheme.primaryColor.withOpacity(0.05)
              : Colors.transparent,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  package.packageType.toString().split('.').last,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (isSelected)
                  const Icon(
                    Icons.radio_button_checked,
                    color: AppTheme.primaryColor,
                  )
                else
                  const Icon(
                    Icons.radio_button_unchecked,
                    color: Colors.grey,
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              package.product.priceString,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryColor,
              ),
            ),
            if (package.product.subscriptionPeriod != null) ...[
              const SizedBox(height: 4),
              Text(
                'per ${package.product.subscriptionPeriod}',
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
