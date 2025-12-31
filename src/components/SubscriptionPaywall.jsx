import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/js';

const SubscriptionPaywall = ({ userId, onSubscribeSuccess }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscriptions/packages');
      if (!response.ok) throw new Error('Failed to fetch packages');
      const data = await response.json();
      setPackages(data.packages || []);
    } catch (err) {
      setError('Failed to load subscription packages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackageId) {
      setError('Please select a subscription plan');
      return;
    }

    try {
      setLoading(true);
      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          packageId: selectedPackageId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');
      const { sessionId } = await response.json();

      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        setError(result.error.message);
      } else if (onSubscribeSuccess) {
        onSubscribeSuccess();
      }
    } catch (err) {
      setError('Purchase failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscriptions/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        alert('Purchases restored!');
        if (onSubscribeSuccess) onSubscribeSuccess();
      } else {
        setError('Failed to restore purchases');
      }
    } catch (err) {
      setError('Failed to restore purchases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && packages.length === 0) {
    return <div className="text-center py-12">Loading subscription plans...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Unlock Premium Features</h1>
        <p className="text-xl text-gray-600">
          Access unlimited meditations, personalized guidance, and more
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-6 mb-12">
        {[
          'Unlimited Meditations',
          'Ad-Free Experience',
          'Personalized Journeys',
          'Offline Access',
          'Premium Content',
          'Priority Support',
        ].map((feature) => (
          <div key={feature} className="flex items-center">
            <svg
              className="w-6 h-6 text-blue-600 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-lg">{feature}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => setSelectedPackageId(pkg.id)}
            className={`p-6 border-2 rounded-lg cursor-pointer transition ${
              selectedPackageId === pkg.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">${pkg.price}</span>
              <span className="text-gray-600 ml-2">/{pkg.billing_period}</span>
            </div>
            <p className="text-gray-600 mb-4">{pkg.description}</p>
            <div
              className={`text-center p-2 rounded ${
                selectedPackageId === pkg.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {selectedPackageId === pkg.id ? 'Selected' : 'Select Plan'}
            </div>
          </div>
        ))}
      </div>

      {/* Purchase Button */}
      {selectedPackageId && (
        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
        >
          {loading ? 'Processing...' : 'Subscribe Now'}
        </button>
      )}

      {/* Restore Purchases */}
      <div className="text-center">
        <button
          onClick={handleRestorePurchases}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          Already purchased? Restore purchases
        </button>
      </div>

      {/* Terms */}
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>Subscription will auto-renew. Cancel anytime in account settings.</p>
      </div>
    </div>
  );
};

export default SubscriptionPaywall;
