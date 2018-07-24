export default [
  {
    path: '/zhang',
    title: {
      title: '组件测试',
      headerHide: true,
      footerHide: false,
    },
    component: () => import('pages/zhangjinpei/index.js'),
  },
  {
    path: '/zhangsan',
    title: {
      title: '有底部',
      headerHide: true,
      footerHide: false,
    },
    component: () => import('pages/zhangjinpei/index.js'),
  },
  {
    path: '/lisi',
    title: {
      title: '没有底部',
      headerHide: true,
      footerHide: true,
    },
    component: () => import('pages/zhangjinpei/index.js'),
  },
];
