module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for environment variables
      'transform-inline-environment-variables',
    ],
  };
};
