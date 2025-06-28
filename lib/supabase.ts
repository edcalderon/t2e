import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Environment variables validation
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage for session persistence on mobile
    storage: Platform.OS !== 'web' ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Helper function to get Twitter user data from Supabase user
export const getTwitterUserData = (user: any) => {
  if (!user) return null;

  const twitterData = user.user_metadata;
  
  return {
    id: user.id,
    email: user.email,
    username: twitterData?.user_name || twitterData?.preferred_username || 'user',
    displayName: twitterData?.full_name || twitterData?.name || 'User',
    avatar: twitterData?.avatar_url || twitterData?.picture || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    twitterId: twitterData?.provider_id || twitterData?.sub,
    verified: twitterData?.verified || false,
    followerCount: twitterData?.public_metrics?.followers_count || 0,
    twitterHandle: twitterData?.user_name || twitterData?.preferred_username,
  };
};

// Helper function to sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error };
  }
};

// Helper function to get current session
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Helper function to refresh session
export const refreshSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
};