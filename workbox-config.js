module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,svg,gif,webp,woff,woff2,ttf,eot,ico,json}'
  ],
  swDest: 'dist/sw.js',
  swSrc: 'public/sw.js',
  injectionPoint: 'self.__WB_MANIFEST',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  mode: 'production',
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  offlineGoogleAnalytics: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/images\.pexels\.com\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'pexels-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheKeyWillBeUsed: async ({ request }) => {
          return `${request.url}?timestamp=${Date.now()}`;
        },
      },
    },
    {
      urlPattern: /^https:\/\/api\.dicebear\.com\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'dicebear-avatars',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
    {
      urlPattern: ({ request }) => request.destination === 'document',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
      },
    },
    {
      urlPattern: ({ request }) => 
        request.destination === 'script' || 
        request.destination === 'style',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
      },
    },
    {
      urlPattern: ({ request }) => request.destination === 'image',
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
};