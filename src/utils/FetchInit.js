import fetch from 'sx-fetch'
import { Toast } from 'antd-mobile'

const fetchinit = () => {
  // 拦截请求
  fetch.axiosInstance.interceptors.request.use(cfg => {
    if (!cfg.hideLoading) {
        // 防止时间短，出现loading 导致闪烁
      setTimeout(() => {
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
    baseURL: '/api', // baseurl
    onShowErrorTip: (err, errorTip) => {
      if (errorTip) Toast.fail('请求超时，请稍后重试');
    },
    onShowSuccessTip: (response, successTip) => {
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
