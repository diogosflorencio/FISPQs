const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  config.transformer = {
    ...config.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  };

  config.resolver = {
    ...config.resolver,
    extraNodeModules: {
      crypto: require.resolve('react-native-crypto'),
      stream: require.resolve('readable-stream'),
      fs: require.resolve('react-native-fs'),
      http: require.resolve('@tradle/react-native-http'),
      https: require.resolve('https-browserify'),
      zlib: require.resolve('browserify-zlib'),
      path: require.resolve('path-browserify'),
      util: require.resolve('util/'),
      url: require.resolve('url/'),
      buffer: require.resolve('@craftzdog/react-native-buffer'),
      tls: require.resolve('react-native-fs'),
      net: require.resolve('react-native-fs'),
    },
    assetExts: [...config.resolver.assetExts],
    sourceExts: [...config.resolver.sourceExts],
  };

  return config;
})();
