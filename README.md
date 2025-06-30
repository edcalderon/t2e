# XQuests - Tweet. Engage. Earn.

A social media engagement platform built with Expo that allows users to participate in challenges, earn cryptocurrency rewards, and connect their social media accounts.

## Features

### 🐦 Real-time Twitter Integration
- Fetches live tweets with #xquests hashtag using secure server-side proxy
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

# Twitter API Configuration (Server-side only - SECURE)
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

**🔒 SECURITY NOTE:** The Twitter Bearer Token is now server-side only and never exposed to clients!

### 2. Twitter API Setup (Optional)

To enable real Twitter integration:

1. Create a Twitter Developer account at [developer.twitter.com](https://developer.twitter.com)
2. Create a new app and generate a Bearer Token
3. Add the Bearer Token to your `.env` file as `TWITTER_BEARER_TOKEN` (NOT `EXPO_PUBLIC_*`)

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

## Security Architecture

### 🔒 **Secure Twitter API Integration**

The app now uses a **server-side proxy** to protect your Twitter Bearer Token:

```
Client → /api/tweets → Twitter API (with Bearer Token)
```

**Benefits:**
- ✅ Bearer Token never exposed to clients
- ✅ Rate limiting controlled server-side
- ✅ No token abuse by malicious users
- ✅ Secure for production deployment

### **API Route Structure**

```typescript
// app/api/tweets+api.ts - Server-side only
export async function GET(request: Request) {
  const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN; // Server-only
  // ... secure Twitter API calls
}
```

### **Client-side Usage**

```typescript
// Client makes requests to your secure API
const response = await fetch('/api/tweets?max_results=10');
const data = await response.json();
```

## Twitter API Integration

### API Endpoints Used

The app uses Twitter API v2 with the following endpoint (server-side):

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
- Server-side rate limiting prevents client abuse
- Automatic fallback to demo content on rate limit

### Fallback Behavior

When Twitter API is not available:
- Shows demo tweets with realistic engagement metrics
- Maintains all UI functionality
- Displays API status indicator
- Provides retry mechanisms

## Deployment

### Environment Variables for Production

```bash
# Production .env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
TWITTER_BEARER_TOKEN=your_twitter_bearer_token  # Server-side only!
```

### Web Deployment

1. Build the project: `npm run build`
2. Deploy to any hosting service that supports server-side rendering
3. Set environment variables on your hosting platform
4. Ensure `TWITTER_BEARER_TOKEN` is set as a server-side environment variable

### Recommended Hosting

- **Vercel**: Automatic server-side environment variable support
- **Netlify**: With serverless functions
- **Railway**: Full-stack deployment
- **Heroku**: Traditional server deployment

## Security Best Practices

### ✅ **DO:**
- Use `TWITTER_BEARER_TOKEN` (server-side only)
- Set up proper CORS headers
- Use HTTPS in production
- Rotate API keys regularly
- Monitor API usage

### ❌ **DON'T:**
- Use `EXPO_PUBLIC_TWITTER_BEARER_TOKEN` (client-exposed)
- Commit tokens to version control
- Share tokens in client-side code
- Use tokens in mobile app bundles

## Architecture

### File Structure

```
app/
├── api/
│   └── tweets+api.ts         # Secure server-side Twitter proxy
├── (tabs)/
│   ├── index.tsx            # Main explore screen with Twitter feed
│   ├── challenges.tsx       # Challenge browsing
│   ├── notifications.tsx    # User notifications
│   └── settings.tsx         # App settings
├── auth/
│   └── callback.tsx         # OAuth callback handler
├── privacy.tsx              # Privacy policy
└── terms.tsx               # Terms of service

lib/
├── supabase.ts             # Supabase client and auth
└── twitterApi.ts           # Secure Twitter API client

components/
├── ResponsiveLayout.tsx     # Layout wrapper
├── SharedSidebar.tsx       # Navigation sidebar
└── BottomNavigation.tsx    # Mobile bottom nav
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Ensure security best practices are followed
5. Submit a pull request with a clear description

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the security guidelines

---

**XQuests** - Secure, scalable social media engagement with cryptocurrency rewards.