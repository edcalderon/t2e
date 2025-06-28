import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSupabaseAuth, TwitterUser } from '../hooks/useSupabaseAuth';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  walletAddress?: string;
  twitterConnected: boolean;
  walletConnected: boolean;
  selectedThemes: string[];
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
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Integrate Supabase authentication
  const { 
    user: twitterUser, 
    isAuthenticated: isSupabaseAuthenticated, 
    isLoading: isSupabaseLoading,
    signOut: supabaseSignOut 
  } = useSupabaseAuth();

  useEffect(() => {
    loadUserData();
  }, []);

  // Sync Supabase user with local user data
  useEffect(() => {
    if (twitterUser && isSupabaseAuthenticated) {
      syncTwitterUser(twitterUser);
    } else if (!isSupabaseAuthenticated && user?.twitterConnected) {
      // If Supabase auth is lost but local user thinks they're connected, update local state
      updateLocalUser({ twitterConnected: false });
    }
  }, [twitterUser, isSupabaseAuthenticated]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    } finally {
      setIsLoading(false);
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
      await AsyncStorage.removeItem('user');
      setUser(null);
      
      // Also sign out from Supabase if authenticated
      if (isSupabaseAuthenticated) {
        await supabaseSignOut();
      }
    } catch (error) {
      console.log('Error removing user data:', error);
    }
  };

  const signOutFromTwitter = async () => {
    try {
      await supabaseSignOut();
      
      // Update local user to reflect Twitter disconnection
      if (user) {
        await updateLocalUser({ 
          twitterConnected: false,
          twitterId: undefined,
          twitterHandle: undefined,
          verified: false,
          followerCount: 0,
        });
      }
    } catch (error) {
      console.log('Error signing out from Twitter:', error);
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

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading: finalIsLoading,
      login,
      logout,
      updateUser,
      showSetupModal,
      setShowSetupModal,
      twitterUser,
      isSupabaseAuthenticated,
      signOutFromTwitter,
    }}>
      {children}
    </AuthContext.Provider>
  );
};