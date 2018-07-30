import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import { Toast } from 'antd-mobile';

const fetchinit = () => {
  let timer
  var num = 0
  // 拦截请求
  fetch.axiosInstance.interceptors.request.use(cfg => {
    num++
    if (!cfg.hideLoading) {
      // 防止时间短，出现loading 导致闪烁
      timer = setTimeout(() => {
        if (timer) {
          return
        }
        Toast.loading('数据加载中...', 10)
      }, 300);
    }
    return cfg;
  }, error => {
    return Promise.reject(error);
  });
  // 响应拦截
  fetch.axiosInstance.interceptors.response.use(response => {
    num--
    if (num <= 0) {
      if (timer) {
        clearTimeout(timer)
        Toast.hide()
      }
    } else {
      Toast.loading('数据加载中...', 10)
    }
    return response;
  }, error => {
    return Promise.reject(error);
  });
  fetch.init({
    timeout: 10000, // 默认超时
    baseURL: '/wap', // baseurl
    onShowErrorTip: (err, errorTip) => {
      console.log(errorTip)
      if (errorTip) Toast.fail('服务器繁忙，请稍后重试');
    },
    headers: {
      'fin-v-card-token': Cookie.get('fin-v-card-token'),
    },
    onShowSuccessTip: (response, successTip) => {
      switch (response.data.msgCode) {
        case 'PTM0000':
          return;
        case 'PTM1000': // 用户登录超时
          Toast.info(response.data.msgInfo)
          // setTimeout(() => {
          //   window.location.pathname = '/login'
          // }, 3000);
          return;
        case 'PTM0100': // 未登录
          Toast.info(response.data.msgInfo)
          setTimeout(() => {
            window.location.pathname = '/login'
          }, 3000);
          return;
        default:
          return;
      }
    },
    // isMock: (url) => {
    //   return url.startsWith('/mock');
    // }
  });
}

export default fetchinit
