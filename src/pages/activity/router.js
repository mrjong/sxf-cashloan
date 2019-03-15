export default [
	{
		path: '/activity/dazhuanpan_page',
		title: '大转盘',
		arrowHide: true,
		component: () => import('pages/activity/dazhuanpan_page')
	},
	{
		path: '/activity/wxshare_page',
		title: '微信分享',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/activity/wxshare_page')
	},
	{
		path: '/activity/newuser_page',
		title: '拉新活动',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/activity/newuser_page')
	},
	{
		path: '/activity/coupon_page',
		title: '百万红包天天抢',
		arrowHide: 'empty',
		component: () => import('pages/activity/coupon_page')
	},
	{
		path: '/activity/dazhuanpan_316_page',
		title: '幸运大转盘',
		arrowHide: 'empty',
		component: () => import('pages/activity/dazhuanpan_316_page')
	},
	{
		path: '/activity/jupei_page',
		title: '还到拒就赔',
		arrowHide: 'empty',
		component: () => import('pages/activity/jupei_page')
	}
];
