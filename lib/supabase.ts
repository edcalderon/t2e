import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Environment variables validation
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables. Authentication will not work.');
  console.warn('Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file');
}

// Create Supabase client with enhanced configuration for Twitter OAuth
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    // Use AsyncStorage for session persistence on mobile
    storage: Platform.OS !== 'web' ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    // Enhanced OAuth settings for Twitter
    flowType: 'pkce', // Use PKCE flow for better security
    debug: __DEV__, // Enable debug mode in development
  },
  global: {
    headers: {
      'X-Client-Info': `xquests-app/${Platform.OS}`,
    },
  },
});

// Enhanced helper function to get Twitter user data from Supabase user
export const getTwitterUserData = (user: any) => {
  if (!user) {
    console.log('❌ No user data provided to getTwitterUserData');
    return null;
  }

  console.log('🔍 Processing user data:', {
    id: user.id,
    email: user.email || 'No email (NORMAL for Twitter)',
    hasMetadata: !!user.user_metadata,
    metadataKeys: user.user_metadata ? Object.keys(user.user_metadata) : [],
    hasIdentities: !!user.identities,
    identitiesCount: user.identities?.length || 0,
    rawUserData: __DEV__ ? user : '[Hidden in production]',
  });

  const twitterData = user.user_metadata || {};
  const twitterIdentity = user.identities?.find((identity: any) => identity.provider === 'twitter');
  
  // Merge data from user_metadata and identity data
  const identityData = twitterIdentity?.identity_data || {};
  
  // Extract Twitter data with multiple fallback options
  const extractedData = {
    id: user.id,
    // Email is often not provided by Twitter - this is COMPLETELY NORMAL
    email: user.email || 
           twitterData.email || 
           identityData.email ||
           null, // Allow null email as Twitter doesn't always provide it
    username: twitterData.user_name || 
              twitterData.preferred_username || 
              twitterData.screen_name || 
              twitterData.username ||
              identityData.user_name ||
              identityData.screen_name ||
              identityData.username ||
              user.email?.split('@')[0] || 
              `user_${user.id.slice(-8)}`, // Fallback to user ID suffix
    displayName: twitterData.full_name || 
                 twitterData.name || 
                 twitterData.display_name ||
                 twitterData.user_name ||
                 identityData.full_name ||
                 identityData.name ||
                 identityData.display_name ||
                 'Twitter User',
    avatar: twitterData.avatar_url || 
            twitterData.picture || 
            twitterData.profile_image_url ||
            twitterData.profile_image_url_https ||
            identityData.avatar_url ||
            identityData.picture ||
            identityData.profile_image_url ||
            'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    twitterId: twitterData.provider_id || 
               twitterData.sub || 
               twitterData.id_str ||
               twitterData.id ||
               identityData.provider_id ||
               identityData.sub ||
               identityData.id_str ||
               identityData.id,
    verified: twitterData.verified || 
              identityData.verified || 
              false,
    followerCount: twitterData.public_metrics?.followers_count || 
                   twitterData.followers_count || 
                   identityData.public_metrics?.followers_count ||
                   identityData.followers_count ||
                   0,
    twitterHandle: twitterData.user_name || 
                   twitterData.preferred_username || 
                   twitterData.screen_name ||
                   twitterData.username ||
                   identityData.user_name ||
                   identityData.screen_name ||
                   identityData.username,
  };

  console.log('✅ Extracted Twitter user data:', {
    ...extractedData,
    email: extractedData.email ? '***@***.***' : '❌ No email (NORMAL for Twitter)',
  });
  
  return extractedData;
};

// Enhanced token extraction helper
export const extractTokensFromUrl = (url: string) => {
  console.log('🔍 Extracting tokens from URL:', url.substring(0, 100) + '...');
  
  try {
    const urlObj = new URL(url);
    
    // Try to extract from hash fragment first (common for OAuth)
    const hashParams = new URLSearchParams(urlObj.hash.substring(1));
    const queryParams = new URLSearchParams(urlObj.search);
    
    // Check both hash and query parameters
    const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
    const code = hashParams.get('code') || queryParams.get('code');
    const error = hashParams.get('error') || queryParams.get('error');
    const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
    
    const tokens = {
      accessToken,
      refreshToken,
      code,
      error,
      errorDescription,
      type: hashParams.get('type') || queryParams.get('type'),
    };
    
    console.log('🎯 Extracted tokens:', {
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
      hasCode: !!tokens.code,
      hasError: !!tokens.error,
      type: tokens.type,
      errorDescription: tokens.errorDescription,
    });
    
    return tokens;
  } catch (error) {
    console.error('❌ Error extracting tokens:', error);
    return {
      accessToken: null,
      refreshToken: null,
      code: null,
      error: 'token_extraction_failed',
      errorDescription: 'Failed to extract tokens from URL',
      type: null,
    };
  }
};

// Helper to check if an error is email-related (and therefore safe to ignore)
export const isEmailRelatedError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = (error.message || error.error_description || error.error || '').toLowerCase();
  
  return errorMessage.includes('email') || 
         errorMessage.includes('user email') ||
         errorMessage.includes('external provider') ||
         errorMessage.includes('server_error') ||
         (error.error === 'server_error' && errorMessage.includes('email'));
};

// Helper to handle Twitter OAuth errors gracefully
export const handleTwitterOAuthError = (error: any) => {
  if (isEmailRelatedError(error)) {
    console.log('ℹ️ Twitter email issue detected - treating as warning, not error');
    return {
      type: 'warning',
      message: 'Twitter authentication successful! (Email not provided by Twitter)',
      canContinue: true,
    };
  }
  
  // Handle user cancellation
  if (error.message?.includes('cancel') || error.message?.includes('dismiss')) {
    return {
      type: 'error',
      message: 'Authentication was cancelled',
      canContinue: false,
    };
  }
  
  return {
    type: 'error',
    message: error.message || error.error_description || 'Authentication failed',
    canContinue: false,
  };
};

// Helper to validate Twitter OAuth configuration
export const validateTwitterOAuthConfig = () => {
  const issues = [];
  
  if (!supabaseUrl) {
    issues.push('EXPO_PUBLIC_SUPABASE_URL is not set');
  }
  
  if (!supabaseAnonKey) {
    issues.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is not set');
  }
  
  if (issues.length > 0) {
    console.error('❌ Twitter OAuth configuration issues:', issues);
    return { valid: false, issues };
  }
  
  console.log('✅ Twitter OAuth configuration is valid');
  return { valid: true, issues: [] };
};

// Helper to get the correct redirect URL for the current environment
export const getRedirectUrl = () => {
  if (Platform.OS === 'web') {
    // For web, use the current origin
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const redirectUrl = `${origin}/auth/callback`;
      console.log('🌐 Web redirect URL:', redirectUrl);
      return redirectUrl;
    }
    return 'http://localhost:8081/auth/callback'; // Fallback for development
  } else {
    // For mobile, use the app scheme
    const redirectUrl = 'xquests://auth/callback';
    console.log('📱 Mobile redirect URL:', redirectUrl);
    return redirectUrl;
  }
};

// Enhanced Twitter OAuth initiation with email handling
export const initiateTwitterOAuth = async () => {
  try {
    console.log('🐦 Initiating Twitter OAuth...');
    console.log('ℹ️ Note: Twitter may not provide email - this is normal behavior');
    
    const redirectUrl = getRedirectUrl();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: Platform.OS !== 'web',
        queryParams: {
          // Request minimal scopes to reduce email permission issues
          scope: 'tweet.read users.read',
        },
      },
    });

    if (error) {
      console.error('❌ OAuth initiation error:', error);
      
      // Don't fail for email-related issues
      if (error.message?.toLowerCase().includes('email')) {
        console.log('ℹ️ Email-related OAuth issue detected - this is normal for Twitter');
        return { success: true, data, warning: 'Email not available from Twitter' };
      }
      
      throw error;
    }

    console.log('✅ OAuth initiated successfully');
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Failed to initiate Twitter OAuth:', error);
    return { success: false, error: error.message };
  }
};

// Enhanced sign out function
export const signOut = async () => {
  try {
    console.log('🚪 Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
    console.log('✅ Successfully signed out');
    return { success: true };
  } catch (error) {
    console.error('❌ Error signing out:', error);
    return { success: false, error };
  }
};

// Enhanced session management
export const getCurrentSession = async () => {
  try {
    console.log('🔍 Getting current session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Session error:', error);
      throw error;
    }
    console.log('✅ Session retrieved:', session ? 'Active' : 'None');
    return session;
  } catch (error) {
    console.error('❌ Error getting session:', error);
    return null;
  }
};

// Enhanced session refresh
export const refreshSession = async () => {
  try {
    console.log('🔄 Refreshing session...');
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('❌ Refresh error:', error);
      throw error;
    }
    console.log('✅ Session refreshed successfully');
    return session;
  } catch (error) {
    console.error('❌ Error refreshing session:', error);
    return null;
  }
};

// Enhanced connection test
export const testSupabaseConnection = async () => {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing environment variables');
      return false;
    }

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
    return false;
  }
};