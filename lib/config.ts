// Get the base URL for API and WebSocket connections
export const getBaseUrl = (): string => {
  // In development, handle different environments
  if (__DEV__) {
    // For web platform
    if (typeof window !== 'undefined') {
      return 'http://localhost:8081';
    }
  }
  
  // In production, use the current hostname
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback for server-side rendering
  return process.env.EXPO_PUBLIC_SITE_URL || 'http://localhost:8081';
};

export const API_URL = getBaseUrl() + '/api';
// For WebSocket URL, handle both http and https
const baseUrl = getBaseUrl();
export const WS_URL = baseUrl.startsWith('https') 
  ? baseUrl.replace(/^https/, 'wss')
  : baseUrl.replace(/^http/, 'ws');
