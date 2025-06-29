import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Svg, Path } from 'react-native-svg';
import { Check, AlertCircle, RefreshCw, Shield, Clock, Settings, Info, Wifi, WifiOff } from "lucide-react-native";
import { useTheme } from '../../../contexts/ThemeContext';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';

interface TwitterConnectStepProps {
  onConnect: (connected: boolean) => void;
}

export default function TwitterConnectStep({ onConnect }: TwitterConnectStepProps) {
  const { theme } = useTheme();
  const { 
    user, 
    session,
    isLoading, 
    isAuthenticated, 
    error, 
    signInWithTwitter, 
    retry, 
    clearError,
    isInitialized,
    retryCount 
  } = useSupabaseAuth();
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStage, setConnectionStage] = useState<'idle' | 'initiating' | 'redirecting' | 'processing' | 'completing'>('idle');
  const [hasTriggeredSuccess, setHasTriggeredSuccess] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null);

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
    if (isAuthenticated && !hasTriggeredSuccess) {
      console.log('✅ Authentication detected, completing setup...');
      setHasTriggeredSuccess(true);
      setConnectionStage('completing');
      
      // Clear any existing timeout
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        setConnectionTimeout(null);
      }
      
      setTimeout(() => {
        onConnect(true);
        setIsConnecting(false);
        setConnectionStage('idle');
      }, 1500);
    }
  }, [isAuthenticated, onConnect, hasTriggeredSuccess, connectionTimeout]);

  const handleConnect = async () => {
    if (isAuthenticated || isConnecting) return;
    
    setIsConnecting(true);
    setConnectionStage('initiating');
    setHasTriggeredSuccess(false);
    clearError();
    
    // Set a timeout for the connection process
    const timeout = setTimeout(() => {
      if (isConnecting && !isAuthenticated) {
        console.log('⏰ Connection timeout reached');
        setIsConnecting(false);
        setConnectionStage('idle');
      }
    }, 60000); // 60 second timeout
    
    setConnectionTimeout(timeout);
    
    try {
      setConnectionStage('redirecting');
      
      const result = await signInWithTwitter();
      
      if (result.success) {
        setConnectionStage('processing');
        console.log('🔄 OAuth completed, waiting for session...');
        
        // The useEffect above will handle the success case
      } else if (result.error?.type === 'email') {
        console.log('ℹ️ Twitter connection succeeded with email warning');
        setConnectionStage('completing');
        
        if (timeout) clearTimeout(timeout);
        
        setTimeout(() => {
          onConnect(true);
          setIsConnecting(false);
          setConnectionStage('idle');
        }, 1000);
      } else {
        console.error('❌ Twitter connection failed:', result.error);
        setIsConnecting(false);
        setConnectionStage('idle');
        
        if (timeout) clearTimeout(timeout);
      }
    } catch (err) {
      console.error('❌ Connection error:', err);
      setIsConnecting(false);
      setConnectionStage('idle');
      
      if (timeout) clearTimeout(timeout);
    }
  };

  const handleRetry = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    setConnectionStage('initiating');
    setHasTriggeredSuccess(false);
    clearError();
    
    try {
      await retry();
      setConnectionStage('processing');
    } catch (err) {
      console.error('❌ Retry error:', err);
      setIsConnecting(false);
      setConnectionStage('idle');
    }
  };

  const getConnectionStageText = () => {
    switch (connectionStage) {
      case 'initiating':
        return 'Initializing connection...';
      case 'redirecting':
        return 'Opening Twitter...';
      case 'processing':
        return 'Processing authentication...';
      case 'completing':
        return 'Completing setup...';
      default:
        return 'Connect with X';
    }
  };

  const getErrorMessage = (error: any) => {
    if (!error) return '';
    
    switch (error.type) {
      case 'config':
        return 'Configuration issue detected. Please check your Supabase setup.';
      case 'network':
        return 'Network connection issue. Please check your internet connection.';
      case 'token':
        return 'Authentication token issue. This usually resolves with a retry.';
      case 'auth':
        return 'Authentication service issue. Please try again.';
      case 'email':
        return 'Twitter authentication successful! (Email not provided by Twitter)';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  const getErrorSolution = (error: any) => {
    if (!error) return '';
    
    switch (error.type) {
      case 'config':
        return 'Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.';
      case 'network':
        return 'Check your internet connection and try again.';
      case 'token':
        return 'This is usually temporary. Try again in a moment.';
      case 'auth':
        return 'The authentication service may be temporarily unavailable.';
      case 'email':
        return 'This is normal - Twitter doesn\'t always provide email addresses. Your account is still connected!';
      default:
        return 'Try refreshing the app or contact support if the issue persists.';
    }
  };

  const isEmailWarning = error?.type === 'email';
  const isNetworkError = error?.type === 'network';
  const isConfigError = error?.type === 'config';

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
  if (isAuthenticated && !isConnecting) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <View style={styles.successIcon}>
              <Check size={32} color={theme.colors.success} />
            </View>
            <View style={styles.twitterBadge}>
              <Svg width="20" height="20" viewBox="0 0 24 24">
                <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#1DA1F2" />
              </Svg>
            </View>
          </View>
          
          <Text style={styles.successTitle}>Successfully Connected!</Text>
          
          {/* User Profile Display */}
          {user ? (
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
                {!user.email && (
                  <View style={styles.emailNotice}>
                    <Info size={12} color={theme.colors.textTertiary} />
                    <Text style={styles.emailNoticeText}>Email not provided by Twitter</Text>
                  </View>
                )}
              </View>
            </View>
          ) : session ? (
            <View style={styles.basicSuccessInfo}>
              <Text style={styles.basicSuccessText}>
                Your X account has been successfully connected!
              </Text>
              <Text style={styles.basicSuccessSubtext}>
                Session ID: {session.user.id.slice(-8)}
              </Text>
            </View>
          ) : (
            <View style={styles.basicSuccessInfo}>
              <Text style={styles.basicSuccessText}>
                Authentication successful!
              </Text>
              <Text style={styles.basicSuccessSubtext}>
                You can now participate in challenges and earn rewards.
              </Text>
            </View>
          )}

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

  // Error state with enhanced error handling
  if (error && !isEmailWarning && !isConnecting) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            {isNetworkError ? (
              <WifiOff size={32} color={theme.colors.error} />
            ) : isConfigError ? (
              <Settings size={32} color={theme.colors.error} />
            ) : (
              <AlertCircle size={32} color={theme.colors.error} />
            )}
          </View>
          
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorMessage}>
            {getErrorMessage(error)}
          </Text>

          {isConfigError && (
            <View style={styles.configHelp}>
              <Settings size={16} color={theme.colors.warning} />
              <Text style={styles.configHelpText}>
                Configuration Issue Detected
              </Text>
            </View>
          )}

          {isNetworkError && (
            <View style={styles.networkHelp}>
              <WifiOff size={16} color={theme.colors.error} />
              <Text style={styles.networkHelpText}>
                Network Connection Issue
              </Text>
            </View>
          )}

          <Text style={styles.errorSolution}>
            {getErrorSolution(error)}
          </Text>

          <TouchableOpacity
            style={[styles.retryButton, isConnecting && styles.retryButtonDisabled]}
            onPress={handleRetry}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <RefreshCw size={16} color="#FFFFFF" />
                <Text style={styles.retryButtonText}>
                  Try Again {retryCount > 0 && `(${retryCount + 1})`}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {retryCount > 2 && (
            <Text style={styles.persistentErrorHint}>
              If this issue persists, please check your Supabase configuration and internet connection.
            </Text>
          )}
        </View>
      </Animated.View>
    );
  }

  // Email warning state (treat as success but show info)
  if (isEmailWarning && !isConnecting) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.warningContainer}>
          <View style={styles.warningIcon}>
            <Info size={32} color={theme.colors.warning} />
          </View>
          
          <Text style={styles.warningTitle}>Almost There!</Text>
          <Text style={styles.warningMessage}>
            {getErrorMessage(error)}
          </Text>

          <Text style={styles.warningSolution}>
            {getErrorSolution(error)}
          </Text>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              clearError();
              onConnect(true);
            }}
          >
            <Check size={16} color="#FFFFFF" />
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // Initial connection state or connecting state
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.iconContainer}>
        <View style={styles.iconBackground}>
          <Svg width="40" height="40" viewBox="0 0 24 24">
            <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#1DA1F2" />
          </Svg>
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
        <View style={styles.feature}>
          <Info size={16} color={theme.colors.textTertiary} />
          <Text style={styles.featureTextNote}>Email may not be provided by Twitter</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.connectButton, 
          isConnecting && styles.connectButtonDisabled
        ]}
        onPress={handleConnect}
        disabled={isConnecting}
        activeOpacity={isConnecting ? 1 : 0.7}
      >
        {isConnecting ? (
          <View style={styles.connectingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.connectButtonText}>{getConnectionStageText()}</Text>
          </View>
        ) : (
          <>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#FFFFFF" />
            </Svg>
            <Text style={styles.connectButtonText}>Connect with X</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.disclaimerText}>
        By connecting, you agree to our secure authentication process. 
        We'll never post without your explicit permission.
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
  featureTextNote: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    flex: 1,
    fontStyle: 'italic',
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
    minHeight: 56,
  },
  connectButtonDisabled: {
    opacity: 0.7,
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
  emailNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  emailNoticeText: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
  },
  basicSuccessInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  basicSuccessText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  basicSuccessSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  configHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.warning + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  configHelpText: {
    fontSize: 12,
    color: theme.colors.warning,
    fontWeight: '600',
  },
  networkHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.error + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  networkHelpText: {
    fontSize: 12,
    color: theme.colors.error,
    fontWeight: '600',
  },
  errorSolution: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
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
    minHeight: 48,
  },
  retryButtonDisabled: {
    opacity: 0.6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  persistentErrorHint: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  warningContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  warningIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  warningMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  warningSolution: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  continueButton: {
    backgroundColor: theme.colors.success,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});