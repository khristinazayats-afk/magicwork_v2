import { useI18n } from '../i18n/i18nContext';

/**
 * I18nTest - Test component to verify i18n system works
 * Shows current language, currency, and sample translations
 */
export default function I18nTest() {
  const { 
    language, 
    currency, 
    userCountry, 
    t, 
    getPrice, 
    getCreditPrice,
    isDetecting 
  } = useI18n();

  if (isDetecting) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-lg">
        <p className="text-center text-gray-600">🌍 Detecting your location...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-purple-600">
        🌍 Internationalization Test
      </h1>

      {/* Detection Results */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Auto-Detection Results</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Country</p>
            <p className="text-lg font-bold">{userCountry || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Language</p>
            <p className="text-lg font-bold">{language.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Currency</p>
            <p className="text-lg font-bold">{currency}</p>
          </div>
        </div>
      </div>

      {/* Sample Translations */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Sample Translations</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Get Started:</span>
            <span className="font-semibold">{t('getStarted')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Subscription:</span>
            <span className="font-semibold">{t('subscription')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Upgrade Plan:</span>
            <span className="font-semibold">{t('upgradePlan')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Buy Credits:</span>
            <span className="font-semibold">{t('buyCredits')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Emotional State:</span>
            <span className="font-semibold">{t('emotionalState')}</span>
          </div>
        </div>
      </div>

      {/* Localized Pricing */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Localized Pricing</h2>
        
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Subscription Tiers</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600">{t('starterPlan')}</p>
              <p className="text-lg font-bold text-purple-600">{getPrice('starter')}{t('perMonth')}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <p className="text-xs text-gray-600">{t('proPlan')}</p>
              <p className="text-lg font-bold text-purple-600">{getPrice('pro')}{t('perMonth')}</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <p className="text-xs text-gray-600">{t('unlimitedPlan')}</p>
              <p className="text-lg font-bold text-purple-600">{getPrice('unlimited')}{t('perMonth')}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Credit Packs</h3>
          <div className="grid grid-cols-4 gap-3">
            {[10, 25, 50, 100].map(amount => (
              <div key={amount} className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600">{amount} {t('practiceCredits')}</p>
                <p className="text-base font-bold text-blue-600">{getCreditPrice(amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          ✅ i18n system is working! Language and pricing auto-detected based on your location.
        </p>
      </div>
    </div>
  );
}
