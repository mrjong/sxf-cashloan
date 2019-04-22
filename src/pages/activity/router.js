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
	},
	{
		path: '/activity/funsisong_page',
		title: '全民FUN肆送',
		arrowHide: 'empty',
		component: () => import('pages/activity/funsisong_page')
    },
    {
		path: '/activity/mianxi418_page',
		title: '最高免息30天',
		component: () => import('pages/activity/mianxi418_page')
	},
	{
		path: '/activity/wuyuekh_page',
		title: '畅享双重豪礼',
		component: () => import('pages/activity/wuyuekh_page')
	},
	{
		path: '/activity/wuyue_new_page',
		title: '新用户专享',
		component: () => import('pages/activity/wuyue_new_page')
	},
	{
		path: '/activity/wuyue_old_page',
		title: '老用户专享',
		component: () => import('pages/activity/wuyue_old_page')
	},
];
