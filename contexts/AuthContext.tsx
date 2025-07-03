import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSupabaseAuth, TwitterUser } from '../hooks/useSupabaseAuth';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  walletAddress?: string;
  twitterConnected: boolean;
  walletConnected: boolean;
  selectedThemes: string[];
  setupCompleted?: boolean;
  // Twitter-specific fields
  displayName?: string;
  twitterId?: string;
  verified?: boolean;
  followerCount?: number;
  twitterHandle?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  showSetupModal: boolean;
  setShowSetupModal: (show: boolean) => void;
  // Supabase auth integration
  twitterUser: TwitterUser | null;
  isSupabaseAuthenticated: boolean;
  signOutFromTwitter: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Integrate Supabase authentication
  const { 
    user: twitterUser, 
    isAuthenticated: isSupabaseAuthenticated, 
    isLoading: isSupabaseLoading,
    signOut: supabaseSignOut,
    session,
    isInitialized: supabaseInitialized
  } = useSupabaseAuth();

  useEffect(() => {
    loadUserData();
  }, []);

  // Sync Supabase user with local user data and handle setup modal
  useEffect(() => {
    if (supabaseInitialized) {
      if (isSupabaseAuthenticated && twitterUser) {
        // We have full Twitter user data
        console.log('✅ Syncing full Twitter user data');
        syncTwitterUser(twitterUser);
      } else if (isSupabaseAuthenticated && session?.user) {
        // We have a session but no extracted Twitter data - create basic user
        console.log('✅ Creating basic user from session data');
        createBasicUserFromSession(session.user);
      } else if (!isSupabaseAuthenticated && user?.twitterConnected) {
        // If Supabase auth is lost but local user thinks they're connected, update local state
        console.log('ℹ️ Supabase auth lost, updating local user state');
        updateLocalUser({ twitterConnected: false });
      }
    }
  }, [twitterUser, isSupabaseAuthenticated, session, supabaseInitialized]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  };

  const createBasicUserFromSession = async (sessionUser: any) => {
    try {
      const existingUser = await AsyncStorage.getItem('user');
      let updatedUser: User;

      // Extract basic info from session user
      const basicUserData = {
        id: sessionUser.id,
        username: sessionUser.user_metadata?.user_name || 
                 sessionUser.user_metadata?.preferred_username || 
                 sessionUser.email?.split('@')[0] || 
                 `user_${sessionUser.id.slice(-8)}`,
        email: sessionUser.email || '',
        avatar: sessionUser.user_metadata?.avatar_url || 
               sessionUser.user_metadata?.picture ||
               'https://api.dicebear.com/7.x/avataaars/svg?seed=connected-user&backgroundColor=b6e3f4,c0aede,d1d4f9',
        displayName: sessionUser.user_metadata?.full_name || 
                    sessionUser.user_metadata?.name || 
                    'Twitter User',
        twitterId: sessionUser.user_metadata?.provider_id || sessionUser.id,
        verified: sessionUser.user_metadata?.verified || false,
        followerCount: sessionUser.user_metadata?.followers_count || 0,
        twitterHandle: sessionUser.user_metadata?.user_name || 
                      sessionUser.user_metadata?.preferred_username,
      };

      if (existingUser) {
        // Merge with existing user data
        const parsed = JSON.parse(existingUser);
        updatedUser = {
          ...parsed,
          ...basicUserData,
          twitterConnected: true,
        };
      } else {
        // Create new user from session data
        updatedUser = {
          ...basicUserData,
          twitterConnected: true,
          walletConnected: false,
          selectedThemes: [],
        };
      }

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log('✅ Created basic user from session:', updatedUser.username);
    } catch (error) {
      console.log('Error creating basic user from session:', error);
    }
  };

  const syncTwitterUser = async (twitterUserData: TwitterUser) => {
    try {
      const existingUser = await AsyncStorage.getItem('user');
      let updatedUser: User;

      if (existingUser) {
        // Merge with existing user data
        const parsed = JSON.parse(existingUser);
        updatedUser = {
          ...parsed,
          id: twitterUserData.id,
          username: twitterUserData.username,
          email: twitterUserData.email || parsed.email,
          avatar: twitterUserData.avatar,
          twitterConnected: true,
          displayName: twitterUserData.displayName,
          twitterId: twitterUserData.twitterId,
          verified: twitterUserData.verified,
          followerCount: twitterUserData.followerCount,
          twitterHandle: twitterUserData.twitterHandle,
        };
      } else {
        // Create new user from Twitter data
        updatedUser = {
          id: twitterUserData.id,
          username: twitterUserData.username,
          email: twitterUserData.email || '',
          avatar: twitterUserData.avatar,
          twitterConnected: true,
          walletConnected: false,
          selectedThemes: [],
          displayName: twitterUserData.displayName,
          twitterId: twitterUserData.twitterId,
          verified: twitterUserData.verified,
          followerCount: twitterUserData.followerCount,
          twitterHandle: twitterUserData.twitterHandle,
        };
      }

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log('✅ Synced Twitter user:', updatedUser.username);
    } catch (error) {
      console.log('Error syncing Twitter user:', error);
    }
  };

  const updateLocalUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.log('Error updating local user:', error);
    }
  };

  const login = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.log('Error saving user data:', error);
    }
  };

  const logout = async () => {
    try {
      // Clear all storage first
      await AsyncStorage.multiRemove([
        'user',
        'sb-auth-token',
        'sb-refresh-token',
        'sb:token',
        'sb:state',
        'sb:provider-token',
        'sb:session',
        'supabase.auth.token',
        'supabase.auth.token.iss',
        `sb-${supabaseUrl?.replace(/^https?:\/\//, '').split('.')[0]}-auth-token`,
        `sb-${supabaseUrl?.replace(/^https?:\/\//, '').split('.')[0]}-refresh-token`,
      ]);
      
      // Reset user state
      setUser(null);
      
      // Sign out from Supabase if authenticated
      if (isSupabaseAuthenticated) {
        await supabaseSignOut();
      }
      
      // Force a hard reset of the auth state
      setShowSetupModal(false);
      
      console.log('✅ Successfully logged out and cleared all auth data');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Even if there's an error, ensure we clear the user state
      setUser(null);
      setShowSetupModal(false);
    }
  };

  const signOutFromTwitter = async () => {
    try {
      // First, sign out from Supabase
      await supabaseSignOut();
      
      // Clear all auth-related storage
      await AsyncStorage.multiRemove([
        'sb-auth-token',
        'sb-refresh-token',
        'sb:token',
        'sb:state',
        'sb:provider-token',
        'sb:session',
        'supabase.auth.token',
        'supabase.auth.token.iss',
        `sb-${supabaseUrl?.replace(/^https?:\/\//, '').split('.')[0]}-auth-token`,
        `sb-${supabaseUrl?.replace(/^https?:\/\//, '').split('.')[0]}-refresh-token`,
      ]);
      
      // Update local user to reflect Twitter disconnection
      if (user) {
        const updatedUser = {
          ...user,
          twitterConnected: false,
          twitterId: undefined,
          twitterHandle: undefined,
          verified: false,
          followerCount: 0,
        };
        
        // Only keep the user in storage if they have other data we want to preserve
        if (user.walletConnected || (user.selectedThemes && user.selectedThemes.length > 0)) {
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        } else {
          // If no other important data, remove the user completely
          await AsyncStorage.removeItem('user');
          setUser(null);
        }
      }
      
      console.log('✅ Successfully signed out from Twitter');
    } catch (error) {
      console.error('❌ Error signing out from Twitter:', error);
      // Even if there's an error, ensure we clear the auth state
      await AsyncStorage.removeItem('user');
      setUser(null);
      throw error; // Re-throw to allow error handling in components
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.log('Error updating user data:', error);
    }
  };

  // Determine overall authentication status
  const isAuthenticated = !!user || isSupabaseAuthenticated;
  const finalIsLoading = isLoading || isSupabaseLoading;

  // Check if setup is needed when user data changes
  useEffect(() => {
    if (user && !user.setupCompleted && !showSetupModal) {
      setShowSetupModal(true);
    }
  }, [user, showSetupModal]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: isAuthenticated,
        isLoading: finalIsLoading,
        initialized: initialized && supabaseInitialized,
        login,
        logout,
        updateUser,
        showSetupModal,
        setShowSetupModal,
        // Supabase auth integration
        twitterUser,
        isSupabaseAuthenticated,
        signOutFromTwitter,
      }}>
      {children}
    </AuthContext.Provider>
  );
};