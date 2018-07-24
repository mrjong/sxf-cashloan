export default [
  {
    path: '/mine/mine_page',
    title: {
      title: '个人中心',
      headerHide: true,
    },
    component: () => import('pages/mine/mine_page'),
  },
  {
    path: '/mine/bind_credit_page',
    title: {
      title: '绑定信用卡',
      headerHide: true,
    },
    component: () => import('pages/mine/bind_credit_page'),
  },
];
