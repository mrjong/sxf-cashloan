/*
 * @Author: shawn
 * @LastEditTime: 2019-12-05 13:38:57
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
	}
];
