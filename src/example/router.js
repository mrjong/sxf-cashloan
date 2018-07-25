export default [
  {
    path: '/example/home',
    title: '例子',
    // headerHide: true,
    // footerHide: false,
    component: () => import('example/index'),
  },
  {
    path: '/example/button/',
    title: '按钮组件',
    // headerHide: false,
    footerHide: false,
    component: () => import('example/button'),
  },
  {
    path: '/example/panel/',
    title: '面板组件',
    headerHide: true,
    footerHide: true,
    component: () => import('example/panel'),
  },
];
