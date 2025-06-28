import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { Twitter, Check } from "lucide-react-native";
import { useTheme } from '../../../contexts/ThemeContext';

interface TwitterConnectStepProps {
  onConnect: (connected: boolean) => void;
  isConnected: boolean;
}

export default function TwitterConnectStep({ onConnect, isConnected }: TwitterConnectStepProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    
    // Simulate OAuth connection process
    setTimeout(() => {
      onConnect(true);
      setIsLoading(false);
      
      // Trigger haptic feedback on native platforms
      if (Platform.OS !== 'web') {
        // Would use Haptics.notificationAsync here in a real implementation
      }
    }, 2000);
  };

  const styles = createStyles(theme);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.iconContainer}>
        <View style={styles.iconBackground}>
          <Twitter size={40} color="#1DA1F2" />
        </View>
      </View>
      
      <Text style={styles.title}>Connect Your X Account</Text>
      <Text style={styles.description}>
        Connect with your X (Twitter) account to start participating in challenges and earning rewards
      </Text>

      {!isConnected ? (
        <View style={styles.connectContainer}>
          <TouchableOpacity
            style={[styles.connectButton, isLoading && styles.connectButtonDisabled]}
            onPress={handleConnect}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Animated.View
                  style={[
                    styles.loadingSpinner,
                    {
                      transform: [{
                        rotate: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      }],
                    },
                  ]}
                />
                <Text style={styles.connectButtonText}>Connecting...</Text>
              </View>
            ) : (
              <>
                <Twitter size={20} color="#FFFFFF" />
                <Text style={styles.connectButtonText}>Connect with X</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            We'll never post without your permission. Your account is secure with OAuth authentication.
          </Text>
        </View>
      ) : (
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Check size={24} color={theme.colors.success} />
          </View>
          <Text style={styles.successTitle}>Successfully Connected!</Text>
          <Text style={styles.successDescription}>
            Your X account is now linked. You can start participating in challenges.
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  connectContainer: {
    width: '100%',
    gap: 20,
  },
  connectButton: {
    backgroundColor: '#1DA1F2',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  connectButtonDisabled: {
    opacity: 0.6,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderRadius: 10,
  },
  disclaimerText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});