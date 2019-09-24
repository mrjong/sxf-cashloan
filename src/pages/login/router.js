/*
 * @Author: shawn
<<<<<<< HEAD
 * @LastEditTime: 2019-09-24 14:09:26
=======
 * @LastEditTime: 2019-09-24 11:08:55
>>>>>>> origin/BR_20190924_DCLOGIN_JKJS-2749
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
		zhName: 'dwmposdl',
		arrowHide: true,
		component: () => import('pages/login/outer_mpos_login_page')
	},
	{
		path: '/outer_test_login',
		title: '还到',
		zhName: 'dwtestdl',
		arrowHide: true,
		component: () => import('pages/login/outer_test_login_page')
	}
];
