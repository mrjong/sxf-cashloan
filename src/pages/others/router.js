/*
 * @Author: shawn
 * @LastEditTime: 2019-10-14 18:07:14
 */
export default [
	{
		path: '/others/dc_landing_page',
		zhName: 'dcldy',
		title: '贷超落地页',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/others/dc_landing_page')
	},
	{
		path: '/others/download_page',
		zhName: 'xzy',
		title: '下载页',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/others/download_page')
	},
	{
		path: '/others/outer_download_page',
		zhName: 'dwxzy',
		title: '下载页',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/others/outer_download_page')
	},
	{
		path: '/others/clear_store_page',
		zhName: 'cszy',
		title: '测试专用',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/others/clear_store_page')
	},
	{
		path: '/others/fenqi_landing',
		zhName: 'hdplus',
		title: '还到Plus',
		arrowHide: '',
		component: () => import('pages/others/fenqi_landing_page')
	},
	{
		path: '/others/moxie_pwd_guide',
		zhName: 'ts',
		title: '提示',
		arrowHide: '',
		component: () => import('pages/others/moxie_pwd_guide')
	},
	{
		path: '/others/mpos_download_page',
		zhName: 'hd-jqhxyk',
		title: '还到-借钱还信用卡',
		arrowHide: 'empty',
		component: () => import('pages/others/mpos_download_page')
	},
	{
		path: '/others/mpos_testA_download_page',
		zhName: 'xzAppxtq',
		title: '下载App享特权',
		arrowHide: 'empty',
		component: () => import('pages/others/mpos_testA_download_page')
	},
	{
		path: '/others/mpos_testB_download_page',
		zhName: 'xzApjrzxtd',
		title: '下载App进入专享通道',
		arrowHide: 'empty',
		component: () => import('pages/others/mpos_testB_download_page')
	},
	{
		path: '/others/loan_introduce_page',
		zhName: 'jkgl',
		title: '借款攻略',
		arrowHide: 'empty',
		component: () => import('pages/others/loan_introduce_page')
	},
	{
		path: '/others/service_pwd_guide',
		zhName: 'fwmm',
		title: '',
		arrowHide: 'empty',
		component: () => import('pages/others/service_pwd_guide')
	}
];
