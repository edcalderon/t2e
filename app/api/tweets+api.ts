// Server-side API route to securely fetch Twitter data
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

  // Check if Bearer Token is available
  if (!TWITTER_BEARER_TOKEN) {
    return Response.json(
      { 
        success: false, 
        error: 'Twitter API not configured',
        fallback: true 
      },
      { 
        status: 200, // Return 200 so client can handle gracefully
        headers: corsHeaders 
      }
    );
  }

  try {
    // Build Twitter API request
    const params = new URLSearchParams({
      'query': '#xquests -is:retweet lang:en',
      'max_results': Math.min(parseInt(maxResults), 100).toString(),
      'tweet.fields': 'created_at,public_metrics,author_id',
      'user.fields': 'name,username,profile_image_url,verified',
      'expansions': 'author_id',
      'sort_order': 'relevancy'
    });

    if (nextToken) {
      params.append('next_token', nextToken);
    }

    const twitterUrl = `https://api.twitter.com/2/tweets/search/recent?${params.toString()}`;

    const response = await fetch(twitterUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

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
    console.error('Twitter API Error:', error);
    
    return Response.json(
      {
        success: false,
        error: error.message,
        fallback: true
      },
      { 
        status: 200, // Return 200 so client can handle gracefully
        headers: corsHeaders 
      }
    );
  }
}