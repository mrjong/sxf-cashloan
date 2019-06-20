export default [
	{
		path: '/others/dc_landing_page',
		title: '贷超落地页',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/others/dc_landing_page')
	},
	{
		path: '/others/download_page',
		title: '下载页',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/others/download_page')
	},
	{
		path: '/others/clear_store_page',
		title: '测试专用',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/others/clear_store_page')
	},
	{
		path: '/others/fenqi_landing',
		title: '还到Plus',
		arrowHide: '',
		component: () => import('pages/others/fenqi_landing_page')
	},
	{
		path: '/others/moxie_pwd_guide',
		title: '提示',
		arrowHide: '',
		component: () => import('pages/others/moxie_pwd_guide')
	},
];
