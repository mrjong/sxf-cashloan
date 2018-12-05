export default [
	{
		path: '/activity/shuang11_page',
		title: '新用户专享',
		arrowHide: true,
		component: () => import('pages/activity/shuang11_page')
	},
	{
		path: '/activity/huodong11_page',
		title: '全民免息狂欢',
		arrowHide: true,
		component: () => import('pages/activity/huodong11_page')
    },
    {
		path: '/activity/wxshare',
        title: '微信分享',
        arrowHide: 'empty',
        headerHide: true,
		component: () => import('pages/activity/wxshare')
	}
];
