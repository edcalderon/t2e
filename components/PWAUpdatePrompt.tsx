import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { RefreshCw, X } from 'lucide-react-native';
import { usePWA } from '../hooks/usePWA';
import { useTheme } from '../contexts/ThemeContext';

export default function PWAUpdatePrompt() {
  const { theme } = useTheme();
  const { updateAvailable, updateApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));

  const styles = createStyles(theme);

  useEffect(() => {
    if (Platform.OS === 'web' && updateAvailable) {
      setIsVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [updateAvailable]);

  const handleUpdate = () => {
    updateApp();
    hidePrompt();
  };

  const hidePrompt = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  if (!isVisible || Platform.OS !== 'web') {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <RefreshCw size={20} color={theme.colors.primary} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Update Available</Text>
          <Text style={styles.description}>
            A new version of XQuests is ready to install
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdate}
            activeOpacity={0.8}
          >
            <Text style={styles.updateButtonText}>Update</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={hidePrompt}
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
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  content: {
    backgroundColor: theme.colors.primary,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
    borderRadius: 12,
  },
});