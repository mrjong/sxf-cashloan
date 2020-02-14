/*
 * @Author: sunjiankun
 * @LastEditors  : Please set LastEditors
 * @LastEditTime : 2020-02-14 16:23:12
 */
export default [
	{
		path: '/common/auth_page',
		zhName: 'rzzz',
		title: '',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/common/auth_page')
	},
	{
		path: '/common/wx_middle_page',
		zhName: 'wxzz',
		title: '',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/common/wx_middle_page')
	},
	{
		path: '/common/tencent_face_middle_page',
		zhName: 'htjc',
		title: '活体检测',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/common/tencent_face_middle_page')
	},
	{
		path: '/common/crash_page',
		title: '系统维护',
		zhName: 'xtwh',
		component: () => import('pages/common/crash_page')
	},
	{
		path: '/common/postmessage_app',
		title: '',
		zhName: 'tzz',
		component: () => import('pages/common/postmessage_app')
	}
];
