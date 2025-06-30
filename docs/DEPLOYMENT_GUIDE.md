# Deployment Guide - Fixing Page Not Found on Reload

## The Problem

When users refresh the page or navigate directly to a URL like `xquests.site/challenges`, they get a "Page Not Found" error. This happens because:

1. **Single Page Application (SPA)**: React/Expo Router apps are SPAs that handle routing client-side
2. **Server Configuration**: The server doesn't know about client-side routes
3. **Missing Fallback**: When someone visits `/challenges` directly, the server looks for a file that doesn't exist

## The Solution

We've implemented multiple fallback mechanisms to ensure users always reach the app:

### 1. **Netlify Configuration** (`public/_redirects`)
```
/*    /index.html   200
```
This tells Netlify to serve `index.html` for any route that doesn't match a file.

### 2. **Apache Configuration** (`public/.htaccess`)
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QR,L]
```
For Apache servers, this redirects all non-file requests to `index.html`.

### 3. **Enhanced 404 Page** (`app/+not-found.tsx`)
- Detects if the user is on a valid route that failed to load
- Automatically redirects to home page after 2 seconds
- Provides manual navigation options
- Shows helpful messaging for web users

### 4. **Client-Side Route Handling** (`app/_layout.tsx`)
- Handles browser navigation properly
- Ensures popstate events work correctly
- Manages direct URL access

## Deployment Instructions

### For Netlify:
1. ✅ The `_redirects` file is already configured
2. ✅ Deploy normally - redirects will work automatically

### For Vercel:
Create `vercel.json` in your project root:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### For Apache Hosting:
1. ✅ The `.htaccess` file is already configured
2. ✅ Ensure mod_rewrite is enabled on your server

### For Nginx:
Add to your nginx configuration:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### For Firebase Hosting:
Add to `firebase.json`:
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## Testing the Fix

### 1. **Test Direct Navigation**
- Visit `yoursite.com/challenges` directly
- Should load the challenges page, not 404

### 2. **Test Page Refresh**
- Navigate to any page in the app
- Press F5 or Ctrl+R to refresh
- Should stay on the same page

### 3. **Test Browser Navigation**
- Use browser back/forward buttons
- Should navigate properly within the app

### 4. **Test 404 Handling**
- Visit a truly invalid URL like `yoursite.com/invalid-page`
- Should show the custom 404 page
- Should auto-redirect to home after 2 seconds

## How It Works

1. **User visits `/challenges`**
2. **Server doesn't find `/challenges` file**
3. **Fallback rule serves `/index.html`**
4. **React Router takes over and shows challenges page**
5. **User sees the correct page! ✅**

## Common Issues & Solutions

### Issue: Still getting 404 errors
**Solution**: Check your hosting provider's documentation for SPA configuration

### Issue: Redirects not working on subdirectory
**Solution**: Update the redirect rules to include your subdirectory path

### Issue: API routes returning 404
**Solution**: Ensure API routes are excluded from the catch-all redirect

## Hosting Provider Specific Guides

### Netlify ✅
- Automatically detects `_redirects` file
- No additional configuration needed
- Works out of the box

### Vercel
- Requires `vercel.json` configuration
- Supports both rewrites and redirects

### GitHub Pages
- Limited SPA support
- Consider using hash routing for GitHub Pages

### Traditional Web Hosting
- Use `.htaccess` for Apache
- Configure nginx rules for Nginx
- Ensure mod_rewrite is enabled

## Verification Checklist

- ✅ `_redirects` file exists in `public/` folder
- ✅ `.htaccess` file exists in `public/` folder  
- ✅ Enhanced 404 page with auto-redirect
- ✅ Client-side navigation handling
- ✅ All routes properly defined in `_layout.tsx`

## Result

After implementing these fixes:
- ✅ Direct URL navigation works perfectly
- ✅ Page refreshes maintain current route
- ✅ Browser navigation works smoothly
- ✅ 404 errors are handled gracefully
- ✅ Users never get stuck on error pages

Your XQuests app will now work flawlessly regardless of how users access it! 🚀