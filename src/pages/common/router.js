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
	}
];
