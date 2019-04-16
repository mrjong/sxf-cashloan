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
		path: '/others/outer_login_page',
		title: '登录',
		arrowHide: true,
		component: () => import('pages/others/outer_login_page')
	}
];
