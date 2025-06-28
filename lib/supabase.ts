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

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    // Use AsyncStorage for session persistence on mobile
    storage: Platform.OS !== 'web' ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    // Enhanced OAuth settings
    flowType: 'pkce', // Use PKCE flow for better security
    debug: __DEV__, // Enable debug mode in development
  },
  global: {
    headers: {
      'X-Client-Info': `expo-app/${Platform.OS}`,
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
    email: user.email,
    hasMetadata: !!user.user_metadata,
    metadataKeys: user.user_metadata ? Object.keys(user.user_metadata) : [],
  });

  const twitterData = user.user_metadata || {};
  
  // Extract Twitter data with multiple fallback options
  const extractedData = {
    id: user.id,
    email: user.email || twitterData.email,
    username: twitterData.user_name || 
              twitterData.preferred_username || 
              twitterData.screen_name || 
              twitterData.username ||
              user.email?.split('@')[0] || 
              'user',
    displayName: twitterData.full_name || 
                 twitterData.name || 
                 twitterData.display_name ||
                 twitterData.user_name ||
                 'User',
    avatar: twitterData.avatar_url || 
            twitterData.picture || 
            twitterData.profile_image_url ||
            twitterData.profile_image_url_https ||
            'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    twitterId: twitterData.provider_id || 
               twitterData.sub || 
               twitterData.id_str ||
               twitterData.id,
    verified: twitterData.verified || false,
    followerCount: twitterData.public_metrics?.followers_count || 
                   twitterData.followers_count || 
                   0,
    twitterHandle: twitterData.user_name || 
                   twitterData.preferred_username || 
                   twitterData.screen_name ||
                   twitterData.username,
  };

  console.log('✅ Extracted Twitter user data:', extractedData);
  return extractedData;
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

// OAuth URL builder for better debugging
export const buildOAuthUrl = (provider: string, redirectTo: string) => {
  const baseUrl = `${supabaseUrl}/auth/v1/authorize`;
  const params = new URLSearchParams({
    provider,
    redirect_to: redirectTo,
    flow_type: 'pkce',
  });
  
  const url = `${baseUrl}?${params.toString()}`;
  console.log('🔗 Built OAuth URL:', url);
  return url;
};

// Token extraction helper
export const extractTokensFromUrl = (url: string) => {
  console.log('🔍 Extracting tokens from URL:', url);
  
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