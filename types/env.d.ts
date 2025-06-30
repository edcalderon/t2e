declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Public environment variables (client-side)
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      
      // Server-side only environment variables
      TWITTER_BEARER_TOKEN: string;
    }
  }
}

// Ensure this file is treated as a module
export {};