// Enhanced Twitter API route with proper #xquests query implementation
// Implements the exact curl command: curl -X GET "https://api.twitter.com/2/tweets/search/recent?query=%23xquests&max_results=10&tweet.fields=author_id,created_at,public_metrics" -H "Authorization: Bearer YOUR_BEARER_TOKEN"

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const maxResults = url.searchParams.get('max_results') || '10';
  const nextToken = url.searchParams.get('next_token');
  const query = url.searchParams.get('query') || '#xquests';

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Check if Bearer Token is available
  if (!TWITTER_BEARER_TOKEN) {
    console.log('❌ No Twitter Bearer Token found');
    return Response.json(
      { 
        success: false, 
        error: 'Twitter API not configured - Bearer Token missing',
        fallback: true,
        debug: {
          hasToken: false,
          environment: process.env.NODE_ENV || 'development',
          suggestion: 'Add TWITTER_BEARER_TOKEN to your .env file'
        }
      },
      { 
        status: 200,
        headers: corsHeaders 
      }
    );
  }

  // Validate Bearer Token format
  if (!TWITTER_BEARER_TOKEN.startsWith('AAAAAAAAAA')) {
    console.log('❌ Invalid Twitter Bearer Token format');
    return Response.json(
      { 
        success: false, 
        error: 'Invalid Twitter Bearer Token format',
        fallback: true,
        debug: {
          hasToken: true,
          tokenValid: false,
          suggestion: 'Ensure your Bearer Token starts with "AAAAAAAAAA"'
        }
      },
      { 
        status: 200,
        headers: corsHeaders 
      }
    );
  }

  try {
    // Build Twitter API URL with exact parameters from the curl command
    const twitterApiUrl = new URL('https://api.twitter.com/2/tweets/search/recent');
    
    // Add query parameters exactly as specified in the curl command
    twitterApiUrl.searchParams.append('query', query);
    twitterApiUrl.searchParams.append('max_results', Math.min(parseInt(maxResults), 100).toString());
    twitterApiUrl.searchParams.append('tweet.fields', 'author_id,created_at,public_metrics');
    
    // Add optional expansions for better user data
    twitterApiUrl.searchParams.append('expansions', 'author_id');
    twitterApiUrl.searchParams.append('user.fields', 'name,username,profile_image_url,verified,public_metrics');
    
    // Add pagination token if provided
    if (nextToken) {
      twitterApiUrl.searchParams.append('next_token', nextToken);
    }

    console.log('🐦 Making Twitter API request...');
    console.log('- URL:', twitterApiUrl.toString());
    console.log('- Query:', query);
    console.log('- Max Results:', maxResults);

    // Make the exact API call as specified in the curl command
    const response = await fetch(twitterApiUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'XQuests/1.0.0'
      },
    });

    console.log('📡 Twitter API Response:');
    console.log('- Status:', response.status);
    console.log('- Status Text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Twitter API Error:', response.status, errorText);
      
      let errorMessage = `Twitter API error: ${response.status} ${response.statusText}`;
      let suggestions = [];
      
      switch (response.status) {
        case 401:
          errorMessage = 'Twitter API authentication failed - Invalid Bearer Token';
          suggestions = [
            'Verify your Bearer Token is correct and active',
            'Check if the token has expired',
            'Regenerate your Bearer Token in Twitter Developer Portal'
          ];
          break;
        case 403:
          errorMessage = 'Twitter API access forbidden - Check your app permissions';
          suggestions = [
            'Your Twitter Developer account may need approval',
            'Check if your app has "Read" permissions',
            'Consider upgrading to Basic ($100/month) for full search access',
            'Some search endpoints require elevated access',
            'Free tier has limited search capabilities'
          ];
          break;
        case 429:
          errorMessage = 'Twitter API rate limit exceeded';
          suggestions = [
            'Wait 15 minutes before making more requests',
            'Implement proper rate limiting in your app',
            'Free tier has lower rate limits'
          ];
          break;
        default:
          suggestions = [
            'Check Twitter API status page',
            'Verify your internet connection',
            'Try again in a few minutes'
          ];
      }

      return Response.json(
        {
          success: false,
          error: errorMessage,
          fallback: true,
          debug: {
            status: response.status,
            statusText: response.statusText,
            suggestions,
            timestamp: new Date().toISOString(),
            helpUrl: 'https://developer.twitter.com/en/support'
          }
        },
        { 
          status: 200,
          headers: corsHeaders 
        }
      );
    }

    const data = await response.json();
    
    console.log('✅ Twitter API Success');
    console.log('- Data count:', data.data?.length || 0);
    console.log('- Has next token:', !!data.meta?.next_token);
    console.log('- Result count:', data.meta?.result_count || 0);

    // Transform and enhance the data
    const transformedData = data.data?.map((tweet: any) => ({
      ...tweet,
      // Ensure we have author_id for user matching
      author_id: tweet.author_id || 'unknown_author'
    })) || [];

    // Enhanced user data from expansions
    const users = data.includes?.users || [];
    
    // Create user lookup for easier access
    const userLookup = users.reduce((acc: any, user: any) => {
      acc[user.id] = user;
      return acc;
    }, {});

    // Add user data to tweets
    const enrichedTweets = transformedData.map((tweet: any) => {
      const user = userLookup[tweet.author_id];
      return {
        ...tweet,
        user: user || {
          id: tweet.author_id,
          name: `User ${tweet.author_id.slice(-4)}`,
          username: `user_${tweet.author_id.slice(-4)}`,
          profile_image_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
          verified: false
        }
      };
    });

    return Response.json(
      {
        success: true,
        data: enrichedTweets,
        includes: data.includes || { users: [] },
        meta: data.meta || { result_count: enrichedTweets.length },
        nextToken: data.meta?.next_token,
        query: query,
        timestamp: new Date().toISOString()
      },
      { headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('❌ Twitter API Unexpected Error:', error);
    
    return Response.json(
      {
        success: false,
        error: `Unexpected error: ${error.message}`,
        fallback: true,
        debug: {
          errorType: 'UnexpectedError',
          errorMessage: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }
      },
      { 
        status: 200,
        headers: corsHeaders 
      }
    );
  }
}