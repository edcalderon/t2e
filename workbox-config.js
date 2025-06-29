module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{js,css,html,png,jpg,jpeg,svg,gif,webp,woff,woff2,ttf,eot,ico,json}'
  ],
  swDest: 'dist/sw.js',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  mode: 'production',
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
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
        cacheableResponse: {
          statuses: [0, 200]
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
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
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
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      urlPattern: /\/$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      urlPattern: /\.(?:js|css|json)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
  ]
};