export default [
	{
		path: '/common/middle_page',
		zhName: 'mxzz',
		title: '',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/common/middle_page')
	},
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
	}
];
