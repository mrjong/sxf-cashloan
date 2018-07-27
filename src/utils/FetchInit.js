import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import { Toast } from 'antd-mobile';

const fetchinit = () => {
  let timer
  // 拦截请求
  fetch.axiosInstance.interceptors.request.use(cfg => {
    if (!cfg.hideLoading) {
      // 防止时间短，出现loading 导致闪烁
      timer = setTimeout(() => {
        Toast.loading('数据加载中...', 10)
      }, 300);
    }
    return cfg;
  }, error => {
    return Promise.reject(error);
  });
  // 响应拦截
  fetch.axiosInstance.interceptors.response.use(response => {
    return response;
  }, error => {
    return Promise.reject(error);
  });
  fetch.init({
    timeout: 10000, // 默认超时
    baseURL: '/wap', // baseurl
    onShowErrorTip: (err, errorTip) => {
      console.log(errorTip)
      clearTimeout(timer)
      Toast.hide()
      if (errorTip) Toast.fail('服务器繁忙，请稍后重试');
    },
    headers: {
      // X-Requested-With: 'XMLHttpRequest',
      'fin-v-card-token': Cookie.get('fin-v-card-token'),
      // post: {
      //   'Content-Type': 'application/x-www-form-urlencoded'
      // }
    },
    onShowSuccessTip: (response, successTip) => {
      clearTimeout(timer)
      Toast.hide()
      switch (response.data.msgCode) {
        case '0000':
          return;
        default:
          return;
      }
    },
    isMock: (url) => {
      return url.startsWith('/mock');
    }
  });
}

export default fetchinit
