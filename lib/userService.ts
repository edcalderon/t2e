import { supabase } from './supabase';
import { TwitterUser } from '../hooks/useSupabaseAuth';

export interface UserProfile extends TwitterUser {
  id: string;
  updated_at?: string;
  created_at?: string;
}

export const userService = {
  // Create or update user profile
  async upsertUserProfile(userData: TwitterUser): Promise<{ data: UserProfile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            ...userData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error upserting user profile:', error);
      return { data: null, error: error as Error };
    }
  },

  // Get user profile by ID
  async getUserProfile(userId: string): Promise<{ data: UserProfile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error: error as Error };
    }
  },

  // Update user profile
  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<{ data: UserProfile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error: error as Error };
    }
  },

  // Get or create user profile from session
  async handleUserProfile(session: any): Promise<{ data: UserProfile | null; error: Error | null }> {
    try {
      const user = session?.user;
      if (!user) {
        throw new Error('No user in session');
      }

      // Get user data from Twitter OAuth
      const twitterUser = await getTwitterUserData(user);
      if (!twitterUser) {
        throw new Error('Failed to get user data from Twitter');
      }

      // Create or update user profile
      const { data: profile, error } = await this.upsertUserProfile({
        id: user.id,
        email: user.email || null,
        username: twitterUser.username,
        displayName: twitterUser.displayName,
        avatar: twitterUser.avatar,
        twitterId: twitterUser.twitterId,
        verified: twitterUser.verified,
        followerCount: twitterUser.followerCount,
        twitterHandle: twitterUser.twitterHandle,
      });

      if (error) throw error;
      return { data: profile, error: null };
    } catch (error) {
      console.error('Error handling user profile:', error);
      return { data: null, error: error as Error };
    }
  },
};

// Helper function to get Twitter user data (moved from supabase.ts)
async function getTwitterUserData(user: any): Promise<TwitterUser | null> {
  try {
    const userData = user?.user_metadata || user?.identities?.[0]?.identity_data;
    if (!userData) return null;

    return {
      id: user.id,
      email: user.email || null,
      username: userData.preferred_username || userData.user_name || userData.name?.replace(/\s+/g, '_').toLowerCase(),
      displayName: userData.full_name || userData.name || user.email?.split('@')[0] || 'Anonymous',
      avatar: userData.avatar_url || userData.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'U')}&background=random`,
      twitterId: userData.provider_id || user.id,
      verified: userData.email_verified || false,
      followerCount: 0, // Default value, can be updated later
      twitterHandle: userData.user_name || userData.preferred_username,
    };
  } catch (error) {
    console.error('Error getting Twitter user data:', error);
    return null;
  }
}
