import qs from 'qs';

//初始化神策埋点 及 渠道信息
export const initAnalytics = () => {
  window.version = 'v1.1';
  sa.init({
    server_url: saUrl,
    sdk_url: 'https://static.sensorsdata.cn/sdk/1.7.1.1/sensorsdata.min.js',
    show_log: true,
    is_single_page: true,
  });
  const query = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });
  const ua = window.navigator.userAgent;
  if (!sessionStorage.getItem('h5Channel')) {
    /SuiXingPay-Mpos/i.test(ua)
      ? query.h5Channel
        ? sessionStorage.setItem('h5Channel', query.h5Channel)
        : sessionStorage.setItem('h5Channel', 'MPOS')
      : sessionStorage.setItem('h5Channel', query.h5Channel ? query.h5Channel : 'other');
  }
  if (!localStorage.getItem('version')) {
    localStorage.setItem('version', window.version);
  }
  if (/MicroMessenger/i.test(window.navigator.userAgent) && localStorage.getItem('version') !== window.version) {
    localStorage.setItem('version', window.version);
    window.location.reload();
  }
};

// 定义固定参数
function getStaticParams() {
  return {
    product_line: '还到-余额代偿',
    project_name: document.title,
    forward_module: document.referrer,
    page_category: document.title,
    channelType: localStorage.getItem('h5Channel') ? localStorage.getItem('h5Channel') : 'OTHER',
  };
}

/*
 * PV统计
 *
 * */
export const pageView = () => {
  // if(process.env.NODE_ENV === 'development'){
  //   return
  // }
  const params = getStaticParams();
  sa.quick('autoTrackSinglePage', params);
};

/*
 * 埋点事件
 *
 * */
export const buriedPointEvent = (buriedKey, params) => {
  const staticParams = getStaticParams();
  const sendParams = Object.assign({}, staticParams, params);
  sa.track(buriedKey, sendParams);
};
