import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import { Toast } from 'antd-mobile';

const fetchinit = () => {
  let timer = undefined
  let timerList = []
  var num = 0
  // 拦截请求
  fetch.axiosInstance.interceptors.request.use(cfg => {
    const TOKEN = Cookie.get('fin-v-card-token');
    if (TOKEN) {
      cfg.headers['fin-v-card-token'] = TOKEN;
    } else {
      cfg.headers['fin-v-card-token'] = '';
    }
    num++
    if (!cfg.hideLoading) {
      // 防止时间短，出现loading 导致闪烁
      timer = setTimeout(() => {
        // 处理多个请求，只要一个loading
        if (timerList.length > 1) {
          return
        }
        Toast.loading('数据加载中...', 10)
      }, 300);
      timerList.push(timer)
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
        for (let i = 0; i < timerList.length; i++) {
          clearTimeout(timerList[i])
        }
        timer = undefined
        timerList = []
        Toast.hide()
      }
    } else {
      Toast.loading('数据加载中...', 10)
    }
    return response;
  }, error => {
    console.log(error)
    num--
    console.log('22222222', timerList)
    for (let i = 0; i < timerList.length; i++) {
      clearTimeout(timerList[i])
    }
    timer = undefined
    timerList = []
    Toast.hide()
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
      // 'fin-v-card-token': '912f2d1fc23445f4b8c3f0e0bcc10fe0',
    },
    onShowSuccessTip: (response, successTip) => {
      switch (response.data.msgCode) {
        case 'PTM0000':
          return;
        case 'PTM1000': // 用户登录超时
          Toast.info(response.data.msgInfo)
          setTimeout(() => {
            window.location.pathname = '/login'
          }, 3000);
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
