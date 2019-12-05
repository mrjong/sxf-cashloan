/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-05 16:06:00
 */
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
	},
	{
		path: '/activity/mianxi100_page',
		zhName: 'mxhbxsl',
		title: '100元免息红包限时领',
		component: () => import('pages/activity/mianxi822_page')
	},
	{
		path: '/activity/new_users_page',
		zhName: 'xrzxl',
		title: '新人专享礼',
		component: () => import('pages/activity/new_users_page')
	},
	{
		path: '/activity/coupon_test_page',
		zhName: 'hkyh',
		title: '还款优惠',
		component: () => import('pages/activity/coupon_test_page')
	},
	{
		path: '/activity/guosong_page',
		zhName: 'gjs',
		title: '还到',
		component: () => import('pages/activity/guosong_page')
	},
	{
		path: '/activity/yongfan_page',
		zhName: 'yjf',
		title: '还到',
		component: () => import('pages/activity/yongfan_page')
	},
	{
		path: '/activity/manpei_page',
		zhName: 'mjp',
		title: '还到',
		component: () => import('pages/activity/manpei_page')
	},
	{
		path: '/activity/dibu_page',
		zhName: 'djb',
		title: '还到',
		component: () => import('pages/activity/dibu_page')
	},
	{
		path: '/activity/anxin_plan_page',
		zhName: 'axjh',
		title: '还到',
		component: () => import('pages/activity/anxin_plan_page')
	},
	{
		path: '/activity/mpos_activity_download_page',
		zhName: 'hd-mpos-xz',
		title: '还到',
		arrowHide: 'empty',
		component: () => import('pages/activity/mpos_activity_download_page')
	},
	{
		path: '/activity/wx_activity_download_page',
		zhName: 'hd-wx-xz',
		title: '还到',
		arrowHide: 'empty',
		component: () => import('pages/activity/wx_activity_download_page')
	},
	{
		path: '/activity/fudai_page',
		zhName: 'hkmxjh',
		title: '还款免息计划',
		component: () => import('pages/activity/fudai_page')
	}
];
