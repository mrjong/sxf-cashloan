let webpack = require('webpack');
let CompressionPlugin = require('compression-webpack-plugin');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackZipPlugin = require('webpack-zip-plugin');
let path = require('path');
var HappyPack = require('happypack');
var happyThreadPool = HappyPack.ThreadPool({ size: 4 });
let OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
let SentryPlugin = require('@sentry/webpack-plugin')

let plugins = [
	new HtmlWebpackPlugin({
		chunks: ['main', 'vendor', 'webpack-runtime'],
		filename: 'index.html', //生成的html的文件名
		template: path.resolve(__dirname, '../src/index.html'), //依据的模板
		title: 'sx-webpack',
		inject: true, //注入的js文件将会被放在body标签中,当值为'head'时，将被放在head标签中
		minify: {
			//压缩配置
			removeComments: true, //删除html中的注释代码
			collapseWhitespace: true, //删除html中的空白符
			removeAttributeQuotes: true //删除html元素中属性的引号
		},
		// favicon: path.resolve(__dirname, '../src/favicon.png'),
		chunksSortMode: 'dependency' //按dependency的顺序引入
	}),
	new webpack.HotModuleReplacementPlugin(), //热更新插件
	new webpack.ProvidePlugin({ $: 'jquery', _: 'lodash' })
];

// var sentryTestVersion = 'sentry_test_'+new Date().getTime();
var sentryTestVersion = 'sentry_test_20120425_v1';
var sentryVersion = 'sentry_'+new Date().getTime();

//生产插件
let getProdPlugins = function () {
	plugins.push(
		new CompressionPlugin({
			//压缩gzip
			asset: '[path].gz[query]',
			algorithm: 'gzip',
			test: /\.(js|html)$/,
			threshold: 10240,
			minRatio: 0.8
		})
	),
		plugins.push(
			new WebpackZipPlugin({
				initialFile: './dist', //需要打包的文件夹(一般为dist)
				endPath: './', //打包到对应目录（一般为当前目录'./'）
				zipName: +new Date() + 'copy-dist.zip' //打包生成的文件名
			})
		);
	plugins.push(new OptimizeCSSPlugin()); //压缩提取出的css，并解决ExtractTextPlugin分离出的js重复问题(多个文件引入同一css文件)
	plugins.push(new webpack.HashedModuleIdsPlugin());
	plugins.push(
		new CopyWebpackPlugin([
			{ from: path.resolve(__dirname, '../src/assets/lib'), to: 'assets/lib' },
			{ from: path.resolve(__dirname, '../*.txt'), to: './' },
			{ from: path.resolve(__dirname, '../*.html'), to: './' },
			{ from: path.resolve(__dirname, '../*.apk'), to: './' }
		])
	),
		plugins.push(
			new webpack.DefinePlugin({
				'process.env': {
					NODE_ENV: JSON.stringify('production'),
					PROJECT_ENV: JSON.stringify('pro'),
					RELEASE_VERSION: JSON.stringify(sentryVersion),
				},
				saUrl: JSON.stringify('https://www.vbillbank.com/shence/sa?project=production')
			})
		);
	plugins.push(
		new CleanWebpackPlugin('dist', {
			root: path.resolve(__dirname, '..'),
			verbose: true,
			dry: false
		})
	);
	plugins.push(
		new SentryPlugin({
			include: './dist',
			release: sentryVersion,
			configFile: 'sentry.properties',
			urlPrefix: '~/'
		})
	);
	return plugins;
};

//测试插件
let getTestPlugins = function () {
	plugins.push(
		new CompressionPlugin({
			//压缩gzip
			asset: '[path].gz[query]',
			algorithm: 'gzip',
			test: /\.(js|html)$/,
			threshold: 10240,
			minRatio: 0.8
		})
	),
		plugins.push(new OptimizeCSSPlugin());
	//压缩提取出的css，并解决ExtractTextPlugin分离出的js重复问题(多个文件引入同一css文件)
	plugins.push(new webpack.HashedModuleIdsPlugin());
	plugins.push(
		new CopyWebpackPlugin([
			{ from: path.resolve(__dirname, '../src/assets/lib'), to: 'assets/lib' },
			{ from: path.resolve(__dirname, '../*.txt'), to: './' },
			{ from: path.resolve(__dirname, '../*.html'), to: './' },
			{ from: path.resolve(__dirname, '../*.apk'), to: './' }
		])
	),
		plugins.push(
			new webpack.DefinePlugin({
				'process.env': {
					NODE_ENV: JSON.stringify('development'),
					PROJECT_ENV: JSON.stringify('test'),
					RELEASE_VERSION: JSON.stringify(sentryTestVersion),
				},
				saUrl: JSON.stringify('http://10.1.1.81:8106/sa')
			})
		);
	// plugins.push(
	// 	new CleanWebpackPlugin('dist', {
	// 		root: path.resolve(__dirname, '..'),
	// 		verbose: true,
	// 		dry: false
	// 	})
	// );
	
	plugins.push(
		new SentryPlugin({
			include: './dist',
			release: sentryTestVersion,
			configFile: 'sentry.properties',
			urlPrefix: '~/'
		})
	);
	return plugins;
};

//开发插件
let getDevPlugins = function () {
	plugins.push(
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('development'),
				PROJECT_ENV: JSON.stringify('dev'),
				RELEASE_VERSION: JSON.stringify(sentryTestVersion),
			},
			saUrl: JSON.stringify('http://10.1.1.81:8106/sa'),
		})
	);
	// plugins.push(new webpack.HotModuleReplacementPlugin());
	plugins.push(
		new HappyPack({
			id: 'happybabel',
			loaders: ['babel-loader'],
			threadPool: happyThreadPool,
			cache: true,
			verbose: true
		})
	);
	return plugins;
};

//导出
module.exports = {
	getProdPlugins,
	getDevPlugins,
	getTestPlugins
};
