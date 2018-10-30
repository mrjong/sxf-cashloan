// TODO: 添加一个返回监听需要改动三个地方
// 1、在此文件中加一个 case；
// 2、在对应的 page 页面中引入 noRouterBack.js；
// 3、在 noRouterBack.js 中添加页面的路由。
import { logoutAppHandler, changeHistoryState, isWXOpen, isBugBrowser } from 'utils/common';
import qs from 'qs';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
if (window.history && window.history.pushState) {
  window.addEventListener(
    'popstate',
    () => {
      // 获取token
      let token = Cookie.get('fin-v-card-token');
      let tokenFromStotage = '';
      if (isBugBrowser()) {
        tokenFromStotage = store.getToken();
      } else {
        tokenFromStotage = store.getTokenSession();
      }
      // 返回拦截弹窗
      let userInfo = store.getUserInfo();
      let backFlag = store.getBackFlag();
      store.removeBackFlag();
      if (window.location.pathname === '/home/essential_information' || window.location.pathname === '/home/real_name') {
        if((window.location.pathname === '/home/real_name' && userInfo && userInfo.nameHid && backFlag) || (window.location.pathname === '/home/essential_information' && backFlag)) {
          history.back();
        } else {
          document.activeElement.blur();
          obj.show()
          // window.history.pushState(null, null, document.URL);
        }
        return;
      }
      if (window.location.pathname === '/') {
        window.history.pushState(null, null, document.URL);
        return;
      }
      if (window.location.pathname === '/login') {
        console.log(window.ReactRouterHistory && window.ReactRouterHistory.location.state && window.ReactRouterHistory.location.state.isAllowBack)
        let isAllowBack = window.ReactRouterHistory && window.ReactRouterHistory.location.state && window.ReactRouterHistory.location.state.isAllowBack;
        if (isWXOpen() && isAllowBack) {
          window.ReactRouterHistory.goBack()
        } else if (isWXOpen()) {
          // 微信中点击登陆按钮也触发这个方法，根据token区分
          if (tokenFromStotage && token) {
            window.ReactRouterHistory.goBack()
          } else {
            window.close();
            WeixinJSBridge.call('closeWindow');
          }
        } else {
          window.history.pushState(null, null, document.URL);
        }
        return;
      }
      changeHistoryState();
      let hashLocation = window.location.hash;
      const hashSplit = hashLocation.split('#!/');
      let hashName = hashSplit[1];
      if (hashName !== '') {
        let historyRouter = store.getHistoryRouter();
        let hash = window.location.hash;
        if (hash === '') {
          // 如果跳第三方 然后立马返回，则判断 MoxieBackUrl 有没有值
          if (store.getMoxieBackUrl()) {
            store.removeMoxieBackUrl();
            return;
          }
          // 如果从banner跳到外链 则不处理
          if (store.getOutLinkUrl()) {
            store.removeOutLinkUrl();
            return;
          }
          if (window.location.pathname === '/') {
            return;
          }
          const queryData = qs.parse(window.location.search, { ignoreQueryPrefix: true });
          console.log(historyRouter)
          switch (historyRouter) {
            case '/login':
              return;
            case '/home/home':
              if (window.handleCloseHomeModal) {
                window.handleCloseHomeModal();
                return;
              }
              if (tokenFromStotage && token) {
                logoutAppHandler();
              }else if(isWXOpen() && !tokenFromStotage && !token){
                window.close();
                WeixinJSBridge.call('closeWindow');
              }
              break;
            case '/order/order_page':
              if (tokenFromStotage && token) {
                logoutAppHandler();
              }else if(isWXOpen() && !tokenFromStotage && !token){
                window.close();
                WeixinJSBridge.call('closeWindow');
              }
              break;
            case '/mine/mine_page':
              logoutAppHandler();
              break;
            case '/order/repayment_succ_page':
              window.ReactRouterHistory.push('/home/home');
              break;
            case '/mine/credit_list_page':
              window.ReactRouterHistory.push('/home/home');
              break;
            case '/mine/credit_extension_page':
              if (queryData.isShowCommit === 'true') {
                window.ReactRouterHistory.push('/home/home');
              } else {
                window.ReactRouterHistory.push('/mine/mine_page');
              }
              break;
            default:
              // window.ReactRouterHistory.goBack()
              break;
          }
        }
      }
    },
    false,
  );
}
