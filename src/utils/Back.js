// TODO: 添加一个返回监听需要改动三个地方
// 1、在此文件中加一个 case；
// 2、在对应的 page 页面中引入 noRouterBack.js；
// 3、在 noRouterBack.js 中添加页面的路由。
import { logoutAppHandler } from 'utils/common';
import qs from 'qs'
import { store } from 'utils/common'
if (window.history && window.history.pushState) {
  $(window).on('popstate', function () {
    var hashLocation = location.hash;
    var hashSplit = hashLocation.split("#!/");
    var hashName = hashSplit[1];
    if (hashName !== '') {
      let historyRouter = store.getHistoryRouter()
      var hash = window.location.hash;
      if (hash === '') {
        // 如果跳第三方 然后立马返回，则判断 MoxieBackUrl 有没有值
        if (store.getMoxieBackUrl()) {
          store.removeMoxieBackUrl();
          return;
        }
        switch (historyRouter) {
          case '/home/home':
            if (window.handleCloseHomeModal) {
              window.handleCloseHomeModal();
              return;
            }
            logoutAppHandler();
            break;
          case '/order/order_page':
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
            const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
            if (queryData.isShowCommit === 'true') {
              window.ReactRouterHistory.push('/home/home')
            } else {
              window.ReactRouterHistory.push('/mine/mine_page')
            }
            break;
          default:
            // window.ReactRouterHistory.goBack()
            break
        }
      }
    }
  });
}
