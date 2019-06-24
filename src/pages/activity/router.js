export default [
	{
		path: '/activity/pinpai_page',
		title: '新手指南',
		arrowHide: 'empty',
		component: () => import('pages/activity/A0611_pinpai_page')
	},
	{
		path: '/activity/koubei_page',
		title: '新手指南',
		arrowHide: 'empty',
		component: () => import('pages/activity/A0612_koubei_page')
	},
	{
		path: '/activity/wuyuekh_page',
		title: '畅享双重豪礼',
		component: () => import('pages/activity/A0605_wuyuekh_page')
	},
	{
		path: '/activity/wuyue_new_page',
		title: '新用户专享',
		component: () => import('pages/activity/A0608_wuyue_new_page')
	},
	{
		path: '/activity/wuyue_old_page',
		title: '老用户专享',
		component: () => import('pages/activity/A0604_wuyue_old_page')
	},
	{
		path: '/activity/jupei_page',
		title: '还到拒就赔',
		arrowHide: 'empty',
		component: () => import('pages/activity/A0613_jupei_page')
	}
];
