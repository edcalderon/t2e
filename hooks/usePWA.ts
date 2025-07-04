import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAHook {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  installApp: () => Promise<void>;
  updateAvailable: boolean;
  updateApp: () => void;
}

export const usePWA = (): PWAHook => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Check if app is already installed
    const checkInstalled = () => {
      if (typeof window !== 'undefined') {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInWebAppiOS = (window.navigator as any).standalone === true;
        setIsInstalled(isStandalone || isInWebAppiOS);
      }
    };

    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('✅ PWA was installed');
    };

    // Service Worker update detection with better logic
    const handleSWUpdate = () => {
      // Only set update available if we haven't already detected it
      if (!updateAvailable) {
        console.log('🔄 Service Worker update detected');
        setUpdateAvailable(true);
      }
    };

    // Register event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Enhanced service worker update detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Check for updates periodically
        const checkForUpdates = () => {
          registration.update().catch((error) => {
            console.log('SW update check failed:', error);
          });
        };

        // Check for updates every 30 minutes
        const updateInterval = setInterval(checkForUpdates, 30 * 60 * 1000);

        // Listen for new service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available
                handleSWUpdate();
              }
            });
          }
        });

        // Listen for controller change (when new SW takes control)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // Don't show update prompt if page is reloading
          if (!window.location.href.includes('reload')) {
            handleSWUpdate();
          }
        });

        return () => {
          clearInterval(updateInterval);
        };
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          handleSWUpdate();
        }
      });
    }

    // Initial checks
    checkInstalled();
    updateOnlineStatus();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [updateAvailable]);

  const installApp = async (): Promise<void> => {
    if (!deferredPrompt) {
      console.warn('No install prompt available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('❌ Error during app installation:', error);
    }
  };

  const updateApp = (): void => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          // Tell the waiting service worker to skip waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Listen for the controlling service worker to change
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Reload the page to get the new content
            window.location.reload();
          });
        } else {
          // No waiting service worker, just reload
          window.location.reload();
        }
      });
    } else {
      // Fallback: just reload the page
      window.location.reload();
    }
    
    // Reset update available state
    setUpdateAvailable(false);
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
    updateAvailable,
    updateApp,
  };
};

// PWA utility functions
export const registerSW = async (): Promise<void> => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always check for updates
      });

      console.log('✅ Service Worker registered successfully:', registration.scope);

      // Check for updates immediately
      registration.update();

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          console.log('🔄 New service worker found');
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 New service worker installed and ready');
              // Notify the app about the update
              window.dispatchEvent(new CustomEvent('sw-update-available'));
            }
          });
        }
      });

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;

  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Show notification
export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/assets/images/icon.png',
      badge: '/assets/images/favicon.png',
      ...options,
    });
  }
};