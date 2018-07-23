export default [
  {
    path: '/login/home',
    title: {
      title: '首页',
      headerHide: true,
      footerHide: true,
    },
    component: () => import('pages/home/home'),
  },
];
