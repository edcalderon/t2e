# XQuests - Tweet. Engage. Earn.

A social media engagement platform built with Expo that allows users to participate in challenges, earn cryptocurrency rewards, and connect their social media accounts.

## Features

### 🐦 Real-time Twitter Integration
- Fetches live tweets with #xquests hashtag using Twitter API v2
- Real-time community activity feed with horizontal scrolling
- Fallback demo content when API is not configured
- Automatic engagement metrics updates

### 🔐 Secure Authentication
- Twitter OAuth 2.0 integration via Supabase
- Account setup flow with wallet connection
- User profile management with Twitter data sync

### 💰 Cryptocurrency Rewards
- ALGO token rewards for challenge completion
- Wallet integration for automatic reward distribution
- Real-time balance tracking and statistics

### 📱 Cross-Platform Design
- Responsive layout for web and mobile
- Beautiful UI with dark/light theme support
- Progressive Web App (PWA) capabilities
- Horizontal scrolling with web navigation arrows

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Supabase Configuration (Required)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twitter API Configuration (Optional - fallback content used if not provided)
EXPO_PUBLIC_TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

### 2. Twitter API Setup (Optional)

To enable real Twitter integration:

1. Create a Twitter Developer account at [developer.twitter.com](https://developer.twitter.com)
2. Create a new app and generate a Bearer Token
3. Add the Bearer Token to your `.env` file as `EXPO_PUBLIC_TWITTER_BEARER_TOKEN`

**Note:** The app works perfectly without Twitter API - it will show demo content with the same functionality.

### 3. Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Enable Twitter OAuth in Authentication > Providers
3. Configure redirect URLs:
   - `http://localhost:8081/auth/callback`
   - `https://your-domain.com/auth/callback`
4. Add your Supabase URL and anon key to `.env`

### 4. Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Twitter API Integration

### API Endpoints Used

The app uses Twitter API v2 with the following endpoint:

```
GET https://api.twitter.com/2/tweets/search/recent
```

### Query Parameters

- `query`: `#xquests -is:retweet lang:en` (searches for #xquests tweets, excludes retweets)
- `max_results`: 10-100 (number of tweets to fetch)
- `tweet.fields`: `created_at,public_metrics,author_id`
- `user.fields`: `name,username,profile_image_url,verified`
- `expansions`: `author_id`
- `sort_order`: `relevancy` (gets popular tweets first)

### Rate Limits

- 300 requests per 15-minute window for Bearer Token authentication
- The app implements proper error handling and fallback content

### Fallback Behavior

When Twitter API is not available:
- Shows demo tweets with realistic engagement metrics
- Maintains all UI functionality
- Displays API status indicator
- Provides retry mechanisms

## Architecture

### File Structure

```
app/
├── (tabs)/
│   ├── index.tsx          # Main explore screen with Twitter feed
│   ├── challenges.tsx     # Challenge browsing
│   ├── notifications.tsx  # User notifications
│   └── settings.tsx       # App settings
├── auth/
│   └── callback.tsx       # OAuth callback handler
├── privacy.tsx            # Privacy policy
└── terms.tsx             # Terms of service

lib/
├── supabase.ts           # Supabase client and auth
└── twitterApi.ts         # Twitter API integration

components/
├── ResponsiveLayout.tsx   # Layout wrapper
├── SharedSidebar.tsx     # Navigation sidebar
└── BottomNavigation.tsx  # Mobile bottom nav

contexts/
├── AuthContext.tsx       # Authentication state
├── ThemeContext.tsx      # Theme management
└── SidebarContext.tsx    # Sidebar state
```

### Key Components

#### Twitter Feed (`app/(tabs)/index.tsx`)
- Fetches and displays real-time #xquests tweets
- Horizontal scrolling with web navigation arrows
- Skeleton loading states
- Real-time engagement updates
- Error handling with fallback content

#### Twitter API (`lib/twitterApi.ts`)
- Complete Twitter API v2 integration
- Data transformation and formatting
- Error handling and fallback generation
- Rate limiting awareness
- Timestamp formatting

#### Authentication (`contexts/AuthContext.tsx`)
- Supabase OAuth integration
- Twitter user data synchronization
- Local storage management
- Session persistence

## Development

### Running Locally

```bash
# Start development server
npm run dev

# The app will be available at:
# - Web: http://localhost:8081
# - Mobile: Use Expo Go app to scan QR code
```

### Building for Production

```bash
# Build web version
npm run build:web

# The built files will be in the dist/ directory
```

### PWA Features

The app includes Progressive Web App capabilities:
- Service worker for offline functionality
- App manifest for installation
- Push notification support
- Offline fallback pages

## API Documentation

### Twitter Integration Functions

```typescript
// Fetch initial tweets
const result = await fetchXQuestsTweets(maxResults, nextToken);

// Load more tweets
const moreResult = await loadMoreXQuestsTweets(nextToken);

// Refresh tweets
const refreshResult = await refreshXQuestsTweets();

// Check API availability
const isAvailable = isTwitterApiAvailable();

// Get API status
const status = getTwitterApiStatus();
```

### Response Format

```typescript
interface TwitterApiResponse {
  tweets: CommunityTweet[];
  nextToken?: string;
  success: boolean;
  error?: string;
}

interface CommunityTweet {
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
```

## Deployment

### Web Deployment

The app can be deployed to any static hosting service:

1. Build the project: `npm run build`
2. Deploy the `dist/` directory to your hosting service
3. Configure environment variables on your hosting platform

### Mobile Deployment

For mobile app deployment:

1. Use Expo Application Services (EAS): `eas build`
2. Submit to app stores: `eas submit`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Submit a pull request with a clear description

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the Twitter API setup guide

---

**XQuests** - Connecting social media engagement with cryptocurrency rewards through innovative challenge-based interactions.