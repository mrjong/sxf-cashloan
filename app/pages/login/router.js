/*
 * @Author: sunjiankun
 * @LastEditors  : sunjiankun
 * @LastEditTime : 2020-01-02 16:15:01
 */
/*
 * @Author: shawn
 * @LastEditTime : 2019-12-19 15:02:39
 */
export default [
	{
		path: '/login',
		zhName: 'dl',
		title: '登录',
		arrowHide: true,
		component: () => import('pages/login/login_page')
	},
	{
		path: '/outer_login',
		zhName: 'dwdl',
		title: '还到',
		arrowHide: true,
		component: () => import('pages/login/outer_login_page')
	},
	{
		path: '/outer_mpos_login',
		title: '还到',
		zhName: 'dwdl',
		arrowHide: true,
		component: () => import('pages/login/outer_mpos_login_page')
	},
	{
		path: '/outer_test_login',
		title: '还到',
		zhName: 'dwdl',
		arrowHide: true,
		component: () => import('pages/login/outer_test_login_page')
	},
	{
		path: '/momo_outer_login',
		zhName: 'dwdl',
		title: '还到',
		arrowHide: true,
		component: () => import('pages/login/momo_outer_login_page')
	},
	{
		path: '/mpos_push_login',
		zhName: 'mpushdl',
		title: '登录',
		arrowHide: true,
		component: () => import('pages/login/mpos_push_login')
	},
	{
		path: '/toutiao_login_page',
		zhName: 'ttdl',
		title: '登录',
		arrowHide: true,
		component: () => import('pages/login/toutiao_login_page')
	},
	{
		path: '/miniprogram_login',
		zhName: 'xcxdl',
		title: '登录',
		arrowHide: true,
		component: () => import('pages/login/miniprogram_login_page')
	}
];
