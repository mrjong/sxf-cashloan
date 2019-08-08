export default [
	{
		path: '/activity/pinpai_page',
		zhName: 'ppac',
		title: '新手指南',
		arrowHide: 'empty',
		component: () => import('pages/activity/pinpai_page')
	},
	{
		path: '/activity/koubei_page',
		zhName: 'kbac',
		title: '新手指南',
		arrowHide: 'empty',
		component: () => import('pages/activity/koubei_page')
	},
	{
		path: '/activity/wuyuekh_page',
		zhName: 'cxschl',
		title: '畅享双重豪礼',
		component: () => import('pages/activity/wuyuekh_page')
	},
	{
		path: '/activity/wuyue_new_page',
		zhName: 'xyhzx',
		title: '新用户专享',
		component: () => import('pages/activity/wuyue_new_page')
	},
	{
		path: '/activity/wuyue_old_page',
		zhName: 'lyhzx',
		title: '老用户专享',
		component: () => import('pages/activity/wuyue_old_page')
	},
	{
		path: '/activity/jd618_page',
		zhName: 'hb618',
		title: '嗨爆618',
		component: () => import('pages/activity/jd618_page')
	},
	{
		path: '/activity/freebill_page',
		zhName: 'mzdsbs',
		title: '免账单 随便刷',
		component: () => import('pages/activity/freebill_page')
	},
	{
		path: '/activity/jupei_page',
		zhName: 'hdjjp',
		title: '还到拒就赔',
		arrowHide: 'empty',
		component: () => import('pages/activity/jupei_page')
	},
	{
		path: '/activity/mianxi_page',
		zhName: 'mx30',
		title: '借钱免息30天',
		component: () => import('pages/activity/mianxi715_page')
	}
];
