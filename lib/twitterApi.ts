// Twitter API integration for fetching #xquests tweets
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

// Twitter API configuration
const TWITTER_API_BASE_URL = 'https://api.twitter.com/2';
const BEARER_TOKEN = process.env.EXPO_PUBLIC_TWITTER_BEARER_TOKEN;

// Fallback tweets for when API is not available or fails
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

// Generate additional fallback tweets for "load more" functionality
const generateMoreFallbackTweets = (count: number = 3): CommunityTweet[] => {
  const templates = [
    {
      username: "crypto_newbie",
      displayName: "Emma Johnson",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      content: "Learning about smart contracts through #xquests has been amazing! The community here is so supportive 💪 #blockchain #learning",
      verified: false,
      challengeTag: "Education"
    },
    {
      username: "algo_trader",
      displayName: "Michael Chen",
      avatar: "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      content: "Passive income through DeFi staking explained! My #xquests challenge breaks down the risks and rewards 📈 #defi #algorand",
      verified: true,
      challengeTag: "DeFi Education"
    },
    {
      username: "web3_builder",
      displayName: "Lisa Park",
      avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      content: "Building the future one dApp at a time! My #xquests submission showcases how blockchain can revolutionize supply chains 🔗",
      verified: false,
      challengeTag: "Innovation"
    },
    {
      username: "nft_artist",
      displayName: "Carlos Rodriguez",
      avatar: "https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      content: "Creating meaningful NFT art for my #xquests challenge! Art + blockchain = endless possibilities 🎨⛓️ #nft #digitalart",
      verified: false,
      challengeTag: "NFT Art"
    },
    {
      username: "dao_governance",
      displayName: "Rachel Kim",
      avatar: "https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      content: "Decentralized governance is the future of organizations! My #xquests submission explores DAO best practices 🗳️ #dao #governance",
      verified: true,
      challengeTag: "DAO"
    }
  ];

  return Array.from({ length: count }, (_, index) => {
    const template = templates[index % templates.length];
    const timestamp = Math.floor(Math.random() * 60) + 20; // 20-80 minutes ago
    
    return {
      id: `generated_${Date.now()}_${index}`,
      username: template.username,
      displayName: template.displayName,
      avatar: template.avatar,
      content: template.content,
      timestamp: `${timestamp}m`,
      likes: Math.floor(Math.random() * 100) + 10,
      retweets: Math.floor(Math.random() * 50) + 5,
      replies: Math.floor(Math.random() * 20) + 2,
      verified: template.verified,
      challengeTag: template.challengeTag
    };
  });
};

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

// Fetch tweets from Twitter API
export const fetchXQuestsTweets = async (maxResults: number = 10, nextToken?: string): Promise<{
  tweets: CommunityTweet[];
  nextToken?: string;
  success: boolean;
  error?: string;
}> => {
  // Check if we have a bearer token
  if (!BEARER_TOKEN) {
    console.warn('Twitter Bearer Token not found. Using fallback tweets.');
    return {
      tweets: FALLBACK_TWEETS.slice(0, maxResults),
      success: true
    };
  }

  try {
    // Build query parameters
    const params = new URLSearchParams({
      'query': '#xquests -is:retweet lang:en',
      'max_results': Math.min(maxResults, 100).toString(), // Twitter API limit is 100
      'tweet.fields': 'created_at,public_metrics,author_id',
      'user.fields': 'name,username,profile_image_url,verified',
      'expansions': 'author_id',
      'sort_order': 'relevancy' // Get popular tweets first
    });

    if (nextToken) {
      params.append('next_token', nextToken);
    }

    const url = `${TWITTER_API_BASE_URL}/tweets/search/recent?${params.toString()}`;

    console.log('🐦 Fetching tweets from Twitter API...');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
    }

    const data: TwitterApiResponse = await response.json();
    
    console.log('✅ Successfully fetched tweets from Twitter API');
    console.log(`📊 Retrieved ${data.data?.length || 0} tweets`);

    const transformedTweets = transformTwitterTweets(data);

    return {
      tweets: transformedTweets,
      nextToken: data.meta.next_token,
      success: true
    };

  } catch (error: any) {
    console.error('❌ Error fetching tweets from Twitter API:', error);
    
    // Return fallback tweets on error
    console.log('🔄 Using fallback tweets due to API error');
    
    return {
      tweets: FALLBACK_TWEETS.slice(0, maxResults),
      success: false,
      error: error.message
    };
  }
};

// Load more tweets (either from API or generate fallback)
export const loadMoreXQuestsTweets = async (nextToken?: string): Promise<{
  tweets: CommunityTweet[];
  nextToken?: string;
  success: boolean;
  error?: string;
}> => {
  // If we have a next token, try to fetch from API
  if (nextToken && BEARER_TOKEN) {
    return await fetchXQuestsTweets(10, nextToken);
  }

  // Otherwise, generate more fallback tweets
  console.log('🔄 Generating additional fallback tweets');
  
  return {
    tweets: generateMoreFallbackTweets(3),
    success: true
  };
};

// Refresh tweets (get latest)
export const refreshXQuestsTweets = async (): Promise<{
  tweets: CommunityTweet[];
  nextToken?: string;
  success: boolean;
  error?: string;
}> => {
  console.log('🔄 Refreshing #xquests tweets...');
  return await fetchXQuestsTweets(10); // Get fresh tweets without next token
};

// Check if Twitter API is available
export const isTwitterApiAvailable = (): boolean => {
  return !!BEARER_TOKEN;
};

// Get API status for debugging
export const getTwitterApiStatus = () => {
  return {
    hasToken: !!BEARER_TOKEN,
    tokenPreview: BEARER_TOKEN ? `${BEARER_TOKEN.substring(0, 10)}...` : 'Not set',
    platform: Platform.OS,
    apiUrl: TWITTER_API_BASE_URL
  };
};