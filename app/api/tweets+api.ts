// Enhanced server-side API route with better error handling and debugging
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
          suggestion: 'Add TWITTER_BEARER_TOKEN to your environment variables'
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
    // Build Twitter API request with enhanced parameters
    const params = new URLSearchParams({
      'query': '#xquests -is:retweet lang:en',
      'max_results': Math.min(parseInt(maxResults), 100).toString(),
      'tweet.fields': 'created_at,public_metrics,author_id,context_annotations',
      'user.fields': 'name,username,profile_image_url,verified,public_metrics',
      'expansions': 'author_id',
      'sort_order': 'recency' // Changed from 'relevancy' to 'recency' for better results
    });

    if (nextToken) {
      params.append('next_token', nextToken);
    }

    const twitterUrl = `https://api.twitter.com/2/tweets/search/recent?${params.toString()}`;
    
    console.log('🐦 Making Twitter API request...');
    console.log('- URL:', twitterUrl.replace(TWITTER_BEARER_TOKEN, '[REDACTED]'));

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
    console.log('- Headers:', Object.fromEntries(response.headers.entries()));

    // Handle different HTTP status codes
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Twitter API Error Response:', errorText);
      
      let errorMessage = `Twitter API error: ${response.status} ${response.statusText}`;
      let suggestions = [];
      
      switch (response.status) {
        case 401:
          errorMessage = 'Twitter API authentication failed - Invalid Bearer Token';
          suggestions = [
            'Verify your Bearer Token is correct',
            'Check if the token has expired',
            'Ensure the token has proper permissions'
          ];
          break;
        case 403:
          errorMessage = 'Twitter API access forbidden - Insufficient permissions';
          suggestions = [
            'Verify your Twitter Developer account is approved',
            'Check if your app has the required permissions',
            'Ensure you have access to Twitter API v2',
            'For localhost development, some restrictions may apply'
          ];
          break;
        case 429:
          errorMessage = 'Twitter API rate limit exceeded';
          suggestions = [
            'Wait before making more requests',
            'Implement proper rate limiting',
            'Consider upgrading your API plan'
          ];
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = 'Twitter API server error - Try again later';
          suggestions = [
            'This is a temporary Twitter server issue',
            'Retry the request after a few minutes'
          ];
          break;
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
            errorDetails: errorText,
            timestamp: new Date().toISOString()
          }
        },
        { 
          status: 200, // Return 200 so client can handle gracefully
          headers: corsHeaders 
        }
      );
    }

    const data = await response.json();
    
    console.log('✅ Twitter API Success:');
    console.log('- Data count:', data.data?.length || 0);
    console.log('- Has next token:', !!data.meta?.next_token);
    console.log('- Result count:', data.meta?.result_count || 0);

    // Handle empty results
    if (!data.data || data.data.length === 0) {
      console.log('ℹ️ No tweets found for #xquests');
      return Response.json(
        {
          success: true,
          data: [],
          includes: {},
          meta: { result_count: 0 },
          nextToken: null,
          message: 'No #xquests tweets found at this time'
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
        nextToken: data.meta?.next_token
      },
      { headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('❌ Twitter API Network Error:', error);
    
    return Response.json(
      {
        success: false,
        error: `Network error: ${error.message}`,
        fallback: true,
        debug: {
          errorType: 'NetworkError',
          errorMessage: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          suggestions: [
            'Check your internet connection',
            'Verify Twitter API endpoints are accessible',
            'Check for firewall or proxy issues'
          ]
        }
      },
      { 
        status: 200, // Return 200 so client can handle gracefully
        headers: corsHeaders 
      }
    );
  }
}