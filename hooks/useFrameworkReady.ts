import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useFrameworkReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeFramework = async () => {
      try {
        // Minimal initialization delay
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (mounted) {
          setIsReady(true);

          // Signal framework ready on web
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('framework-ready'));
            }, 100);
          }
        }
      } catch (error) {
        if (mounted) {
          setIsReady(true); // Set ready even on error to prevent infinite loading
        }
      }
    };

    initializeFramework();

    return () => {
      mounted = false;
    };
  }, []);

  return isReady;
}