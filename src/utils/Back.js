// TODO: 添加一个返回监听需要改动三个地方
// 1、在此文件中加一个 case；
// 2、在对应的 page 页面中引入 noRouterBack.js；
// 3、在 noRouterBack.js 中添加页面的路由。
import React from 'react'
import { logoutAppHandler, changeHistoryState, isWXOpen, isBugBrowser } from 'utils/common';
import qs from 'qs';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
import PopUp from 'components/PopUp'
import Dialog from 'utils/Dialog'
const queryData = qs.parse(window.location.search, { ignoreQueryPrefix: true });
let initDialog = (errMsg) => {
  let obj = new PopUp(< Dialog open content={
    errMsg || '连接服务器失败，请稍后重试'
  }
    actions={
      [{
        label: '确定',
        className: 'rob-btn rob-btn-danger rob-btn-circle'
      }]
    }
    onRequestClose={
      (res) => {
        if (!res) {
          history.go(-2);
          obj.close();
        } else {
          obj.close()
        }
      }
    }
  //   actionClassName="rob-alert-button rob-alert-button-color rob-alert-button-45"
  />)
  return obj
}
let obj = initDialog('22222');

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
      if(store.getDisableBack()){
        return;
      }
      // 从魔蝎里点击残忍拒绝跳回来，解决信用加分点击两次才能退出
      if (window.location.pathname === '/mine/credit_extension_page' && window.location.search.indexOf('noBackParam')>0) {
        if (queryData.isShowCommit === 'true') {
          window.ReactRouterHistory.push('/home/home');
          return
        } else {
          window.ReactRouterHistory.push('/mine/mine_page');
          return
        }
      }
      if (window.location.pathname === '/mine/credit_list_page' && window.location.search.indexOf('noBackParam')>0) {
        window.ReactRouterHistory.push('/home/home');
      }
      if (window.location.pathname === '/home/home' && window.location.search.indexOf('noBackParam')>0) {
        logoutAppHandler();
        return
      }
      if (window.location.pathname === '/home/essential_information' || window.location.pathname === '/home/real_name') {
        if((window.location.pathname === '/home/real_name' && userInfo && userInfo.nameHid) || (window.location.pathname === '/home/real_name' && backFlag) || (window.location.pathname === '/home/essential_information' && backFlag)) {
          history.go(-2);
          // history.back();
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
        let protocolBack = store.getLoginBack();
        store.removeLoginBack();
        if (isWXOpen() && isAllowBack) {
          window.ReactRouterHistory.goBack()
        } else if (isWXOpen() && protocolBack) {
          return;
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
          console.log('----+',store.getMoxieBackUrl())
          if (store.getMoxieBackUrl()) {
            store.removeMoxieBackUrl();
          }

          // 如果从banner跳到外链 则不处理
          if (store.getOutLinkUrl()) {
            store.removeOutLinkUrl();
          }
          if (window.location.pathname === '/') {
            return;
          }
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
