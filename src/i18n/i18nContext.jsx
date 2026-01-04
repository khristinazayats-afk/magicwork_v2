import { createContext, useContext, useState, useEffect } from 'react';
import { translations, localizedPricing, countryCurrency, countryLanguage } from './translations';

const I18nContext = createContext();

/**
 * I18n Provider - Manages language and pricing localization
 * Automatically detects user's location and sets appropriate language/currency
 */
export function I18nProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [userCountry, setUserCountry] = useState(null);
  const [isDetecting, setIsDetecting] = useState(true);

  // Detect user's location on mount
  useEffect(() => {
    detectUserLocation();
  }, []);

  const detectUserLocation = async () => {
    try {
      // Try to get location from browser API first
      const savedLang = localStorage.getItem('user_language');
      const savedCurrency = localStorage.getItem('user_currency');
      
      if (savedLang && savedCurrency) {
        setLanguage(savedLang);
        setCurrency(savedCurrency);
        setIsDetecting(false);
        return;
      }

      // Detect from IP geolocation
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        const country = data.country_code;
        
        setUserCountry(country);
        
        // Set language based on country
        const detectedLang = countryLanguage[country] || 'en';
        setLanguage(detectedLang);
        
        // Set currency based on country
        const detectedCurrency = countryCurrency[country] || 'USD';
        setCurrency(detectedCurrency);
        
        // Save to localStorage
        localStorage.setItem('user_language', detectedLang);
        localStorage.setItem('user_currency', detectedCurrency);
        localStorage.setItem('user_country', country);
        
        console.log(`🌍 Location detected: ${country}, Language: ${detectedLang}, Currency: ${detectedCurrency}`);
      } else {
        // Fallback to browser language
        const browserLang = navigator.language.split('-')[0];
        const supportedLang = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'].includes(browserLang) ? browserLang : 'en';
        setLanguage(supportedLang);
        localStorage.setItem('user_language', supportedLang);
      }
    } catch (error) {
      console.error('Location detection failed:', error);
      // Use browser language as fallback
      const browserLang = navigator.language.split('-')[0];
      const supportedLang = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'].includes(browserLang) ? browserLang : 'en';
      setLanguage(supportedLang);
      localStorage.setItem('user_language', supportedLang);
    } finally {
      setIsDetecting(false);
    }
  };

  // Translation helper
  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  // Get localized price
  const getPrice = (tier) => {
    const pricing = localizedPricing[currency] || localizedPricing.USD;
    return `${pricing.currency}${pricing[tier]}`;
  };

  // Get credit pack price
  const getCreditPrice = (amount) => {
    const pricing = localizedPricing[currency] || localizedPricing.USD;
    return `${pricing.currency}${pricing.credits[amount]}`;
  };

  // Format price with currency
  const formatPrice = (amount) => {
    const pricing = localizedPricing[currency] || localizedPricing.USD;
    return `${pricing.currency}${amount}`;
  };

  // Change language manually
  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLanguage(newLang);
      localStorage.setItem('user_language', newLang);
    }
  };

  // Change currency manually
  const changeCurrency = (newCurrency) => {
    if (localizedPricing[newCurrency]) {
      setCurrency(newCurrency);
      localStorage.setItem('user_currency', newCurrency);
    }
  };

  const value = {
    language,
    currency,
    userCountry,
    isDetecting,
    t,
    getPrice,
    getCreditPrice,
    formatPrice,
    changeLanguage,
    changeCurrency,
    pricing: localizedPricing[currency] || localizedPricing.USD,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Hook to use i18n context
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
