import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

/**
 * SubscriptionManager - Manage user subscription, credits, and purchases
 * Shows subscription status, usage, and upgrade/purchase options
 */
export default function SubscriptionManager() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showPurchaseCredits, setShowPurchaseCredits] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (!currentUser) return;

      // Get subscription data from user metadata
      const metadata = currentUser.user_metadata || {};
      setSubscription({
        tier: metadata.subscription_tier || 'free',
        status: metadata.subscription_status || 'active',
        renewalDate: metadata.subscription_renewal_date || null,
        startDate: metadata.subscription_start_date || null
      });

      // Get credits/usage data
      // In production, this would query a separate credits table
      setCredits({
        practiceCredits: metadata.practice_credits || 10,
        practiceLimit: getTierLimit(metadata.subscription_tier || 'free'),
        usedThisMonth: metadata.practices_used_this_month || 0
      });
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierLimit = (tier) => {
    switch (tier) {
      case 'free': return 10;
      case 'starter': return 50;
      case 'pro': return 200;
      case 'unlimited': return 999999;
      default: return 10;
    }
  };

  const getTierPrice = (tier) => {
    switch (tier) {
      case 'starter': return '$9.99/month';
      case 'pro': return '$19.99/month';
      case 'unlimited': return '$49.99/month';
      default: return 'Free';
    }
  };

  const getTierFeatures = (tier) => {
    const features = {
      free: [
        '10 practices per month',
        'Basic ambient sounds',
        'Standard voice narration',
        'Community access'
      ],
      starter: [
        '50 practices per month',
        'All ambient sounds',
        'Premium voice options',
        'Priority support',
        'Advanced analytics'
      ],
      pro: [
        '200 practices per month',
        'Unlimited ambient sounds',
        'All premium voices',
        'Priority support',
        'Advanced analytics',
        'Custom practice schedules',
        'Downloadable sessions'
      ],
      unlimited: [
        'Unlimited practices',
        'Everything in Pro',
        'Early access to features',
        '1-on-1 coaching sessions',
        'Custom AI models',
        'API access'
      ]
    };
    return features[tier] || features.free;
  };

  const handleUpgrade = async (newTier) => {
    // In production, integrate with Stripe/payment processor
    console.log('Upgrading to:', newTier);
    
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          subscription_tier: newTier,
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString(),
          subscription_renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          practice_credits: getTierLimit(newTier),
          practices_used_this_month: 0
        }
      });

      if (error) throw error;

      // Reload data
      await loadSubscriptionData();
      setShowUpgrade(false);
      
      // Show success message
      alert(`Successfully upgraded to ${newTier}!`);
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Upgrade failed. Please try again.');
    }
  };

  const handlePurchaseCredits = async (amount) => {
    // In production, integrate with payment processor
    console.log('Purchasing credits:', amount);
    
    try {
      const currentCredits = credits?.practiceCredits || 0;
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          practice_credits: currentCredits + amount
        }
      });

      if (error) throw error;

      // Reload data
      await loadSubscriptionData();
      setShowPurchaseCredits(false);
      
      // Show success message
      alert(`Successfully purchased ${amount} practice credits!`);
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          subscription_status: 'cancelled',
          subscription_tier: 'free'
        }
      });

      if (error) throw error;

      await loadSubscriptionData();
      alert('Subscription cancelled. You can continue using free features.');
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Cancellation failed. Please contact support.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Subscription Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-hanken font-bold text-gray-900 capitalize">
              {subscription?.tier || 'Free'} Plan
            </h3>
            <p className="text-sm text-gray-600">
              {subscription?.status === 'active' ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">
              {getTierPrice(subscription?.tier || 'free')}
            </p>
            {subscription?.renewalDate && (
              <p className="text-xs text-gray-500">
                Renews {new Date(subscription.renewalDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Usage Progress */}
        {credits && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Practices Used</span>
              <span className="font-semibold text-gray-900">
                {credits.usedThisMonth} / {credits.practiceLimit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((credits.usedThisMonth / credits.practiceLimit) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {credits.practiceLimit - credits.usedThisMonth} practices remaining this month
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {subscription?.tier === 'free' ? (
            <button
              onClick={() => setShowUpgrade(true)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Upgrade Plan
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowUpgrade(true)}
                className="flex-1 bg-white border border-purple-200 text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-all"
              >
                Change Plan
              </button>
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Purchase Additional Credits */}
      {subscription?.tier !== 'unlimited' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <h4 className="font-hanken font-bold text-gray-900 mb-2">
            Need More Practices?
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Purchase additional practice credits anytime
          </p>
          <button
            onClick={() => setShowPurchaseCredits(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all"
          >
            Buy Practice Credits
          </button>
        </motion.div>
      )}

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpgrade(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-hanken font-bold text-gray-900">
                  Choose Your Plan
                </h2>
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['starter', 'pro', 'unlimited'].map((tier) => (
                  <div
                    key={tier}
                    className={`border-2 rounded-xl p-6 ${
                      subscription?.tier === tier
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <h3 className="text-xl font-bold capitalize mb-2">{tier}</h3>
                    <p className="text-3xl font-bold text-purple-600 mb-4">
                      {getTierPrice(tier)}
                    </p>
                    <ul className="space-y-2 mb-6">
                      {getTierFeatures(tier).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpgrade(tier)}
                      disabled={subscription?.tier === tier}
                      className={`w-full py-2 rounded-lg font-semibold transition-all ${
                        subscription?.tier === tier
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                      }`}
                    >
                      {subscription?.tier === tier ? 'Current Plan' : 'Select Plan'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purchase Credits Modal */}
      <AnimatePresence>
        {showPurchaseCredits && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPurchaseCredits(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-hanken font-bold text-gray-900">
                  Buy Practice Credits
                </h2>
                <button
                  onClick={() => setShowPurchaseCredits(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { credits: 10, price: '$4.99' },
                  { credits: 25, price: '$9.99', popular: true },
                  { credits: 50, price: '$17.99' },
                  { credits: 100, price: '$29.99' }
                ].map((pack) => (
                  <button
                    key={pack.credits}
                    onClick={() => handlePurchaseCredits(pack.credits)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      pack.popular
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-bold text-gray-900">{pack.credits} Practice Credits</p>
                      {pack.popular && (
                        <span className="text-xs text-purple-600 font-semibold">MOST POPULAR</span>
                      )}
                    </div>
                    <p className="text-xl font-bold text-purple-600">{pack.price}</p>
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Credits never expire and can be used anytime
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
