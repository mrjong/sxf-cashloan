export default [
  {
    path: '/mine/mine_page',
    title: '个人中心',
    arrowHide: true,
    component: () => import('pages/mine/mine_page'),
    footerShow: true,
  },
  {
    path: '/mine/bind_credit_page',
    title: '绑定信用卡',
    component: () => import('pages/mine/bind_credit_page'),
  },
];
