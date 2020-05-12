/*
 * @Author: shawn
 * @LastEditTime: 2020-02-27 21:08:46
 */
const antdTheme = require('../antd-theme.json');
const path = require('path');
module.exports = function(options) {
	return {
		mode: options.mode,
		devtool: options.devTool, // 配置生成Source Maps，选择合适的选项
		entry: ['babel-polyfill', path.join(__dirname, '../src/app.js')],
		resolve: {
			extensions: ['.js', '.jsx', '.png', '.scss']
		},
		output: {
			filename: options.bundleHash ? 'bundle-[chunkhash:8].js' : 'bundle.js',
			path: path.join(__dirname, '../dist'),
			chunkFilename: 'chunk-[id]-[chunkhash:8].js',
			publicPath: options.publicPath
		},
		module: {
			// 在配置文件里添加JSON loader
			rules: [
				{
					test: /\.(jsx|js)?$/,
					loader: 'eslint-loader',
					enforce: 'pre',
					exclude: /node_modules/,
					include: [path.resolve(__dirname, '../src')], // 指定检查的目录
					// options: {
					// 	fix: true
					// }
					options: {
						// 这里的配置项参数将会被传递到 eslint 的 CLIEngine
						formatter: require('eslint-friendly-formatter') // 指定错误报告的格式规范
					}
				},
				{
					test: /\.json$/,
					loader: 'json-loader'
				},
				{
					test: /\.(jsx|js)?$/,
					loader: options.bundleHash ? 'babel-loader' : 'happypack/loader?id=happybabel',
					exclude: /(node_modules)/
					// options: {
					//   cacheDirectory: true //cacheDirectory用于缓存babel的编译结果,加快重新编译的速度
					// }
				},
				{
					test: /\.css$/,
					use: ['style-loader', 'postcss-loader']
					// use: ExtractTextPlugin.extract({   // 调用分离插件
					//   fallback: 'style-loader',
					//   use: ['css-loader']
					// })
				},
				{
					test: /\.(scss)$/,
					exclude: /(node_modules)/,
					loader: [
						'style-loader', // creates style nodes from JS strings,
						'css-loader?modules&localIdentName=[local][hash:8]',
						'postcss-loader',
						'sass-loader', // compiles Sass to CSS
						{
							loader: 'sass-resources-loader',
							options: {
								resources: [
									// resolve方法第二个参数为scss配置文件地址，如果有多个，就进行依次添加即可
									path.resolve(__dirname, './../src/assets/styles/scss/base/variable.scss')
								]
							}
						}
					]
				},
				{
					test: /\.less?$/,
					use: [
						'style-loader', // creates style nodes from JS strings,
						'postcss-loader',
						// "less-loader", // compiles Sass to CSS
						{
							loader: 'less-loader',
							options: {
								javascriptEnabled: true,
								modifyVars: antdTheme
							}
						}
					]
				},
				{
					test: /\.html$/,
					loader: 'html-loader'
				},
				{
					test: /\.md$/,
					loader: ['html-loader', 'markdown-loader']
				},
				{
					test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
					loader: 'url-loader',
					query: {
						limit: 1,
						name: 'img/[name]-[hash:8].[ext]'
					}
				},
				{
					test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
					loader: 'url-loader',
					options: {
						limit: 8000,
						name: 'media/[name].[hash:7].[ext]'
					}
				},
				{
					test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
					loader: 'url-loader',
					options: {
						limit: 0,
						name: 'fonts/[name].[hash:7].[ext]'
					}
				}
			]
		},

		plugins: options.plugins,
		devServer: {
			hot: true,
			host: '0.0.0.0',
			port: 8010,
			publicPath: '/',
			clientLogLevel: 'none',
			contentBase: path.resolve(__dirname, '../src'),
			historyApiFallback: true,
			stats: {
				cached: false,
				exclude: [/node_modules[\\/]react(-router)?[\\/]/, /node_modules[\\/]items-store[\\/]/]
			},
			disableHostCheck: true,
			proxy: {
				'/front': {
					// target: 'https://lns-api-test.vbillbank.com/wap', //目标接口域名
					target: 'http://172.18.40.151:8080/wap',
					pathRewrite: { '^/front': '' }, //重写接口
					changeOrigin: true //是否跨域
				},
				'/web/api/v09': {
					target: 'http://172.16.173.126:8080/web/api/v09', //目标接口域名
					// target: 'http://172.18.40.62:8080/web/api/v09',
					pathRewrite: { '^/web/api/v09': '' }, //重写接口
					changeOrigin: true //是否跨域
				},
				// '/buried': {
				// 	target: 'http://172.16.173.18:8080/buried', //目标接口域名
				// 	// target: 'http://172.18.40.181:8888/wap',
				// 	pathRewrite: { '^/buried': '' }, //重写接口
				// 	changeOrigin: true //是否跨域
				// },
				'/shence': {
					target: 'https://sa.vbillbank.com/sa/sa?project=default',
					changeOrigin: true //是否跨域
				},
				'/disting': {
					target: 'https://lns-wap-test.vbillbank.com/disting/#/',
					pathRewrite: { '^/disting': '' },
					changeOrigin: true
				}
				//  '/fqa': {
				//   target: 'http://172.18.40.173:8080/disting', //目标接口域名
				//   changeOrigin: true, //是否跨域
				//   // demo=>  'http://localhost:8080/api' ===> 'http://www.abc.com/api'
				// }
			}
		},
		optimization: options.optimization,
		resolve: {
			extensions: ['.js', '.md', '.txt'],
			alias: {
				pages: path.resolve(__dirname, '../src/pages'),
				components: path.resolve(__dirname, '../src/components'),
				utils: path.resolve(__dirname, '../src/utils'),
				routers: path.resolve(__dirname, '../src/routers'),
				assets: path.resolve(__dirname, '../src/assets'),
				example: path.resolve(__dirname, '../src/example'),
				config: path.resolve(__dirname, '../src/config'),
				reduxes: path.resolve(__dirname, '../src/reduxes'),
				fetch: path.resolve(__dirname, '../src/fetch')
			}
		}
	};
};
