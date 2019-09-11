/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-09-06 17:44:52
 */
export default [
	{
		path: '/common/middle_page',
		title: '',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/common/middle_page')
	},
	{
		path: '/common/auth_page',
		title: '',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/common/auth_page')
	},
	{
		path: '/common/wx_middle_page',
		title: '',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/common/wx_middle_page')
	},
	{
		path: '/common/tencent_face_middle_page',
		title: '活体检测',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/common/tencent_face_middle_page')
	},
	{
		path: '/common/crash_page',
		title: '系统维护',
		component: () => import('pages/common/crash_page')
	},
	{
		path: '/common/jf_wap_middle_page',
		title: '',
		component: () => import('pages/common/jf_wap_middle_page')
	},
	{
		path: '/common/jf_app_middle_page',
		title: '',
		component: () => import('pages/common/jf_app_middle_page')
	}
];
