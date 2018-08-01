export default [
  {
    path: '/home/home',
    title: '还卡',
    footerHide: false,
    arrowHide: 'empty',
    component: () => import('pages/home/home'),
  },
  {
    path: '/home/message_page',
    title: '消息',
    component: () => import('pages/home/message_page'),
  },
  {
    path: '/home/message_detail_page',
    title: '查看详情',
    component: () => import('pages/home/message_detail_page'),
  },
  {
    path: '/home/agency',
    title: '代还确认',
    component: () => import('pages/home/agency'),
  },
  {
    path: '/home/essential_information',
    title: '基本信息认证',
    component: () => import('pages/home/essential_information'),
  },
  {
    path: '/home/real_name',
    title: '实名认证',
    component: () => import('pages/home/real_name'),
  },
  // {
  //   path: '/home/demo',
  //   title: '新登录',
  //   component: () => import('pages/home/demo'),
  // },
];
