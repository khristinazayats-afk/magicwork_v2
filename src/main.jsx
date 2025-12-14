import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Development-only logging helper
const isDev = import.meta.env.DEV;
const devLog = isDev ? console.log.bind(console) : () => {};
const devWarn = isDev ? console.warn.bind(console) : () => {};
const devError = console.error.bind(console); // Keep errors in production

// Global error handlers
window.addEventListener('error', (event) => {
  devError('[Global] Unhandled error:', event.error);
  // Prevent default browser error handling
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  devError('[Global] Unhandled promise rejection:', event.reason);
  // Prevent default browser error handling
  event.preventDefault();
});

// Service Worker Registration with Update Detection
// Skip service worker registration in development to avoid reload loops
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

if ('serviceWorker' in navigator && !isDevelopment) {
  const registerServiceWorker = async () => {
    try {
      // Register service worker WITHOUT cache-busting to prevent reload loops
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none' // Never cache the service worker file
      });
      
      devLog('[SW] Service Worker registered:', registration.scope);

      // Track if we've already reloaded to prevent infinite loops
      let hasReloaded = false;
      const reloadOnce = () => {
        if (!hasReloaded) {
          hasReloaded = true;
          devLog('[SW] Reloading page to activate new service worker...');
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      };

      // Only check for updates periodically, not on every page load
      const checkForUpdates = () => {
        registration.update().catch((err) => {
          devWarn('[SW] Update check failed:', err);
        });
      };

      // Check for updates every 5 minutes (not on initial load)
      setInterval(checkForUpdates, 5 * 60 * 1000);

      // Listen for service worker updates - only reload if there's actually a waiting worker
      registration.addEventListener('updatefound', () => {
        devLog('[SW] Update found, installing new service worker...');
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            // Only reload if there's a waiting service worker (not on first install)
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller && registration.waiting) {
              devLog('[SW] New service worker waiting, will reload on next navigation');
              // Don't auto-reload - let user continue browsing
              // The new worker will activate on next page load
            }
          });
        }
      });

      // Listen for messages from service worker - but don't auto-reload
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          devLog('[SW] Service worker updated to version:', event.data.version);
          // Don't auto-reload - this causes infinite loops
          // The new version will be used on next page navigation
        }
      });

      // Don't reload on controller change - this happens naturally when SW updates
      // Removing the controllerchange listener that was causing reload loops

    } catch (error) {
      devError('[SW] Service Worker registration failed:', error);
    }
  };

  // Register when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerServiceWorker);
  } else {
    registerServiceWorker();
  }
} else if (isDevelopment && 'serviceWorker' in navigator) {
  // In development, unregister any existing service workers to prevent conflicts
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      devLog('[SW] Unregistered service worker for development mode');
    });
  });
}

devLog('[main.jsx] Starting app render...');
const rootElement = document.getElementById('root');
if (!rootElement) {
  devError('[main.jsx] ERROR: root element not found!');
} else {
  devLog('[main.jsx] Root element found, rendering...');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
  devLog('[main.jsx] App rendered successfully');
}

