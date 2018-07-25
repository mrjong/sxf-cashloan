export default [
  {
    path: '/mine/mine_page',
    title: '个人中心',
    arrowHide: true,
    component: () => import('pages/mine/mine_page'),
    footerHide: false,
  },
  {
    path: '/mine/bind_credit_page',
    title: '绑定信用卡',
    component: () => import('pages/mine/bind_credit_page'),
  },
  {
    path: '/mine/bind_save_page',
    title: '绑定储蓄卡',
    component: () => import('pages/mine/bind_save_page'),
  },
  {
    path: '/mine/credit_extension_page',
    title: '风控授信项',
    component: () => import('pages/mine/credit_extension_page'),
  },
  {
    path: '/mine/select_credit_page',
    title: '选择信用卡',
    component: () => import('pages/mine/select_credit_page'),
  },
  {
    path: '/mine/select_save_page',
    title: '选择储蓄卡',
    component: () => import('pages/mine/select_save_page'),
  },
];
