// Updated Twitter API client with enhanced load more functionality and feedback
import { Platform } from 'react-native';

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
  author?: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string;
    verified: boolean;
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
}

export interface TweetLoadResult {
  tweets: CommunityTweet[];
  nextToken?: string;
  success: boolean;
  error?: string;
  hasMore: boolean;
  isUsingFallback: boolean;
}

// Enhanced fallback tweets for when API is not available
const FALLBACK_TWEETS: CommunityTweet[] = [
  {
    id: "fallback_1",
    username: "cryptodev_alex",
    displayName: "Alex Chen",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    content: "Just completed my first #xquests challenge! Explaining DeFi to my non-crypto friends was harder than I thought, but so rewarding 🚀 #crypto #education",
    timestamp: "2m",
    likes: 24,
    retweets: 8,
    replies: 3,
    verified: false,
    challengeTag: "DeFi Education"
  },
  {
    id: "fallback_2",
    username: "web3_sarah",
    displayName: "Sarah Martinez",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    content: "The future of AI is here and it's incredible! Working on my #xquests submission about AI in healthcare. The potential to save lives is mind-blowing 🤖💊",
    timestamp: "5m",
    likes: 67,
    retweets: 23,
    replies: 12,
    verified: true,
    challengeTag: "AI Innovation"
  },
  {
    id: "fallback_3",
    username: "blockchain_bob",
    displayName: "Bob Thompson",
    avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    content: "Building communities in web3 isn't just about tech - it's about people! My #xquests challenge focuses on human connection in digital spaces 🌐❤️",
    timestamp: "8m",
    likes: 45,
    retweets: 15,
    replies: 7,
    verified: false,
    challengeTag: "Community Building"
  },
  {
    id: "fallback_4",
    username: "algo_enthusiast",
    displayName: "Maria Rodriguez",
    avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    content: "Algorand's carbon-negative blockchain is the future! 🌱 Just earned 35 ALGO from my #xquests sustainability challenge. Green crypto FTW! #algorand #sustainability",
    timestamp: "12m",
    likes: 89,
    retweets: 34,
    replies: 18,
    verified: true,
    challengeTag: "Sustainability"
  },
  {
    id: "fallback_5",
    username: "nft_creator_jane",
    displayName: "Jane Wilson",
    avatar: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    content: "NFTs beyond art: digital identity, certificates, memberships... the possibilities are endless! My #xquests submission explores real-world utility 🎨➡️🌍",
    timestamp: "15m",
    likes: 52,
    retweets: 19,
    replies: 9,
    verified: false,
    challengeTag: "NFT Innovation"
  },
  {
    id: "fallback_6",
    username: "defi_wizard",
    displayName: "David Kim",
    avatar: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    content: "Yield farming strategies that actually make sense! Breaking down complex DeFi concepts for my #xquests challenge. Education is key to adoption 📚💰",
    timestamp: "18m",
    likes: 73,
    retweets: 28,
    replies: 14,
    verified: true,
    challengeTag: "DeFi Education"
  }
];

// Additional fallback tweets for load more functionality
const ADDITIONAL_FALLBACK_TWEETS: CommunityTweet[] = [
  {
    id: "fallback_7",
    username: "crypto_newbie",
    displayName: "Emma Johnson",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    content: "Learning about smart contracts through #xquests has been amazing! The community here is so supportive 💪 #blockchain #learning",
    timestamp: "22m",
    likes: 31,
    retweets: 12,
    replies: 5,
    verified: false,
    challengeTag: "Education"
  },
  {
    id: "fallback_8",
    username: "algo_trader",
    displayName: "Michael Chen",
    avatar: "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    content: "Passive income through DeFi staking explained! My #xquests challenge breaks down the risks and rewards 📈 #defi #algorand",
    timestamp: "25m",
    likes: 58,
    retweets: 21,
    replies: 8,
    verified: true,
    challengeTag: "DeFi Education"
  },
  {
    id: "fallback_9",
    username: "web3_builder",
    displayName: "Lisa Park",
    avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    content: "Building the future one dApp at a time! My #xquests submission showcases how blockchain can revolutionize supply chains 🔗",
    timestamp: "28m",
    likes: 42,
    retweets: 16,
    replies: 6,
    verified: false,
    challengeTag: "Innovation"
  }
];

// Track pagination state for fallback mode
let fallbackPageIndex = 0;
const FALLBACK_PAGE_SIZE = 3;

// Format timestamp from Twitter API format to relative time
const formatTimestamp = (twitterTimestamp: string): string => {
  const tweetDate = new Date(twitterTimestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - tweetDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)}d`;
  }
};

// Extract challenge tag from tweet content
const extractChallengeTag = (content: string): string | undefined => {
  const challengeKeywords = {
    'defi': 'DeFi Education',
    'nft': 'NFT Innovation',
    'ai': 'AI Innovation',
    'blockchain': 'Blockchain',
    'crypto': 'Crypto Education',
    'web3': 'Web3',
    'algorand': 'Algorand',
    'sustainability': 'Sustainability',
    'dao': 'DAO',
    'education': 'Education',
    'community': 'Community Building',
    'innovation': 'Innovation'
  };

  const lowerContent = content.toLowerCase();
  
  for (const [keyword, tag] of Object.entries(challengeKeywords)) {
    if (lowerContent.includes(keyword)) {
      return tag;
    }
  }
  
  return undefined;
};

// Transform Twitter API response to our format
const transformTwitterTweets = (apiResponse: TwitterApiResponse): CommunityTweet[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return [];
  }

  return apiResponse.data.map((tweet) => {
    // Find the author from includes
    const author = apiResponse.includes?.users?.find(user => user.id === tweet.author_id);
    
    return {
      id: tweet.id,
      username: author?.username || 'unknown_user',
      displayName: author?.name || 'Unknown User',
      avatar: author?.profile_image_url?.replace('_normal', '_400x400') || 
              'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      content: tweet.text,
      timestamp: formatTimestamp(tweet.created_at),
      likes: tweet.public_metrics.like_count,
      retweets: tweet.public_metrics.retweet_count,
      replies: tweet.public_metrics.reply_count,
      verified: author?.verified || false,
      challengeTag: extractChallengeTag(tweet.text)
    };
  });
};

// Get the API endpoint URL (works for both web and mobile)
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return '/api/tweets';
  } else {
    return 'https://your-app-domain.com/api/tweets';
  }
};

// Fetch tweets using secure server-side proxy with enhanced load more
export const fetchXQuestsTweets = async (maxResults: number = 10, nextToken?: string): Promise<TweetLoadResult> => {
  try {
    const params = new URLSearchParams({
      max_results: maxResults.toString()
    });

    if (nextToken) {
      params.append('next_token', nextToken);
    }

    const url = `${getApiUrl()}?${params.toString()}`;
    
    console.log('🔒 Fetching tweets via secure proxy...');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // Handle fallback case
    if (result.fallback || !result.success) {
      console.log('🔄 Using fallback tweets (API not configured or failed)');
      
      // Reset pagination for initial load
      if (!nextToken) {
        fallbackPageIndex = 0;
      }
      
      const startIndex = fallbackPageIndex * FALLBACK_PAGE_SIZE;
      const endIndex = startIndex + maxResults;
      const allFallbackTweets = [...FALLBACK_TWEETS, ...ADDITIONAL_FALLBACK_TWEETS];
      const paginatedTweets = allFallbackTweets.slice(startIndex, endIndex);
      const hasMore = endIndex < allFallbackTweets.length;
      
      // Update pagination index for next load
      fallbackPageIndex++;
      
      return {
        tweets: paginatedTweets,
        success: true,
        error: result.error,
        hasMore,
        isUsingFallback: true,
        nextToken: hasMore ? `fallback_page_${fallbackPageIndex}` : undefined
      };
    }

    // Transform real Twitter data
    const transformedTweets = transformTwitterTweets({
      data: result.data,
      includes: result.includes,
      meta: result.meta
    });

    console.log('✅ Successfully fetched tweets via secure proxy');
    console.log(`📊 Retrieved ${transformedTweets.length} tweets`);

    return {
      tweets: transformedTweets,
      nextToken: result.nextToken,
      success: true,
      hasMore: !!result.nextToken && transformedTweets.length > 0,
      isUsingFallback: false
    };

  } catch (error: any) {
    console.error('❌ Error fetching tweets via proxy:', error);
    
    // Return fallback tweets on error
    console.log('🔄 Using fallback tweets due to proxy error');
    
    // Reset pagination for error fallback
    if (!nextToken) {
      fallbackPageIndex = 0;
    }
    
    const startIndex = fallbackPageIndex * FALLBACK_PAGE_SIZE;
    const endIndex = startIndex + maxResults;
    const allFallbackTweets = [...FALLBACK_TWEETS, ...ADDITIONAL_FALLBACK_TWEETS];
    const paginatedTweets = allFallbackTweets.slice(startIndex, endIndex);
    const hasMore = endIndex < allFallbackTweets.length;
    
    fallbackPageIndex++;
    
    return {
      tweets: paginatedTweets,
      success: false,
      error: error.message,
      hasMore,
      isUsingFallback: true,
      nextToken: hasMore ? `fallback_page_${fallbackPageIndex}` : undefined
    };
  }
};

// Enhanced load more tweets with proper pagination and feedback
export const loadMoreXQuestsTweets = async (nextToken?: string): Promise<TweetLoadResult> => {
  console.log('🔄 Loading more #xquests tweets...', { nextToken });
  
  if (!nextToken) {
    console.log('⚠️ No next token provided for load more');
    return {
      tweets: [],
      success: true,
      hasMore: false,
      isUsingFallback: false
    };
  }

  // Handle fallback pagination
  if (nextToken.startsWith('fallback_page_')) {
    console.log('🔄 Loading more fallback tweets');
    
    const startIndex = fallbackPageIndex * FALLBACK_PAGE_SIZE;
    const endIndex = startIndex + FALLBACK_PAGE_SIZE;
    const allFallbackTweets = [...FALLBACK_TWEETS, ...ADDITIONAL_FALLBACK_TWEETS];
    const paginatedTweets = allFallbackTweets.slice(startIndex, endIndex);
    const hasMore = endIndex < allFallbackTweets.length;
    
    fallbackPageIndex++;
    
    return {
      tweets: paginatedTweets,
      success: true,
      hasMore,
      isUsingFallback: true,
      nextToken: hasMore ? `fallback_page_${fallbackPageIndex}` : undefined
    };
  }

  // Load more real tweets using the next token
  return await fetchXQuestsTweets(10, nextToken);
};

// Refresh tweets (get latest) with reset pagination
export const refreshXQuestsTweets = async (): Promise<TweetLoadResult> => {
  console.log('🔄 Refreshing #xquests tweets...');
  
  // Reset fallback pagination
  fallbackPageIndex = 0;
  
  return await fetchXQuestsTweets(10); // Get fresh tweets without next token
};

// Check if Twitter API is available
export const isTwitterApiAvailable = (): boolean => {
  return true; // Always return true since we have fallback content
};

// Get API status for debugging
export const getTwitterApiStatus = () => {
  return {
    hasToken: 'Server-side only',
    tokenPreview: 'Hidden for security',
    platform: Platform.OS,
    apiUrl: getApiUrl(),
    secure: true
  };
};