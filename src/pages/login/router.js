/*
 * @Author: shawn
 * @LastEditTime: 2019-09-24 11:08:55
 */
export default [
	{
		path: '/login',
		title: '登录',
		arrowHide: true,
		component: () => import('pages/login/login_page')
	},
	{
		path: '/outer_login',
		title: '还到',
		arrowHide: true,
		component: () => import('pages/login/outer_login_page')
	},
	{
		path: '/outer_mpos_login',
		title: '还到',
		arrowHide: true,
		component: () => import('pages/login/outer_mpos_login_page')
	},
	{
		path: '/outer_test_login',
		title: '携手权威征信机构，让信用有价值',
		arrowHide: true,
		component: () => import('pages/login/outer_test_login_page')
	}
];
