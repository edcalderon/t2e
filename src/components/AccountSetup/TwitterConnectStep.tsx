import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Twitter, Check, AlertCircle, RefreshCw, Shield, Clock } from "lucide-react-native";
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';

interface TwitterConnectStepProps {
  onConnect: (connected: boolean) => void;
  isConnected: boolean;
}

export default function TwitterConnectStep({ onConnect, isConnected }: TwitterConnectStepProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const { 
    user, 
    isLoading, 
    isAuthenticated, 
    error, 
    signInWithTwitter, 
    retry, 
    clearError,
    isInitialized 
  } = useSupabaseAuth();
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Update parent component when authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      onConnect(true);
    }
  }, [isAuthenticated, user, onConnect]);

  const handleConnect = async () => {
    if (isAuthenticated) return;
    
    setIsConnecting(true);
    clearError();
    
    try {
      const result = await signInWithTwitter();
      if (!result.success) {
        console.error('Twitter connection failed:', result.error);
      }
    } catch (err) {
      console.error('Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRetry = async () => {
    setIsConnecting(true);
    clearError();
    
    try {
      await retry();
    } catch (err) {
      console.error('Retry error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const styles = createStyles(theme);

  // Show loading only if not initialized or actively connecting
  if (!isInitialized || (isLoading && !isConnecting)) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconContainer}>
            <Clock size={32} color={theme.colors.primary} />
            <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loadingSpinner} />
          </View>
          <Text style={styles.loadingText}>Checking authentication status...</Text>
          <Text style={styles.loadingSubtext}>This should only take a moment</Text>
        </View>
      </Animated.View>
    );
  }

  // Success state - user is authenticated
  if (isAuthenticated && user) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <View style={styles.successIcon}>
              <Check size={32} color={theme.colors.success} />
            </View>
            <View style={styles.twitterBadge}>
              <Twitter size={20} color="#1DA1F2" />
            </View>
          </View>
          
          <Text style={styles.successTitle}>Successfully Connected!</Text>
          
          {/* User Profile Display */}
          <View style={styles.userProfile}>
            <Image
              source={{ uri: user.avatar }}
              style={styles.userAvatar}
              contentFit="cover"
            />
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userDisplayName}>{user.displayName}</Text>
                {user.verified && (
                  <View style={styles.verifiedBadge}>
                    <Shield size={14} color="#1DA1F2" />
                  </View>
                )}
              </View>
              <Text style={styles.userHandle}>@{user.twitterHandle || user.username}</Text>
              {user.followerCount > 0 && (
                <Text style={styles.followerCount}>
                  {user.followerCount.toLocaleString()} followers
                </Text>
              )}
            </View>
          </View>

          <Text style={styles.successDescription}>
            Your X account is now linked and ready to participate in challenges.
          </Text>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Shield size={16} color={theme.colors.success} />
            <Text style={styles.securityText}>
              Secured with OAuth 2.0 authentication
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  // Error state
  if (error) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <AlertCircle size={32} color={theme.colors.error} />
          </View>
          
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorMessage}>
            {error.message || 'Unable to connect to X. Please try again.'}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <RefreshCw size={16} color="#FFFFFF" />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.errorHint}>
            Make sure you have a stable internet connection and try again.
          </Text>
        </View>
      </Animated.View>
    );
  }

  // Initial connection state
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.iconContainer}>
        <View style={styles.iconBackground}>
          <Twitter size={40} color="#1DA1F2" />
        </View>
      </View>
      
      <Text style={styles.title}>Connect Your X Account</Text>
      <Text style={styles.description}>
        Connect with your X (Twitter) account to start participating in challenges and earning rewards. 
        We use secure OAuth authentication to protect your account.
      </Text>

      <View style={styles.featuresContainer}>
        <View style={styles.feature}>
          <Check size={16} color={theme.colors.success} />
          <Text style={styles.featureText}>Secure OAuth 2.0 authentication</Text>
        </View>
        <View style={styles.feature}>
          <Check size={16} color={theme.colors.success} />
          <Text style={styles.featureText}>No password sharing required</Text>
        </View>
        <View style={styles.feature}>
          <Check size={16} color={theme.colors.success} />
          <Text style={styles.featureText}>Revoke access anytime</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.connectButton, isConnecting && styles.connectButtonDisabled]}
        onPress={handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <View style={styles.connectingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
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
        By connecting, you agree to our{' '}
        <Text 
          style={styles.linkText}
          onPress={() => router.push('/terms')}
        >
          Terms of Service
        </Text>
        {' '}and{' '}
        <Text 
          style={styles.linkText}
          onPress={() => router.push('/privacy')}
        >
          Privacy Policy
        </Text>
        . We'll never post without your explicit permission.
      </Text>
    </Animated.View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  loadingIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  loadingSpinner: {
    position: 'absolute',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  connectButton: {
    backgroundColor: '#1DA1F2',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
    width: '100%',
    maxWidth: 280,
    shadowColor: '#1DA1F2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  connectButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  connectingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  disclaimerText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  linkText: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  successIconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  twitterBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userDisplayName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1DA1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userHandle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  followerCount: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  successDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.success + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.success + '30',
  },
  securityText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorHint: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});