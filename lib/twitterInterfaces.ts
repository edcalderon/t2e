export interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
  user?: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string;
    verified: boolean;
    public_metrics?: {
      followers_count: number;
      following_count: number;
      tweet_count: number;
    };
  };
}

export interface TwitterApiResponse {
  data: TwitterTweet[];
  includes?: {
    users: Array<{
      id: string;
      name: string;
      username: string;
      profile_image_url: string;
      verified: boolean;
      public_metrics?: {
        followers_count: number;
        following_count: number;
        tweet_count: number;
      };
    }>;
  };
  meta: {
    newest_id: string;
    oldest_id: string;
    result_count: number;
    next_token?: string;
  };
}

export interface CommunityTweet {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  verified: boolean;
  challengeTag?: string;
  followerCount?: number;
}

export interface TweetLoadResult {
  tweets: CommunityTweet[];
  nextToken?: string;
  success: boolean;
  error?: string;
  hasMore: boolean;
  isUsingFallback: boolean;
  query?: string;
}

export interface TweetResponse {
  tweets: any[];
  success: boolean;
  error?: string | null;
  hasMore: boolean;
  isUsingFallback: boolean;
  query: string;
  meta: {
    result_count: number;
    newest_id: string | null;
    oldest_id: string | null;
    next_token: string | null;
  };
  timestamp: string;
}