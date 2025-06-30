// Enhanced server-side API route with comprehensive 403 error handling
// The Bearer Token stays on the server and is never exposed to clients

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN; // Server-only environment variable

export async function GET(request: Request) {
  const url = new URL(request.url);
  const maxResults = url.searchParams.get('max_results') || '10';
  const nextToken = url.searchParams.get('next_token');

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Enhanced logging for debugging
  console.log('🔍 Twitter API Request Debug Info:');
  console.log('- Environment:', process.env.NODE_ENV || 'development');
  console.log('- Has Bearer Token:', !!TWITTER_BEARER_TOKEN);
  console.log('- Token Length:', TWITTER_BEARER_TOKEN?.length || 0);
  console.log('- Token Preview:', TWITTER_BEARER_TOKEN ? `${TWITTER_BEARER_TOKEN.substring(0, 10)}...` : 'None');
  console.log('- Max Results:', maxResults);
  console.log('- Next Token:', nextToken ? 'Present' : 'None');

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
        status: 200, // Return 200 so client can handle gracefully
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
    // Try multiple search strategies to handle 403 errors
    const searchStrategies = [
      {
        name: 'Primary Search',
        params: {
          'query': '#xquests -is:retweet lang:en',
          'max_results': Math.min(parseInt(maxResults), 10).toString(), // Reduced for testing
          'tweet.fields': 'created_at,public_metrics,author_id',
          'user.fields': 'name,username,profile_image_url,verified',
          'expansions': 'author_id'
        }
      },
      {
        name: 'Simplified Search',
        params: {
          'query': '#xquests',
          'max_results': '10',
          'tweet.fields': 'created_at,public_metrics',
          'user.fields': 'name,username,profile_image_url'
        }
      },
      {
        name: 'Basic Search',
        params: {
          'query': 'xquests',
          'max_results': '10'
        }
      }
    ];

    let lastError = null;

    for (const strategy of searchStrategies) {
      try {
        console.log(`🔄 Trying ${strategy.name}...`);
        
        const params = new URLSearchParams(strategy.params);
        
        if (nextToken && strategy.name === 'Primary Search') {
          params.append('next_token', nextToken);
        }

        const twitterUrl = `https://api.twitter.com/2/tweets/search/recent?${params.toString()}`;
        
        console.log('🐦 Making Twitter API request...');
        console.log('- Strategy:', strategy.name);
        console.log('- Query:', strategy.params.query);

        const response = await fetch(twitterUrl, {
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

        if (response.ok) {
          const data = await response.json();
          
          console.log('✅ Twitter API Success with', strategy.name);
          console.log('- Data count:', data.data?.length || 0);
          console.log('- Has next token:', !!data.meta?.next_token);

          // Handle empty results
          if (!data.data || data.data.length === 0) {
            console.log('ℹ️ No tweets found, but API call succeeded');
            return Response.json(
              {
                success: true,
                data: [],
                includes: {},
                meta: { result_count: 0 },
                nextToken: null,
                message: 'No tweets found for this search'
              },
              { headers: corsHeaders }
            );
          }

          return Response.json(
            {
              success: true,
              data: data.data || [],
              includes: data.includes || {},
              meta: data.meta || {},
              nextToken: data.meta?.next_token,
              strategy: strategy.name
            },
            { headers: corsHeaders }
          );
        } else {
          // Store error for potential fallback
          const errorText = await response.text();
          lastError = {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
            strategy: strategy.name
          };
          
          console.log(`❌ ${strategy.name} failed:`, response.status, response.statusText);
          
          // If it's not a 403, break and handle the error
          if (response.status !== 403) {
            break;
          }
          
          // Continue to next strategy for 403 errors
          continue;
        }
      } catch (strategyError: any) {
        console.error(`❌ ${strategy.name} network error:`, strategyError.message);
        lastError = {
          status: 0,
          statusText: 'Network Error',
          body: strategyError.message,
          strategy: strategy.name
        };
        continue;
      }
    }

    // If we get here, all strategies failed
    console.error('❌ All Twitter API strategies failed');
    
    if (lastError) {
      let errorMessage = `Twitter API error: ${lastError.status} ${lastError.statusText}`;
      let suggestions = [];
      
      switch (lastError.status) {
        case 401:
          errorMessage = 'Twitter API authentication failed - Invalid Bearer Token';
          suggestions = [
            'Verify your Bearer Token is correct and active',
            'Check if the token has expired',
            'Regenerate your Bearer Token in Twitter Developer Portal'
          ];
          break;
        case 403:
          errorMessage = 'Twitter API access forbidden - Account or app restrictions';
          suggestions = [
            '🔑 Your Twitter Developer account may need approval',
            '📋 Check if your app has "Read" permissions',
            '🏢 You may need Twitter API Basic or Pro access',
            '🌐 Some endpoints require elevated access',
            '💻 For localhost development, ensure your app allows it',
            '🔄 Try applying for elevated access in Twitter Developer Portal'
          ];
          break;
        case 429:
          errorMessage = 'Twitter API rate limit exceeded';
          suggestions = [
            'Wait 15 minutes before making more requests',
            'Implement proper rate limiting in your app'
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
            allStrategiesFailed: true,
            lastError: lastError,
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

    // Fallback error
    return Response.json(
      {
        success: false,
        error: 'All Twitter API strategies failed',
        fallback: true,
        debug: {
          message: 'Unable to connect to Twitter API with any strategy',
          timestamp: new Date().toISOString()
        }
      },
      { 
        status: 200,
        headers: corsHeaders 
      }
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