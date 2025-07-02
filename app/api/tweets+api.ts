import { fetchTweets } from '@/lib/twitterClient';
import { DEMO_TWEETS as FALLBACK_TWEETS } from '@/lib/fallbackTweets';
import { TweetResponse } from '@/lib/twitterInterfaces';

// Handle CORS preflight requests
export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Main GET handler for fetching tweets
export async function GET(req: Request) {
  console.log('🔍 API Route: GET /api/tweets called');
  
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const next_token = searchParams.get('next_token') || undefined;
    const query = searchParams.get('query') || '#xquests';

    console.log('📋 Request params:', { next_token, query });

    try {
      const result = await fetchTweets(next_token, query);
      console.log('✅ Tweets fetched successfully:', {
        count: result.tweets?.length,
        hasNextToken: !!result.nextToken
      });

      const responseData: TweetResponse = {
        tweets: result.tweets || [],
        success: true,
        error: null,
        hasMore: !!result.nextToken,
        isUsingFallback: false,
        query,
        meta: {
          result_count: result.tweets?.length || 0,
          newest_id: result.tweets?.[0]?.id || null,
          oldest_id: result.tweets?.length ? result.tweets[result.tweets.length - 1]?.id : null,
          next_token: result.nextToken || null,
        },
        timestamp: new Date().toISOString()
      };

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    } catch (error) {
      console.error('❌ Error fetching tweets from Twitter API:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Return fallback tweets when API fails
      const fallbackResponse: TweetResponse = {
        tweets: FALLBACK_TWEETS,
        success: false,
        error: errorMessage,
        hasMore: false,
        isUsingFallback: true,
        query,
        meta: {
          result_count: FALLBACK_TWEETS.length,
          newest_id: FALLBACK_TWEETS[0]?.id || null,
          oldest_id: FALLBACK_TWEETS.length ? FALLBACK_TWEETS[FALLBACK_TWEETS.length - 1]?.id : null,
          next_token: null,
        },
        timestamp: new Date().toISOString()
      };

      return new Response(JSON.stringify(fallbackResponse), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
  } catch (error) {
    console.error('❌ Error in API route:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      tweets: [],
      hasMore: false,
      isUsingFallback: false,
      query: '',
      meta: {
        result_count: 0,
        newest_id: null,
        oldest_id: null,
        next_token: null,
      },
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}