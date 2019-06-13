export default [
	{
		path: '/activity/pinpai_page',
		title: '新手指南',
		arrowHide: 'empty',
		component: () => import('pages/activity/pinpai_page')
	},
	{
		path: '/activity/koubei_page',
		title: '新手指南',
		arrowHide: 'empty',
		component: () => import('pages/activity/koubei_page')
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
  {
		path: '/activity/jd618_page',
		title: '618',
		component: () => import('pages/activity/jd618_page')
	},
];
