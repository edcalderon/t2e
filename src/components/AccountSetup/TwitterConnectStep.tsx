import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
  Platform,
  TouchableOpacity
} from "react-native";
import { Image } from "expo-image";
import { Svg, Path } from 'react-native-svg';
import { Check, AlertCircle, RefreshCw, Shield, Clock, Settings, Info, Wifi, WifiOff, ExternalLink } from "lucide-react-native";
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';
import { supabase } from '../../../lib/supabase';

const { width, height } = Dimensions.get('window');
const isMobile = width < 768;

interface TwitterConnectStepProps {
  onConnect: (connected: boolean) => void;
}

export default function TwitterConnectStep({ onConnect }: TwitterConnectStepProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const { 
    user, 
    session,
    isLoading, 
    isAuthenticated, 
    error: authError, 
    signInWithTwitter, 
    clearError,
    isInitialized,
    retryCount 
  } = useSupabaseAuth();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStage, setConnectionStage] = useState<'idle' | 'initiating' | 'redirecting' | 'processing' | 'completing'>('idle');

  useEffect(() => {
    // Create animations with proper configuration
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    });

    const scaleIn = Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    });

    // Start animations in parallel
    Animated.parallel([fadeIn, scaleIn]).start();
  }, [fadeAnim, scaleAnim]);

  // Helper function to check session on mobile
  const checkMobileSession = async (attempts = 0): Promise<boolean> => {
    if (attempts >= 10) return false;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('✅ Session found after OAuth');
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return checkMobileSession(attempts + 1);
  };

  // Handle OAuth redirect on web
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      if (Platform.OS !== 'web') return;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        if (session) {
          console.log('🔑 Session found after OAuth redirect');
          setConnectionStage('processing');
          // The parent effect will handle the onConnect call when isAuthenticated becomes true
        }
      } catch (err) {
        console.error('Error handling OAuth redirect:', err);
      }
    };
    
    // Add a small delay to ensure the session is properly set
    const timer = setTimeout(handleOAuthRedirect, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Update parent component when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Authentication detected, completing setup...');
      setConnectionStage('completing');
      
      // Small delay to show completion state before updating parent
      const timer = setTimeout(() => {
        console.log('✅ Notifying parent of successful connection');
        onConnect(true);
        setIsConnecting(false);
        setConnectionStage('idle');
      }, 800);

      return () => clearTimeout(timer);
    } else if (isConnecting && connectionStage === 'initiating') {
      // If we're in the process of connecting but not yet authenticated
      // and we're in the initiating stage, update to processing
      setConnectionStage('processing');
    }
  }, [isAuthenticated, onConnect, isConnecting, connectionStage]);

  const handleConnect = async () => {
    if (isAuthenticated || isConnecting) {
      console.log('⏳ Already connected or connecting, ignoring...');
      return;
    }
    
    console.log('🔗 Starting Twitter connection process...');
    
    // Reset states
    setIsConnecting(true);
    setConnectionStage('initiating');
    clearError();
    
    try {
      setConnectionStage('redirecting');
      
      // For web, we'll let the OAuth flow handle the redirect
      if (Platform.OS === 'web' || Platform.OS === undefined) {
        console.log('🌐 Web platform detected, starting OAuth flow...');
        const result = await signInWithTwitter();
        if (result?.error && !result.success) {
          console.error('❌ OAuth error:', result.error);
          throw result.error;
        }
        console.log('🔄 OAuth flow initiated, waiting for redirect...');
        return;
      }
      
      // For mobile, handle the OAuth flow manually
      const result = await signInWithTwitter();
      
      if (!result) {
        throw new Error('No response from Twitter authentication');
      }
      
      if (result.success) {
        setConnectionStage('processing');
        console.log('🔄 OAuth completed, waiting for session...');
        // The useEffect above will handle the success case
      } else if (result.error?.type === 'email') {
        console.log('ℹ️ Twitter connection succeeded with email warning');
        setConnectionStage('completing');
        
        setTimeout(() => {
          onConnect(true);
          setIsConnecting(false);
          setConnectionStage('idle');
        }, 1000);
      } else {
        throw result.error || new Error('Twitter connection failed');
      }
    } catch (err) {
      console.error('❌ Connection error:', err);
      // Always reset connecting state on error
      setIsConnecting(false);
      setConnectionStage('idle');
      
      // If we have an error object with a type, set it as the auth error
      if (err && typeof err === 'object' && 'type' in err) {
        clearError(); // Clear any previous errors first
        // @ts-ignore - We've already checked that err is an object with a type
        setAuthError(err);
      }
    }
  };

  const handleRetry = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    setConnectionStage('initiating');
    clearError();
    
    try {
      // The retry count is already managed by useSupabaseAuth
      // Just call the connect function again
      await handleConnect();
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
        return isMobile ? 'Opening authentication...' : 'Opening Twitter...';
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

  const isEmailWarning = authError?.type === 'email';
  const isNetworkError = authError?.type === 'network';
  const isConfigError = authError?.type === 'config';

  const styles = createStyles(theme, isMobile);

  // Show loading only if not initialized
  if (!isInitialized) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconContainer}>
            <Clock size={isMobile ? 28 : 32} color={theme.colors.primary} />
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
              <Check size={isMobile ? 28 : 32} color={theme.colors.success} />
            </View>
            <View style={styles.twitterBadge}>
              <Svg width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} viewBox="0 0 24 24">
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
                      <Shield size={isMobile ? 12 : 14} color="#1DA1F2" />
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
                    <Info size={10} color={theme.colors.textTertiary} />
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
            <Shield size={isMobile ? 14 : 16} color={theme.colors.success} />
            <Text style={styles.securityText}>
              Secured with OAuth 2.0 authentication
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  // Error state with enhanced error handling
  if (authError && !isEmailWarning && !isConnecting) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            {isNetworkError ? (
              <WifiOff size={isMobile ? 28 : 32} color={theme.colors.error} />
            ) : isConfigError ? (
              <Settings size={isMobile ? 28 : 32} color={theme.colors.error} />
            ) : (
              <AlertCircle size={isMobile ? 28 : 32} color={theme.colors.error} />
            )}
          </View>
          
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorMessage}>
            {getErrorMessage(authError)}
          </Text>

          {isConfigError && (
            <View style={styles.configHelp}>
              <Settings size={isMobile ? 14 : 16} color={theme.colors.warning} />
              <Text style={styles.configHelpText}>
                Configuration Issue Detected
              </Text>
            </View>
          )}

          {isNetworkError && (
            <View style={styles.networkHelp}>
              <WifiOff size={isMobile ? 14 : 16} color={theme.colors.error} />
              <Text style={styles.networkHelpText}>
                Network Connection Issue
              </Text>
            </View>
          )}

          <Text style={styles.errorSolution}>
            {getErrorSolution(authError)}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.retryButton, 
              (isConnecting || pressed) && styles.retryButtonDisabled
            ]}
            onPress={handleRetry}
            disabled={isConnecting}
          >
            {({ pressed }) => (
              isConnecting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <RefreshCw size={isMobile ? 14 : 16} color="#FFFFFF" />
                  <Text style={styles.retryButtonText}>
                    Try Again {retryCount > 0 && `(${retryCount + 1})`}
                  </Text>
                </>
              )
            )}
          </Pressable>

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
            <Info size={isMobile ? 28 : 32} color={theme.colors.warning} />
          </View>
          
          <Text style={styles.warningTitle}>Almost There!</Text>
          <Text style={styles.warningMessage}>
            {getErrorMessage(authError)}
          </Text>

          <Text style={styles.warningSolution}>
            {getErrorSolution(authError)}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              pressed && { opacity: 0.8 }
            ]}
            onPress={() => {
              clearError();
              onConnect(true);
            }}
          >
            <Check size={isMobile ? 14 : 16} color="#FFFFFF" />
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  // Initial connection state or connecting state
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.iconContainer}>
        <View style={styles.iconBackground}>
          <Svg width={isMobile ? "36" : "40"} height={isMobile ? "36" : "40"} viewBox="0 0 24 24">
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
          <Check size={isMobile ? 14 : 16} color={theme.colors.success} />
          <Text style={styles.featureText}>Secure OAuth 2.0 authentication</Text>
        </View>
        <View style={styles.feature}>
          <Check size={isMobile ? 14 : 16} color={theme.colors.success} />
          <Text style={styles.featureText}>No password sharing required</Text>
        </View>
        <View style={styles.feature}>
          <Check size={isMobile ? 14 : 16} color={theme.colors.success} />
          <Text style={styles.featureText}>Revoke access anytime</Text>
        </View>
        <View style={styles.feature}>
          <Info size={isMobile ? 14 : 16} color={theme.colors.textTertiary} />
          <Text style={styles.featureTextNote}>Email may not be provided by Twitter</Text>
        </View>
        {isMobile && (
          <View style={styles.feature}>
            <ExternalLink size={14} color={theme.colors.textTertiary} />
            <Text style={styles.featureTextNote}>Opens in browser for secure authentication</Text>
          </View>
        )}
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
            <Svg width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} viewBox="0 0 24 24">
              <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#FFFFFF" />
            </Svg>
            <Text style={styles.connectButtonText}>Connect with X</Text>
            {isMobile && <ExternalLink size={16} color="#FFFFFF" />}
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

const createStyles = (theme: any, isMobile: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: isMobile ? 16 : 20,
    paddingHorizontal: isMobile ? 8 : 0,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: isMobile ? 32 : 40,
    gap: isMobile ? 12 : 16,
  },
  loadingIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: isMobile ? 50 : 60,
    height: isMobile ? 50 : 60,
  },
  loadingSpinner: {
    position: 'absolute',
  },
  loadingText: {
    fontSize: isMobile ? 14 : 16,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: isMobile ? 12 : 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: isMobile ? 20 : 24,
  },
  iconBackground: {
    width: isMobile ? 70 : 80,
    height: isMobile ? 70 : 80,
    borderRadius: isMobile ? 35 : 40,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: isMobile ? 8 : 12,
    paddingHorizontal: isMobile ? 16 : 0,
  },
  description: {
    fontSize: isMobile ? 14 : 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: isMobile ? 20 : 24,
    marginBottom: isMobile ? 20 : 24,
    paddingHorizontal: isMobile ? 16 : 20,
  },
  featuresContainer: {
    width: '100%',
    gap: isMobile ? 8 : 12,
    marginBottom: isMobile ? 24 : 32,
    paddingHorizontal: isMobile ? 16 : 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isMobile ? 8 : 12,
  },
  featureText: {
    fontSize: isMobile ? 12 : 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  featureTextNote: {
    fontSize: isMobile ? 11 : 12,
    color: theme.colors.textTertiary,
    flex: 1,
    fontStyle: 'italic',
  },
  connectButton: {
    backgroundColor: '#1DA1F2',
    borderRadius: isMobile ? 10 : 12,
    paddingVertical: isMobile ? 14 : 16,
    paddingHorizontal: isMobile ? 24 : 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isMobile ? 8 : 12,
    marginTop: 8,
    width: '100%',
    maxWidth: isMobile ? 260 : 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    minHeight: isMobile ? 48 : 56,
    marginHorizontal: isMobile ? 16 : 0,
  },
  connectButtonDisabled: {
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: isMobile ? 14 : 16,
    fontWeight: '600',
  },
  connectingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isMobile ? 8 : 12,
  },
  disclaimerText: {
    fontSize: isMobile ? 10 : 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: isMobile ? 14 : 16,
    marginTop: isMobile ? 16 : 20,
    paddingHorizontal: isMobile ? 16 : 20,
  },
  linkText: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: isMobile ? 16 : 20,
    width: '100%',
    paddingHorizontal: isMobile ? 16 : 0,
  },
  successIconContainer: {
    position: 'relative',
    marginBottom: isMobile ? 20 : 24,
  },
  successIcon: {
    width: isMobile ? 70 : 80,
    height: isMobile ? 70 : 80,
    borderRadius: isMobile ? 35 : 40,
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
    width: isMobile ? 28 : 32,
    height: isMobile ? 28 : 32,
    borderRadius: isMobile ? 14 : 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  successTitle: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: isMobile ? 12 : 16,
    textAlign: 'center',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: isMobile ? 12 : 16,
    padding: isMobile ? 12 : 16,
    marginBottom: isMobile ? 12 : 16,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  userAvatar: {
    width: isMobile ? 40 : 48,
    height: isMobile ? 40 : 48,
    borderRadius: isMobile ? 20 : 24,
    marginRight: isMobile ? 8 : 12,
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
    fontSize: isMobile ? 14 : 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  verifiedBadge: {
    width: isMobile ? 16 : 18,
    height: isMobile ? 16 : 18,
    borderRadius: isMobile ? 8 : 9,
    backgroundColor: '#1DA1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userHandle: {
    fontSize: isMobile ? 12 : 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  followerCount: {
    fontSize: isMobile ? 10 : 12,
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
    fontSize: isMobile ? 9 : 10,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
  },
  basicSuccessInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: isMobile ? 12 : 16,
    padding: isMobile ? 12 : 16,
    marginBottom: isMobile ? 12 : 16,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  basicSuccessText: {
    fontSize: isMobile ? 14 : 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  basicSuccessSubtext: {
    fontSize: isMobile ? 12 : 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: isMobile ? 12 : 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: isMobile ? 18 : 20,
    marginBottom: isMobile ? 12 : 16,
    paddingHorizontal: isMobile ? 16 : 20,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.success + '10',
    paddingHorizontal: isMobile ? 10 : 12,
    paddingVertical: isMobile ? 6 : 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.success + '30',
  },
  securityText: {
    fontSize: isMobile ? 10 : 12,
    color: theme.colors.success,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: isMobile ? 16 : 20,
    width: '100%',
    paddingHorizontal: isMobile ? 16 : 0,
  },
  errorIcon: {
    width: isMobile ? 70 : 80,
    height: isMobile ? 70 : 80,
    borderRadius: isMobile ? 35 : 40,
    backgroundColor: theme.colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isMobile ? 20 : 24,
  },
  errorTitle: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: isMobile ? 12 : 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: isMobile ? 18 : 20,
    marginBottom: isMobile ? 12 : 16,
    paddingHorizontal: isMobile ? 16 : 20,
  },
  configHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.warning + '10',
    paddingHorizontal: isMobile ? 10 : 12,
    paddingVertical: isMobile ? 6 : 8,
    borderRadius: 8,
    marginBottom: isMobile ? 12 : 16,
  },
  configHelpText: {
    fontSize: isMobile ? 10 : 12,
    color: theme.colors.warning,
    fontWeight: '600',
  },
  networkHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.error + '10',
    paddingHorizontal: isMobile ? 10 : 12,
    paddingVertical: isMobile ? 6 : 8,
    borderRadius: 8,
    marginBottom: isMobile ? 12 : 16,
  },
  networkHelpText: {
    fontSize: isMobile ? 10 : 12,
    color: theme.colors.error,
    fontWeight: '600',
  },
  errorSolution: {
    fontSize: isMobile ? 10 : 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: isMobile ? 14 : 16,
    marginBottom: isMobile ? 20 : 24,
    paddingHorizontal: isMobile ? 16 : 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: isMobile ? 10 : 12,
    paddingVertical: isMobile ? 10 : 12,
    paddingHorizontal: isMobile ? 20 : 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: isMobile ? 12 : 16,
    minHeight: isMobile ? 40 : 48,
  },
  retryButtonDisabled: {
    opacity: 0.6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: isMobile ? 12 : 14,
    fontWeight: '600',
  },
  persistentErrorHint: {
    fontSize: isMobile ? 9 : 11,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: isMobile ? 16 : 20,
    fontStyle: 'italic',
  },
  warningContainer: {
    alignItems: 'center',
    paddingVertical: isMobile ? 16 : 20,
    width: '100%',
    paddingHorizontal: isMobile ? 16 : 0,
  },
  warningIcon: {
    width: isMobile ? 70 : 80,
    height: isMobile ? 70 : 80,
    borderRadius: isMobile ? 35 : 40,
    backgroundColor: theme.colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isMobile ? 20 : 24,
  },
  warningTitle: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  warningMessage: {
    fontSize: isMobile ? 12 : 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: isMobile ? 18 : 20,
    marginBottom: isMobile ? 12 : 16,
    paddingHorizontal: isMobile ? 16 : 20,
  },
  warningSolution: {
    fontSize: isMobile ? 10 : 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: isMobile ? 14 : 16,
    marginBottom: isMobile ? 20 : 24,
    paddingHorizontal: isMobile ? 16 : 20,
  },
  continueButton: {
    backgroundColor: theme.colors.success,
    borderRadius: isMobile ? 10 : 12,
    paddingVertical: isMobile ? 10 : 12,
    paddingHorizontal: isMobile ? 20 : 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: isMobile ? 40 : 48,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: isMobile ? 12 : 14,
    fontWeight: '600',
  },
});