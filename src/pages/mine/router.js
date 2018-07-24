export default [
  {
    path: '/mine/mine_page',
    title: {
      title: '个人中心',
      headerHide: true,
    },
    component: () => import('pages/mine/mine_page'),
  },
];
