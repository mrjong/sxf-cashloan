const Plugins = require('./webpack.plugins.config');

module.exports = [
  require('./webpack.common')({
    devTool: 'false',
    mode: 'development',
    dropConsole: false,
    publicPath: '/',
    plugins: Plugins.getDevPlugins(),
    bundleHash: false,
    optimization: {},
  }),
];
