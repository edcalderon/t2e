const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Customize the config before returning it
  if (config.mode === 'production') {
    // This ensures that the web app's manifest.json is accessible
    // and that the service worker is properly registered
    config.output.publicPath = '/';
    
    // Ensure the SPA fallback is properly configured
    config.devServer = {
      ...config.devServer,
      historyApiFallback: true,
      static: {
        directory: config.output.path,
      },
    };
  }
  
  return config;
};
