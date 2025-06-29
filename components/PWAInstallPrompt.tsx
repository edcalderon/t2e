import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { X, Download, Smartphone } from 'lucide-react-native';
import { usePWA } from '../hooks/usePWA';
import { useTheme } from '../contexts/ThemeContext';

interface PWAInstallPromptProps {
  onDismiss?: () => void;
}

export default function PWAInstallPrompt({ onDismiss }: PWAInstallPromptProps) {
  const { theme } = useTheme();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(100));
  const [fadeAnim] = useState(new Animated.Value(0));

  const styles = createStyles(theme);

  useEffect(() => {
    // Only show on web and if installable
    if (Platform.OS === 'web' && isInstallable && !isInstalled) {
      // Delay showing the prompt to avoid being intrusive
      const timer = setTimeout(() => {
        setIsVisible(true);
        showPrompt();
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const showPrompt = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hidePrompt = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onDismiss?.();
    });
  };

  const handleInstall = async () => {
    try {
      await installApp();
      hidePrompt();
    } catch (error) {
      console.error('Failed to install PWA:', error);
    }
  };

  const handleDismiss = () => {
    hidePrompt();
    // Store dismissal in localStorage to avoid showing again for a while
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    }
  };

  // Don't render if not visible or not on web
  if (!isVisible || Platform.OS !== 'web') {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Smartphone size={24} color={theme.colors.primary} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Install XQuests</Text>
          <Text style={styles.description}>
            Get the full app experience with offline access and push notifications
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.installButton}
            onPress={handleInstall}
            activeOpacity={0.8}
          >
            <Download size={16} color="#FFFFFF" />
            <Text style={styles.installButtonText}>Install</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            activeOpacity={0.6}
          >
            <X size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 10,
  },
  content: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  installButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  installButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
  },
});