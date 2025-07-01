const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Get the default Metro config for Expo projects
const config = getDefaultConfig(__dirname);

// Customize the asset extensions and source extensions
const defaultConfig = {
  ...config,
  transformer: {
    ...config.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    ...config.resolver,
    assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...config.resolver.sourceExts, 'svg'],
  },
};

// Apply NativeWind CSS
module.exports = withNativeWind(defaultConfig, { input: "./global.css" });
