const plugins = require('./webpack.plugins.config.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
module.exports = [
	require('./webpack.common')({
		devTool: '#source-map',
		mode: 'production',
		dropConsole: true,
		publicPath: '/',
		bundleHash: true,
		plugins: plugins.getProdPlugins(),
		optimization: {
			minimizer: [
				new UglifyJsPlugin({
					cache: true,
					parallel: true,
					sourceMap: true, // set to true if you want JS source maps
					uglifyOptions: {
						compress: true
					}
				}),
				new OptimizeCSSAssetsPlugin({})
			],
			splitChunks: {
				chunks: 'all', //initial、async和all
				minSize: 30000, //形成一个新代码块最小的体积
				minChunks: 1, //在分割之前，这个代码块最小应该被引用的次数
				maxAsyncRequests: 5, //按需加载时候最大的并行请求数
				maxInitialRequests: 3, //最大初始化请求数
				automaticNameDelimiter: '~', //打包分割符
				name: 'commons',
				//打包后的名字
				cacheGroups: {
					vendors: {
						test: /[\\/]node_modules[\\/]/, //用于控制哪些模块被这个缓存组匹配到、它默认会选择所有的模块
						priority: -10, //缓存组打包的先后优先级
						name: 'vendors',
						minSize: 3000
					},
					default: {
						minChunks: 2,
						priority: -20,
						minSize: 3000
					}
				}
			}
		}
	})
];
