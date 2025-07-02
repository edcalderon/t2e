import { TweetLoadResult } from "../twitterInterfaces";

// Use the correct API endpoint for the server
const API_BASE_URL = '/api/tweets';

export const fetchTweets = async (nextToken?: string, query: string = '#xquests'): Promise<TweetLoadResult> => {
  try {
    const params = new URLSearchParams();
    if (nextToken) params.append('next_token', nextToken); 
    if (query) params.append('query', query);

    const url = `${API_BASE_URL}?${params.toString()}`;
    console.log('🔍 Fetching tweets from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });
    
    console.log('📡 Response status:', response.status, response.statusText);
    
    // Check if response is HTML (indicates error page)
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('text/html')) {
      const html = await response.text();
      console.error('❌ Received HTML instead of JSON. This might be a 404 or 500 page.');
      if (html.length < 1000) console.error('HTML Response:', html);
      throw new Error('Received HTML response instead of JSON. Check server logs.');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        body: errorText
      });
      throw new Error(`Failed to fetch tweets: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    try {
      const data = JSON.parse(responseText);
      console.log('✅ Successfully parsed response:', {
        tweetsCount: data.tweets?.length,
        success: data.success,
        isUsingFallback: data.isUsingFallback
      });
      return data;
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', responseText);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error('❌ Error in fetchTweets:', error);
    return {
      tweets: [],
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tweets',
      hasMore: false,
      isUsingFallback: true,
      query,
    };
  }
};

export const searchTweets = async (query: string, nextToken?: string): Promise<TweetLoadResult> => {
  return fetchTweets(nextToken, query);
};

export const refreshTweets = async (): Promise<TweetLoadResult> => {
  return fetchTweets(undefined, '#xquests');
};

export const loadMoreTweets = async (nextToken: string): Promise<TweetLoadResult> => {
  return fetchTweets(nextToken, '#xquests');
};