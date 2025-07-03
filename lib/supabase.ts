import { createClient, type Session, type User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import { WebBrowserAuthSessionResult } from 'expo-web-browser';
import { UserProfile } from './userService';

// Get environment variables from Expo config
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables. Authentication will not work.');
  console.warn('Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file');
}

// Required for web only
if (typeof window !== 'undefined') {
  WebBrowser.maybeCompleteAuthSession();
}

// Create a custom storage adapter that works in all environments
const isWeb = Platform.OS === 'web';

const customStorage = {
  getItem: async (key: string) => {
    try {
      if (isWeb) {
        // For web, check if we're in a browser environment
        if (typeof window !== 'undefined' && window.localStorage) {
          return localStorage.getItem(key);
        }
        return null;
      }
      // For native platforms, use AsyncStorage
      if (AsyncStorage) {
        return await AsyncStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.warn('Error accessing storage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      if (isWeb) {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(key, value);
        }
      } else if (AsyncStorage) {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('Error setting storage item:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      if (isWeb) {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(key);
        }
      } else if (AsyncStorage) {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('Error removing storage item:', error);
    }
  },
};

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS !== 'web',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Type for realtime subscription callback payload
export type ProfileSubscriptionCallbackPayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: UserProfile;
  old?: UserProfile;
};

type ProfileSubscriptionCallback = (payload: ProfileSubscriptionCallbackPayload) => void;

// Subscribe to profile changes
export const subscribeToProfileChanges = (
  userId: string,
  callback: ProfileSubscriptionCallback
) => {
  const subscription = supabase
    .channel('public:profiles')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as UserProfile,
          old: payload.old as UserProfile | undefined,
        });
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

// Get redirect URI with proper SSR handling
const getRedirectUri = () => {
  if (Platform.OS === 'web') {
    // Check if we're in a browser environment (not SSR)
    if (typeof window !== 'undefined' && window.location) {
      return `${window.location.origin}/auth/callback`;
    } else {
      // Fallback for SSR - use a placeholder that will be replaced client-side
      return 'https://localhost:8081/auth/callback';
    }
  }
  
  return makeRedirectUri({
    scheme: 'xquests',
    path: 'auth/callback',
  });
};

// Initialize redirect URI lazily to avoid SSR issues
let redirectTo: string | null = null;

const getRedirectToUri = () => {
  if (!redirectTo) {
    redirectTo = getRedirectUri();
    console.log('🔗 Redirect URI:', redirectTo);
  }
  return redirectTo;
};

/**
 * Creates a session from a URL, typically after OAuth redirect
 * @param url The URL containing the authentication data
 * @returns The session data if successful
 */
export const createSessionFromUrl = async (url: string): Promise<{
  session: Session | null;
  user: User | null;
  error: Error | null;
}> => {
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
          return { session, user: null, error: null };
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
          return { session: fallbackSession, user: null, error: null };
        }
        
        throw error;
      }

      console.log('✅ Session created successfully with tokens');
      return { session: data.session, user: null, error: null };
    }

    // Method 2: Authorization code exchange
    if (code) {
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('❌ Error exchanging code:', error);
        throw error;
      }
      
      return { session: data.session, user: null, error: null };
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      return { session, user: null, error: null };
    }

    return { session: null, user: null, error: null };

  } catch (error: any) {
    console.error('❌ Error in createSessionFromUrl:', error);
    
    // Last resort: check for any existing session
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        return { session, user: null, error: null };
      }
    } catch (fallbackError) {
      console.error('❌ Fallback session check failed:', fallbackError);
    }
    
    throw error;
  }
};

/**
 * Performs OAuth authentication
 * @returns Object containing success status, error (if any), and session data
 */
export const performOAuth = async (): Promise<{ 
  success: boolean; 
  error?: string; 
  session?: Session;
  user?: User;
}> => {
  console.log('🐦 Starting Twitter OAuth...');
  
  try {
    // Validate Twitter OAuth configuration
    const configValidation = validateTwitterOAuthConfig();
    if (!configValidation.valid) {
      console.error('❌ Twitter OAuth configuration is invalid:', configValidation.issues);
      throw new Error(`Twitter OAuth configuration error: ${configValidation.issues.join(', ')}`);
    }
    
    // Get redirect URI for debugging
    const redirectUri = getRedirectToUri();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: redirectUri,
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
    
    // Open OAuth URL in browser with enhanced options
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUri,
      {
        showInRecents: true,
        preferEphemeralSession: false,
        createTask: false,
      }
    ) as WebBrowserAuthSessionResult;

      console.log('📱 OAuth browser result:', {
      type: result.type,
      // @ts-ignore - The URL might be available in the result
      url: result.url || 'No URL in result',
    });

    // @ts-ignore - The URL might be available in the result
    const resultUrl = result.url || (result as any).params?.url;
    if (result.type === 'success' && resultUrl) {
 
      try {
        const { session, user, error } = await createSessionFromUrl(resultUrl);
        
        if (session) {
          return { 
            success: true, 
            session,
            user: user || undefined
          };
        } else {
          const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
          if (currentSession) {
            return { 
              success: true, 
              session: currentSession,
              user: currentSession.user
            };
          } else {
            console.error('❌ OAuth completed but no session was created', error);
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
            'https://api.dicebear.com/7.x/avataaars/svg?seed=twitter-user&backgroundColor=b6e3f4,c0aede,d1d4f9',
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

  return extractedData;
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
  
  // Check if we're in a proper environment for OAuth
  if (Platform.OS === 'web' && typeof window === 'undefined') {
    issues.push('OAuth requires a browser environment');
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

const clearAllStorage = async () => {
  try {
    const storage = customStorage;
    
    // Get all keys from storage
    let allKeys: string[] = [];
    if (isWeb && typeof window !== 'undefined' && window.localStorage) {
      allKeys = Object.keys(localStorage);
    } else if (AsyncStorage) {
      const asyncStorageKeys = await AsyncStorage.getAllKeys();
      allKeys = [...asyncStorageKeys]; // Convert readonly array to mutable array
    }
    
    // Filter and remove all Supabase and auth related keys
    const supabaseKeys = allKeys.filter(key => 
      key.startsWith('sb-') || 
      key.startsWith('expo-') ||
      key.startsWith('auth.') ||
      key.includes('supabase') ||
      key.includes('session')
    );

    // Add common auth keys that might be missed
    const commonAuthKeys = [
      'sb:token',
      'sb:state',
      'sb:provider-token',
      'sb:session',
      'sb-auth-token',
      'sb-refresh-token',
      'supabase.auth.token',
      'supabase.auth.token.iss',
      `sb-${supabaseUrl?.replace(/^https?:\/\//, '').split('.')[0]}-auth-token`,
      `sb-${supabaseUrl?.replace(/^https?:\/\//, '').split('.')[0]}-refresh-token`,
    ];

    // Combine and dedupe keys
    const keysToRemove = [...new Set([...supabaseKeys, ...commonAuthKeys])];
    
    // Remove each key from storage
    await Promise.all(keysToRemove.map(key => storage.removeItem(key)));
    
    // Clear all cookies if in web
    if (isWeb && typeof document !== 'undefined') {
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.split('=');
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      });
    }
    
    console.log('✅ Storage cleared successfully');
    return true;
  } catch (error) {
    console.warn('⚠️ Error clearing storage:', error);
    return false;
  }
};

export const signOut = async () => {
  try {
    console.log('🚪 Signing out...');
    
    // Clear storage first
    await clearAllStorage();
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
    
    // Clear storage again to catch any new tokens
    await clearAllStorage();
    
    // Clear Expo auth session
    if (WebBrowser.dismissAuthSession) {
      await WebBrowser.dismissAuthSession();
    }
    
    // Complete any pending auth sessions
    if (WebBrowser.maybeCompleteAuthSession) {
      WebBrowser.maybeCompleteAuthSession();
    }
    
    // Force clear any remaining auth state
    if (isWeb && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
      window.sessionStorage.clear();
    }
    
    console.log('✅ Successfully signed out and storage cleared');
    return { success: true };
  } catch (error) {
    console.error('❌ Error signing out:', error);
    // Still try to clear storage even if sign out fails
    await clearAllStorage();
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