import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SubscriptionManager extends StatefulWidget {
  const SubscriptionManager({Key? key}) : super(key: key);

  @override
  State<SubscriptionManager> createState() => _SubscriptionManagerState();
}

class _SubscriptionManagerState extends State<SubscriptionManager> {
  final supabase = Supabase.instance.client;
  
  String currentTier = 'free';
  int practiceCredits = 10;
  int creditsUsed = 0;
  String? renewalDate;
  bool isLoading = true;

  // Tier configurations
  final Map<String, Map<String, dynamic>> tiers = {
    'free': {
      'name': 'Free',
      'price': 0,
      'limit': 10,
      'features': [
        '10 AI practices per month',
        'Basic ambient sounds',
        'Community access',
        'Progress tracking'
      ]
    },
    'starter': {
      'name': 'Starter',
      'price': 9.99,
      'limit': 50,
      'features': [
        '50 AI practices per month',
        'Premium ambient library',
        'Priority voice generation',
        'Advanced analytics',
        'Custom practice themes'
      ]
    },
    'pro': {
      'name': 'Pro',
      'price': 19.99,
      'limit': 200,
      'features': [
        '200 AI practices per month',
        'Full ambient library',
        'Priority generation',
        'Export practices',
        'Early access features',
        'No watermarks'
      ]
    },
    'unlimited': {
      'name': 'Unlimited',
      'price': 49.99,
      'limit': null,
      'features': [
        'Unlimited AI practices',
        'Premium everything',
        'Instant generation',
        'API access',
        'White-label options',
        'Dedicated support'
      ]
    }
  };

  final List<Map<String, dynamic>> creditPacks = [
    {'amount': 10, 'price': 4.99},
    {'amount': 25, 'price': 9.99},
    {'amount': 50, 'price': 17.99},
    {'amount': 100, 'price': 29.99},
  ];

  @override
  void initState() {
    super.initState();
    _loadSubscriptionData();
  }

  Future<void> _loadSubscriptionData() async {
    try {
      final user = supabase.auth.currentUser;
      if (user == null) return;

      final metadata = user.userMetadata ?? {};
      
      setState(() {
        currentTier = metadata['subscription_tier'] ?? 'free';
        practiceCredits = metadata['practice_credits'] ?? 10;
        creditsUsed = metadata['credits_used_this_month'] ?? 0;
        renewalDate = metadata['subscription_renewal_date'];
        isLoading = false;
      });
    } catch (e) {
      print('Error loading subscription: $e');
      setState(() => isLoading = false);
    }
  }

  Future<void> _handleUpgrade(String newTier) async {
    try {
      final user = supabase.auth.currentUser;
      if (user == null) return;

      // In production, integrate with Stripe/payment processor
      print('Processing upgrade to $newTier...');
      
      final tierConfig = tiers[newTier]!;
      final renewalDate = DateTime.now().add(const Duration(days: 30)).toIso8601String();

      await supabase.auth.updateUser(
        UserAttributes(
          data: {
            'subscription_tier': newTier,
            'practice_credits': tierConfig['limit'],
            'subscription_renewal_date': renewalDate,
            'credits_used_this_month': 0,
          },
        ),
      );

      setState(() {
        currentTier = newTier;
        practiceCredits = tierConfig['limit'] ?? 999999;
        creditsUsed = 0;
        this.renewalDate = renewalDate;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Upgraded to ${tierConfig['name']}!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      print('Error upgrading: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to upgrade. Please try again.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _handlePurchaseCredits(int amount, double price) async {
    try {
      final user = supabase.auth.currentUser;
      if (user == null) return;

      // In production, integrate with Stripe/payment processor
      print('Processing purchase of $amount credits for \$$price...');

      await supabase.auth.updateUser(
        UserAttributes(
          data: {
            'practice_credits': practiceCredits + amount,
          },
        ),
      );

      setState(() {
        practiceCredits += amount;
      });

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Added $amount credits!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      print('Error purchasing credits: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to purchase. Please try again.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _handleCancelSubscription() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Subscription'),
        content: const Text('Are you sure you want to cancel? You\'ll be downgraded to the free plan at the end of your billing period.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Keep Subscription'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await supabase.auth.updateUser(
          UserAttributes(
            data: {
              'subscription_tier': 'free',
              'practice_credits': 10,
              'subscription_renewal_date': null,
            },
          ),
        );

        setState(() {
          currentTier = 'free';
          practiceCredits = 10;
          renewalDate = null;
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Subscription cancelled'),
              backgroundColor: Colors.orange,
            ),
          );
        }
      } catch (e) {
        print('Error cancelling: $e');
      }
    }
  }

  void _showUpgradeModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: const BoxDecoration(
          color: Color(0xFFFCF8F2),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Handle bar
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            // Title
            Padding(
              padding: const EdgeInsets.all(20),
              child: Text(
                'Choose Your Plan',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1e2d2e),
                ),
              ),
            ),
            // Plans
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: tiers.entries
                    .where((e) => e.key != 'free')
                    .map((entry) => _buildTierCard(entry.key, entry.value))
                    .toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showPurchaseCreditsModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.6,
        decoration: const BoxDecoration(
          color: Color(0xFFFCF8F2),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Handle bar
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            // Title
            Padding(
              padding: const EdgeInsets.all(20),
              child: Text(
                'Purchase Credits',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1e2d2e),
                ),
              ),
            ),
            // Credit packs
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: creditPacks.map((pack) => _buildCreditPackCard(pack)).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTierCard(String tierKey, Map<String, dynamic> tier) {
    final isCurrentTier = tierKey == currentTier;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isCurrentTier ? const Color(0xFF1e2d2e) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isCurrentTier ? const Color(0xFF1e2d2e) : Colors.grey.shade200,
          width: 2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                tier['name'],
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isCurrentTier ? Colors.white : const Color(0xFF1e2d2e),
                ),
              ),
              if (isCurrentTier)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    'Current',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '\$${tier['price']}/month',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: isCurrentTier ? Colors.white : const Color(0xFF1e2d2e),
            ),
          ),
          const SizedBox(height: 16),
          ...(tier['features'] as List<String>).map(
            (feature) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  Icon(
                    Icons.check_circle,
                    size: 18,
                    color: isCurrentTier ? Colors.white : const Color(0xFF1e2d2e),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      feature,
                      style: TextStyle(
                        color: isCurrentTier ? Colors.white.withValues(alpha: 0.9) : Colors.grey.shade700,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          if (!isCurrentTier)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  _handleUpgrade(tierKey);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1e2d2e),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('Upgrade', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCreditPackCard(Map<String, dynamic> pack) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${pack['amount']} Credits',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1e2d2e),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '\$${pack['price']}',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade600,
                ),
              ),
            ],
          ),
          ElevatedButton(
            onPressed: () => _handlePurchaseCredits(pack['amount'], pack['price']),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1e2d2e),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Buy'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    final tierConfig = tiers[currentTier]!;
    final tierLimit = tierConfig['limit'];
    final usagePercentage = tierLimit != null ? (creditsUsed / tierLimit).clamp(0.0, 1.0) : 0.0;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Subscription',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1e2d2e),
            ),
          ),
          const SizedBox(height: 16),
          
          // Current Plan Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1e2d2e),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      tierConfig['name'],
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    if (currentTier != 'free')
                      Text(
                        '\$${tierConfig['price']}/mo',
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.white,
                        ),
                      ),
                  ],
                ),
                if (renewalDate != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    'Renews ${DateTime.parse(renewalDate!).toLocal().toString().split(' ')[0]}',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 12,
                    ),
                  ),
                ],
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Usage Progress
          if (tierLimit != null) ...[
            Text(
              'Usage this month',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade700,
              ),
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: usagePercentage,
                backgroundColor: Colors.grey.shade200,
                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF1e2d2e)),
                minHeight: 8,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '$creditsUsed / $tierLimit practices used',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 16),
          ],
          
          // Action Buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _showUpgradeModal,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF1e2d2e),
                    side: const BorderSide(color: Color(0xFF1e2d2e)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(currentTier == 'free' ? 'Upgrade' : 'Change Plan'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: _showPurchaseCreditsModal,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1e2d2e),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('Buy Credits'),
                ),
              ),
            ],
          ),
          
          if (currentTier != 'free') ...[
            const SizedBox(height: 12),
            Center(
              child: TextButton(
                onPressed: _handleCancelSubscription,
                style: TextButton.styleFrom(
                  foregroundColor: Colors.red,
                ),
                child: const Text('Cancel Subscription'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
