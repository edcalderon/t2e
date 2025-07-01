import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  colors: {
    background: string;
    surface: string;
    surfaceSecondary: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    primary: string;
    primaryLight: string;
    success: string;
    warning: string;
    error: string;
    border: string;
    borderLight: string;
    accent: string;
    overlay: string;
    xqblue: {
      light: string;
      DEFAULT: string;
      dark: string;
    };
    xqcyan: {
      light: string;
      DEFAULT: string;
      dark: string;
    };
    xqpurple: {
      light: string;
      DEFAULT: string;
      dark: string;
    };
    xqdark: {
      light: string;
      DEFAULT: string;
      dark: string;
    };
  };
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceSecondary: '#FFFFFF',
    text: '#0F1419',
    textSecondary: '#536471',
    textTertiary: '#8B98A5',
    primary: '#1D9BF0',
    primaryLight: '#E1F5FE',
    success: '#00BA7C',
    warning: '#FFD700',
    error: '#F4212E',
    border: '#EFF3F4',
    borderLight: '#F7F9FA',
    accent: '#794BC4',
    overlay: 'rgba(0, 0, 0, 0.4)',
    xqblue: {
      light: '#60A5FA',
      DEFAULT: '#3B82F6',
      dark: '#1D4ED8',
    },
    xqcyan: {
      light: '#67E8F9',
      DEFAULT: '#06B6D4',
      dark: '#0891B2',
    },
    xqpurple: {
      light: '#A78BFA',
      DEFAULT: '#8B5CF6',
      dark: '#7C3AED',
    },
    xqdark: {
      light: '#6B7280',
      DEFAULT: '#374151',
      dark: '#1F2937',
    },
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    background: '#000000',
    surface: '#16181C',
    surfaceSecondary: '#1E2328',
    text: '#E7E9EA',
    textSecondary: '#71767B',
    textTertiary: '#5B7083',
    primary: '#1D9BF0',
    primaryLight: '#0F1419',
    success: '#00BA7C',
    warning: '#FFD700',
    error: '#F4212E',
    border: '#2F3336',
    borderLight: '#3E4144',
    accent: '#794BC4',
    overlay: 'rgba(0, 0, 0, 0.6)',
    xqblue: {
      light: '#60A5FA',
      DEFAULT: '#3B82F6',
      dark: '#1D4ED8',
    },
    xqcyan: {
      light: '#67E8F9',
      DEFAULT: '#06B6D4',
      dark: '#0891B2',
    },
    xqpurple: {
      light: '#A78BFA',
      DEFAULT: '#8B5CF6',
      dark: '#7C3AED',
    },
    xqdark: {
      light: '#6B7280',
      DEFAULT: '#374151',
      dark: '#1F2937',
    },
  },
  isDark: true,
};

import { StatusBarStyle } from 'expo-status-bar';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  setTheme: (isDark: boolean) => void;
  /**
   * Preferred status bar style based on current theme.
   * "light" for dark theme backgrounds, "dark" for light theme backgrounds.
   */
  statusBarStyle: StatusBarStyle;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

type ThemeProviderProps = {
  children?: React.ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDark, setIsDark] = useState(true); // Default to dark theme like X

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const setTheme = async (newIsDark: boolean) => {
    setIsDark(newIsDark);
    try {
      await AsyncStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;
  const statusBarStyle: StatusBarStyle = isDark ? 'light' : 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark, setTheme, statusBarStyle }}>
      {children}
    </ThemeContext.Provider>
  );
};