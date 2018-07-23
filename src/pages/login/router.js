export default [
  {
    path: '/login/login',
    title: {
      title: '登录',
      headerHide: true,
      footerHide: true,
    },
    component: () => import('pages/login/login'),
  },
];
