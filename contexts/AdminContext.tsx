import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  adminLevel: 'none' | 'moderator' | 'admin' | 'super_admin';
  permissions: {
    canSendNotifications: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
    canManageContent: boolean;
  };
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { user, twitterUser, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminLevel, setAdminLevel] = useState<'none' | 'moderator' | 'admin' | 'super_admin'>('none');

  useEffect(() => {
    checkAdminStatus();
  }, [user, twitterUser, isAuthenticated]);

  const checkAdminStatus = async () => {
    setIsLoading(true);
    
    try {
      // Check if user is the initial admin (@xquests_site)
      const username = user?.username || twitterUser?.username || '';
      const twitterHandle = user?.twitterHandle || twitterUser?.twitterHandle || '';
      
      console.log('Checking admin status for:', { username, twitterHandle });
      
      if (username === 'xquests_site' || twitterHandle === 'xquests_site') {
        setIsAdmin(true);
        setAdminLevel('super_admin');
        console.log('✅ Super admin access granted for @xquests_site');
      } else {
        // In the future, you can add database checks for other admin users
        setIsAdmin(false);
        setAdminLevel('none');
        console.log('ℹ️ No admin access for user:', username);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setAdminLevel('none');
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissions = () => {
    switch (adminLevel) {
      case 'super_admin':
        return {
          canSendNotifications: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canManageContent: true,
        };
      case 'admin':
        return {
          canSendNotifications: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canManageContent: false,
        };
      case 'moderator':
        return {
          canSendNotifications: true,
          canManageUsers: false,
          canViewAnalytics: false,
          canManageContent: true,
        };
      default:
        return {
          canSendNotifications: false,
          canManageUsers: false,
          canViewAnalytics: false,
          canManageContent: false,
        };
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isLoading,
        adminLevel,
        permissions: getPermissions(),
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};