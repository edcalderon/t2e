import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useFrameworkReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeFramework = async () => {
      try {
        console.log('🔧 Framework initialization started');
        
        // Simulate framework initialization
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (mounted) {
          setIsReady(true);
          console.log('✅ Framework ready');
          
          // Signal framework ready on web
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('framework-ready'));
            }, 50);
          }
        }
      } catch (error) {
        console.error('❌ Framework initialization error:', error);
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