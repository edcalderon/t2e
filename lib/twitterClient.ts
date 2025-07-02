import { Client } from "twitter-api-sdk";
import { FALLBACK_TWEETS, ADDITIONAL_FALLBACK_TWEETS } from './fallbackTweets';
import { TweetLoadResult } from "./twitterInterfaces.js";

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN || '';
const client = new Client(TWITTER_BEARER_TOKEN);
let fallbackPageIndex = 0;
const FALLBACK_PAGE_SIZE = 10;


export const fetchTweets = async (nextToken?: string, customQuery?: string): Promise<TweetLoadResult> => {
  const query = customQuery || '#xquests';
  console.log(`🔍 Fetching tweets with query: ${query}`, { nextToken });

  if (!TWITTER_BEARER_TOKEN) {
    console.log('ℹ️ No Twitter Bearer Token found, using fallback tweets');
    return getFallbackTweets(nextToken, query);
  }

  try {
    const response = await client.tweets.tweetsRecentSearch({
      query: `${query} -is:retweet -is:reply`,
      max_results: 10,
      'tweet.fields': ['author_id', 'created_at', 'public_metrics', 'text'],
      'user.fields': ['name', 'username', 'profile_image_url', 'verified'],
      'expansions': ['author_id'],
      'pagination_token': nextToken,
    });
    console.log('Twitter API response:', response);

    if (!response.data || response.data.length === 0) {
      console.log('ℹ️ No tweets found from Twitter API, using fallback');
      return getFallbackTweets(nextToken, query);
    }

    const tweets = response.data.map(tweet => {
      const user = response.includes?.users?.find(u => u.id === tweet.author_id);
      const createdAt = tweet.created_at ? new Date(tweet.created_at) : new Date();
      const timeDiff = Math.floor((Date.now() - createdAt.getTime()) / 1000);
      
      // Format timestamp to be more readable (e.g., "2h ago", "1d ago")
      let formattedTimestamp = '';
      if (timeDiff < 60) {
        formattedTimestamp = 'Just now';
      } else if (timeDiff < 3600) {
        formattedTimestamp = `${Math.floor(timeDiff / 60)}m ago`;
      } else if (timeDiff < 86400) {
        formattedTimestamp = `${Math.floor(timeDiff / 3600)}h ago`;
      } else {
        formattedTimestamp = `${Math.floor(timeDiff / 86400)}d ago`;
      }

      // Extract hashtags from tweet text
      const hashtags = tweet.text.match(/#\w+/g) || [];
      const challengeTag = hashtags.find(tag => tag.toLowerCase() !== '#xquests')?.replace('#', '') || 'General';
      
      return {
        id: tweet.id,
        username: user?.username?.toLowerCase() || 'unknown',
        displayName: user?.name || 'Unknown User',
        avatar: user?.profile_image_url?.replace('_normal', '_bigger') || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
        content: tweet.text,
        timestamp: formattedTimestamp,
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        replies: tweet.public_metrics?.reply_count || 0,
        verified: user?.verified || false,
        challengeTag,
        followerCount: user?.public_metrics?.followers_count || 0,
      };
    });

    return {
      tweets,
      success: true,
      hasMore: !!response.meta?.next_token,
      isUsingFallback: false,
      nextToken: response.meta?.next_token,
      query
    };

  } catch (error: any) {
    console.error('❌ Error fetching tweets from Twitter API:', error);
    return getFallbackTweets(nextToken, query, error.message);
  }
};

const getFallbackTweets = (nextToken?: string, query: string = '#xquests', errorMessage?: string): TweetLoadResult => {
  console.log('🔄 Using fallback tweets');
  
  if (!nextToken) {
    fallbackPageIndex = 0;
  }
  
  const allFallbackTweets = [...FALLBACK_TWEETS, ...ADDITIONAL_FALLBACK_TWEETS];
  const startIndex = fallbackPageIndex * FALLBACK_PAGE_SIZE;
  const endIndex = startIndex + FALLBACK_PAGE_SIZE;
  const paginatedTweets = allFallbackTweets.slice(startIndex, endIndex);
  const hasMore = endIndex < allFallbackTweets.length;

  fallbackPageIndex++;

  return {
    tweets: paginatedTweets,
    success: true,
    error: errorMessage || 'Using fallback data',
    hasMore,
    isUsingFallback: true,
    nextToken: hasMore ? `fallback_page_${fallbackPageIndex}` : undefined,
    query
  };
};

export default client;
