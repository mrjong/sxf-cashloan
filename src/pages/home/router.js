export default [
  {
    path: '/home/home',
    title: '还卡',
    footerHide: false,
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
];
