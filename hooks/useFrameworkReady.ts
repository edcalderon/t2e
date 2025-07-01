import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useFrameworkReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeFramework = async () => {
      try {
        // Minimal initialization - no artificial delays
        if (mounted) {
          setIsReady(true);

          // Signal framework ready on web immediately
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            // Signal immediately
            window.dispatchEvent(new CustomEvent('framework-ready'));
            
            // Also signal after a brief moment to ensure listeners are ready
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('framework-ready'));
            }, 50);
          }
        }
      } catch (error) {
        console.error('Framework initialization error:', error);
        if (mounted) {
          setIsReady(true); // Set ready even on error to prevent infinite loading
        }
      }
    };

    // Initialize immediately
    initializeFramework();

    return () => {
      mounted = false;
    };
  }, []);

  return isReady;
}