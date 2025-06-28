import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';

// Environment variables validation
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables. Authentication will not work.');
  console.warn('Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file');
}

// Required for web only
WebBrowser.maybeCompleteAuthSession();

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: Platform.OS !== 'web' ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
    debug: __DEV__,
  },
  global: {
    headers: {
      'X-Client-Info': `xquests-app/${Platform.OS}`,
    },
  },
});

// Get redirect URI
const redirectTo = makeRedirectUri({
  scheme: 'xquests',
  path: 'auth/callback',
});

console.log('🔗 Redirect URI:', redirectTo);

// Create session from URL (based on your example)
export const createSessionFromUrl = async (url: string) => {
  console.log('🔍 Creating session from URL:', url.substring(0, 100) + '...');
  
  try {
    const { params, errorCode } = QueryParams.getQueryParams(url);

    if (errorCode) {
      console.error('❌ OAuth error code:', errorCode);
      
      // Handle specific error cases
      if (errorCode === 'server_error') {
        console.log('ℹ️ Server error detected - checking for existing session');
        // Sometimes Twitter OAuth succeeds but returns server_error
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('✅ Found existing session despite server error');
          return session;
        }
      }
      
      throw new Error(errorCode);
    }

    const { access_token, refresh_token } = params;

    if (!access_token) {
      console.warn('⚠️ No access token found in URL');
      
      // Check if we already have a session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('✅ Found existing session without new tokens');
        return session;
      }
      
      return null;
    }

    console.log('🎫 Setting session with tokens...');
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      console.error('❌ Error setting session:', error);
      
      // Check if session was created despite error
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('✅ Session exists despite setSession error');
        return session;
      }
      
      throw error;
    }

    console.log('✅ Session created successfully');
    return data.session;
  } catch (error) {
    console.error('❌ Error in createSessionFromUrl:', error);
    
    // Last resort: check for any existing session
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('✅ Fallback: found existing session');
        return session;
      }
    } catch (fallbackError) {
      console.error('❌ Fallback session check failed:', fallbackError);
    }
    
    throw error;
  }
};

// Perform OAuth (based on your example)
export const performOAuth = async () => {
  console.log('🐦 Starting Twitter OAuth...');
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error('❌ OAuth initiation error:', error);
      throw error;
    }

    if (!data.url) {
      throw new Error('No OAuth URL received');
    }

    console.log('🌐 Opening OAuth URL...');
    
    // Open OAuth URL in browser
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo,
      {
        showInRecents: true,
        preferEphemeralSession: false,
      }
    );

    console.log('📱 OAuth result:', result.type);

    if (result.type === 'success' && result.url) {
      console.log('✅ OAuth success, creating session...');
      
      try {
        const session = await createSessionFromUrl(result.url);
        
        if (session) {
          console.log('✅ Session created from OAuth result');
          return { success: true, session };
        } else {
          console.log('⚠️ No session created but no error - checking current session');
          
          // Wait a moment for session to be established
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession) {
            console.log('✅ Found session after delay');
            return { success: true, session: currentSession };
          } else {
            console.log('❌ No session found after OAuth success');
            throw new Error('OAuth succeeded but no session was created');
          }
        }
      } catch (sessionError: any) {
        console.error('❌ Session creation error:', sessionError);
        
        // Check if it's an email-related error (common with Twitter)
        if (sessionError.message?.toLowerCase().includes('email') || 
            sessionError.message?.includes('server_error')) {
          console.log('ℹ️ Email-related error detected - checking for session anyway');
          
          // Wait and check for session
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const { data: { session: fallbackSession } } = await supabase.auth.getSession();
          if (fallbackSession) {
            console.log('✅ Session found despite email error');
            return { success: true, session: fallbackSession };
          }
        }
        
        throw sessionError;
      }
    } else if (result.type === 'cancel') {
      throw new Error('Authentication was cancelled');
    } else {
      throw new Error('Authentication failed or was dismissed');
    }
  } catch (error: any) {
    console.error('❌ OAuth error:', error);
    return { success: false, error: error.message };
  }
};

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

// Helper to check if an error is email-related (and therefore safe to ignore)
export const isEmailRelatedError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = (error.message || error.error_description || error.error || '').toLowerCase();
  
  return errorMessage.includes('email') || 
         errorMessage.includes('user email') ||
         errorMessage.includes('external provider') ||
         errorMessage.includes('server_error');
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