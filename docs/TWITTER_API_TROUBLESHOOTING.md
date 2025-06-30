# Twitter API 403 Forbidden Error - Troubleshooting Guide

## Common Causes of 403 Errors

### 1. **Developer Account Not Approved** ⚠️
- **Issue**: Your Twitter Developer account is pending approval
- **Solution**: 
  - Check your email for approval notifications
  - Visit [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
  - Complete the application process if pending

### 2. **Insufficient API Access Level** 🔑
- **Issue**: You have Essential access but need Basic/Pro for search endpoints
- **Solution**:
  - Apply for [elevated access](https://developer.twitter.com/en/portal/products/elevated)
  - Some search endpoints require paid plans
  - Check your current access level in the developer portal

### 3. **App Permissions** 📋
- **Issue**: Your app doesn't have the right permissions
- **Solution**:
  - Ensure your app has "Read" permissions minimum
  - Regenerate your Bearer Token after changing permissions
  - Check app settings in Twitter Developer Portal

### 4. **Bearer Token Issues** 🔐
- **Issue**: Invalid or expired Bearer Token
- **Solution**:
  - Regenerate your Bearer Token
  - Ensure it starts with "AAAAAAAAAA"
  - Copy the full token without truncation

## Step-by-Step Resolution

### Step 1: Verify Your Developer Account Status
```bash
# Check your account status at:
https://developer.twitter.com/en/portal/dashboard
```

### Step 2: Check Your API Access Level
- **Essential**: Limited access, may not include search
- **Basic**: $100/month, includes search endpoints
- **Pro**: $5000/month, higher rate limits

### Step 3: Verify App Configuration
1. Go to your app in Twitter Developer Portal
2. Check "App permissions" - should be "Read" minimum
3. Regenerate Bearer Token if needed
4. Update your `.env` file with the new token

### Step 4: Test with Minimal Query
The API now tries multiple search strategies:
1. Full featured search with hashtags
2. Simplified search
3. Basic keyword search

### Step 5: Environment Setup
Create a `.env` file in your project root:
```bash
TWITTER_BEARER_TOKEN=your_actual_bearer_token_here
```

## Development vs Production

### Localhost Development
- Some Twitter API restrictions may apply to localhost
- Consider using ngrok for a public URL during development
- Test with a deployed version if localhost fails

### Production Deployment
- Ensure your production domain is whitelisted
- Update app settings with production URLs
- Use environment variables for the Bearer Token

## Alternative Solutions

### 1. **Use Demo Mode**
The app gracefully falls back to demo tweets if the API fails:
```typescript
// The app automatically shows demo content when API is unavailable
```

### 2. **Apply for Academic Research Access**
If you're using this for research or education:
- Apply for Academic Research access
- Provides higher rate limits and more endpoints

### 3. **Use Twitter API v1.1**
Consider switching to v1.1 endpoints if v2 access is restricted:
- Different permission requirements
- May have different rate limits

## Testing Your Setup

### 1. Check Bearer Token Format
```bash
# Your token should start with:
AAAAAAAAAA...
```

### 2. Test API Access
```bash
curl -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  "https://api.twitter.com/2/tweets/search/recent?query=hello&max_results=10"
```

### 3. Monitor Console Logs
The enhanced API route provides detailed debugging information:
- Check browser console for detailed error messages
- Look for specific suggestions based on error type

## Getting Help

### Twitter Developer Support
- [Twitter Developer Community](https://twittercommunity.com/)
- [API Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Support Portal](https://developer.twitter.com/en/support)

### Common Error Codes
- **401**: Authentication failed (bad token)
- **403**: Forbidden (permissions/access level)
- **429**: Rate limit exceeded
- **500**: Twitter server error

## Quick Fixes

### For Development
1. Ensure your `.env` file has the correct Bearer Token
2. Restart your development server after adding the token
3. Check that your Twitter Developer account is approved

### For Production
1. Set environment variables on your hosting platform
2. Ensure the Bearer Token is set as a server-side variable
3. Never expose the Bearer Token in client-side code

---

**Remember**: The app works perfectly with demo content even if the Twitter API is not configured. The 403 error doesn't break the functionality - it just switches to fallback mode.