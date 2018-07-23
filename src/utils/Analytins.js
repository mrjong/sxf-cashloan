//初始化神策埋点 及 渠道信息
export const initAnalytics = () => {
  sa.init({
    server_url: saUrl,
    sdk_url: 'https://static.sensorsdata.cn/sdk/1.7.1.1/sensorsdata.min.js',
    show_log: true,
    is_single_page: true,
  });
};
