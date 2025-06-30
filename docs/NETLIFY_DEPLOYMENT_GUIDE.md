# Netlify Deployment Guide for XQuests

## The Problem

When users refresh the page or navigate directly to a URL like `xquests.site/challenges`, they get a "Page Not Found" error. This happens because:

1. **Single Page Application (SPA)**: React/Expo Router apps are SPAs that handle routing client-side
2. **Server Configuration**: Netlify doesn't know about client-side routes
3. **Missing Fallback**: When someone visits `/challenges` directly, Netlify looks for a file that doesn't exist

## The Solution

We've implemented multiple fallback mechanisms to ensure users always reach the app:

### 1. **Netlify `_redirects` File** 
```
/*    /index.html   200
```
This tells Netlify to serve `index.html` for any route that doesn't match a file.

### 2. **Netlify Configuration (`netlify.toml`)**
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false
```
Alternative configuration method with additional build settings.

### 3. **Enhanced 404 Page** (`app/+not-found.tsx`)
- Detects if the user is on a valid route that failed to load
- Automatically redirects to home page after countdown
- Provides manual navigation options
- Shows helpful debugging information

### 4. **Client-Side Route Handling** (`app/_layout.tsx`)
- Handles browser navigation properly
- Ensures popstate events work correctly
- Manages direct URL access

## Deployment Instructions

### For Netlify (Recommended):

1. ✅ The `_redirects` file is already configured
2. ✅ The `netlify.toml` file provides additional configuration
3. ✅ Build command: `npm run build`
4. ✅ Publish directory: `dist`
5. ✅ Deploy normally - redirects will work automatically

### Build Configuration

Make sure your `package.json` has the correct build script:

```json
{
  "scripts": {
    "build": "npx expo export -p web",
    "deploy": "npm run build && netlify deploy --prod --dir=dist"
  }
}
```

### Environment Variables

Set these in your Netlify dashboard under Site Settings > Environment Variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

## How It Works

1. **User visits `xquests.site/challenges`**
2. **Netlify doesn't find `/challenges` file**
3. **`_redirects` rule serves `/index.html` with 200 status**
4. **Expo Router takes over and shows challenges page**
5. **User sees the correct page! ✅**

## Testing the Fix

### 1. **Test Direct Navigation**
- Visit `xquests.site/challenges` directly
- Should load the challenges page, not 404

### 2. **Test Page Refresh**
- Navigate to any page in the app
- Press F5 or Ctrl+R to refresh
- Should stay on the same page

### 3. **Test Browser Navigation**
- Use browser back/forward buttons
- Should navigate properly within the app

### 4. **Test 404 Handling**
- Visit a truly invalid URL like `xquests.site/invalid-page`
- Should show the custom 404 page
- Should auto-redirect to home after countdown

## Common Issues & Solutions

### Issue: Still getting 404 errors
**Solution**: 
1. Check that `_redirects` file is in the `public/` directory
2. Verify build output includes the `_redirects` file in `dist/`
3. Check Netlify deploy logs for any errors

### Issue: Redirects not working
**Solution**: 
1. Ensure the `_redirects` file has no extra spaces or characters
2. Check that the build command outputs to the correct directory
3. Verify the publish directory is set to `dist` in Netlify

### Issue: Build failing
**Solution**: 
1. Check that all dependencies are installed
2. Verify Node.js version compatibility
3. Check build logs for specific error messages

## Netlify Deploy Settings

In your Netlify dashboard:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18` (set in `netlify.toml`)

## Verification Checklist

- ✅ `_redirects` file exists in `public/` folder
- ✅ `netlify.toml` file exists in project root
- ✅ Enhanced 404 page with auto-redirect
- ✅ Client-side navigation handling
- ✅ All routes properly defined in `_layout.tsx`
- ✅ Build command outputs to `dist` directory
- ✅ Environment variables set in Netlify dashboard

## Result

After implementing these fixes:
- ✅ Direct URL navigation works perfectly
- ✅ Page refreshes maintain current route
- ✅ Browser navigation works smoothly
- ✅ 404 errors are handled gracefully with auto-redirect
- ✅ Users never get stuck on error pages

Your XQuests app will now work flawlessly on Netlify regardless of how users access it! 🚀

## Debugging

If you're still experiencing issues:

1. Check the browser's Network tab for failed requests
2. Look at Netlify's deploy logs for build errors
3. Test the `_redirects` file by visiting the raw file URL
4. Verify that the `dist` folder contains `index.html` and `_redirects`

## Support

For additional help:
- [Netlify SPA Documentation](https://docs.netlify.com/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)