import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

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

// Get redirect URI with proper scheme handling
const getRedirectUri = () => {
  if (Platform.OS === 'web') {
    return `${window.location.origin}/auth/callback`;
  }
  
  return makeRedirectUri({
    scheme: 'xquests',
    path: 'auth/callback',
  });
};

const redirectTo = getRedirectUri();
console.log('🔗 Redirect URI:', redirectTo);

// Enhanced session creation from URL
export const createSessionFromUrl = async (url: string): Promise<any> => {
  console.log('🔍 Creating session from URL:', url.substring(0, 100) + '...');
  
  try {
    // Parse URL parameters
    const { params, errorCode } = QueryParams.getQueryParams(url);
    
    console.log('📋 URL params:', {
      hasAccessToken: !!params.access_token,
      hasRefreshToken: !!params.refresh_token,
      hasCode: !!params.code,
      errorCode,
      paramsKeys: Object.keys(params),
    });

    // Handle OAuth errors
    if (errorCode) {
      console.error('❌ OAuth error code:', errorCode);
      
      // Handle specific error cases that might still have valid sessions
      if (errorCode === 'server_error' || errorCode.includes('email')) {
        console.log('ℹ️ Checking for existing session despite error...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('✅ Found existing session despite error');
          return session;
        }
      }
      
      throw new Error(`OAuth error: ${errorCode}`);
    }

    const { access_token, refresh_token, code } = params;

    // Method 1: Direct token setting (preferred)
    if (access_token) {
      console.log('🎫 Setting session with access token...');
      
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token: refresh_token || '',
      });

      if (error) {
        console.error('❌ Error setting session:', error);
        
        // Check if session was created despite error
        const { data: { session: fallbackSession } } = await supabase.auth.getSession();
        if (fallbackSession) {
          console.log('✅ Session exists despite setSession error');
          return fallbackSession;
        }
        
        throw error;
      }

      console.log('✅ Session created successfully with tokens');
      return data.session;
    }

    // Method 2: Authorization code exchange
    if (code) {
      console.log('🔄 Exchanging authorization code for session...');
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('❌ Error exchanging code:', error);
        throw error;
      }
      
      console.log('✅ Session created from authorization code');
      return data.session;
    }

    // Method 3: Check for existing session
    console.log('🔍 No tokens found, checking for existing session...');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('✅ Found existing session');
      return session;
    }

    console.log('⚠️ No session could be created from URL');
    return null;

  } catch (error: any) {
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

// Enhanced OAuth performance
export const performOAuth = async (): Promise<{ success: boolean; error?: string; session?: any }> => {
  console.log('🐦 Starting Twitter OAuth...');
  
  try {
    // Validate configuration first
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration. Please check your environment variables.');
    }

    console.log('🔧 Initiating OAuth with Supabase...');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('❌ OAuth initiation error:', error);
      throw new Error(`OAuth setup failed: ${error.message}`);
    }

    if (!data.url) {
      throw new Error('No OAuth URL received from Supabase');
    }

    console.log('🌐 Opening OAuth URL in browser...');
    console.log('🔗 OAuth URL:', data.url.substring(0, 100) + '...');
    
    // Open OAuth URL in browser with enhanced options
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo,
      {
        showInRecents: true,
        preferEphemeralSession: false,
        createTask: false,
      }
    );

    console.log('📱 OAuth browser result:', {
      type: result.type,
      hasUrl: !!result.url,
      urlPreview: result.url?.substring(0, 100),
    });

    if (result.type === 'success' && result.url) {
      console.log('✅ OAuth success, processing result...');
      
      try {
        const session = await createSessionFromUrl(result.url);
        
        if (session) {
          console.log('✅ Session created successfully');
          return { success: true, session };
        } else {
          console.log('⚠️ No session created, checking current state...');
          
          // Wait a moment for session to be established
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession) {
            console.log('✅ Found session after delay');
            return { success: true, session: currentSession };
          } else {
            throw new Error('OAuth completed but no session was created');
          }
        }
      } catch (sessionError: any) {
        console.error('❌ Session creation error:', sessionError);
        
        // Handle email-related errors (common with Twitter)
        if (sessionError.message?.toLowerCase().includes('email') || 
            sessionError.message?.includes('server_error')) {
          console.log('ℹ️ Email-related error detected, checking for session anyway...');
          
          // Wait and check for session multiple times
          for (let i = 0; i < 3; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { data: { session: fallbackSession } } = await supabase.auth.getSession();
            if (fallbackSession) {
              console.log('✅ Session found despite email error');
              return { success: true, session: fallbackSession };
            }
          }
        }
        
        throw sessionError;
      }
    } else if (result.type === 'cancel') {
      throw new Error('Authentication was cancelled by user');
    } else if (result.type === 'dismiss') {
      throw new Error('Authentication was dismissed');
    } else {
      throw new Error(`Unexpected OAuth result: ${result.type}`);
    }
  } catch (error: any) {
    console.error('❌ OAuth error:', error);
    return { 
      success: false, 
      error: error.message || 'Authentication failed'
    };
  }
};

// Enhanced helper function to get Twitter user data
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
  const identityData = twitterIdentity?.identity_data || {};
  
  // Extract Twitter data with comprehensive fallback options
  const extractedData = {
    id: user.id,
    email: user.email || 
           twitterData.email || 
           identityData.email ||
           null,
    username: twitterData.user_name || 
              twitterData.preferred_username || 
              twitterData.screen_name || 
              twitterData.username ||
              identityData.user_name ||
              identityData.screen_name ||
              identityData.username ||
              user.email?.split('@')[0] || 
              `user_${user.id.slice(-8)}`,
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

// Enhanced session management functions
export const getCurrentSession = async () => {
  try {
    console.log('🔍 Getting current session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Session error:', error);
      return null;
    }
    console.log('✅ Session retrieved:', session ? 'Active' : 'None');
    return session;
  } catch (error) {
    console.error('❌ Error getting session:', error);
    return null;
  }
};

export const refreshSession = async () => {
  try {
    console.log('🔄 Refreshing session...');
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('❌ Refresh error:', error);
      return null;
    }
    console.log('✅ Session refreshed successfully');
    return session;
  } catch (error) {
    console.error('❌ Error refreshing session:', error);
    return null;
  }
};

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