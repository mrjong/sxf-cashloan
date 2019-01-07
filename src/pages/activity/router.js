export default [
	{
		path: '/activity/huodong11_page',
		title: '全民免息狂欢',
		arrowHide: true,
		component: () => import('pages/activity/huodong11_page')
	},
	{
		path: '/activity/dazhuanpan_page',
		title: '大转盘',
		arrowHide: true,
		component: () => import('pages/activity/dazhuanpan_page')
    },
    {
		path: '/activity/wxshare_page',
        title: '微信分享',
        arrowHide: 'empty',
        headerHide: true,
		component: () => import('pages/activity/wxshare_page')
	}
];
