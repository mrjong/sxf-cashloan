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
        switch (historyRouter) {
          case '/home/home':
          case '/order/order_page':
          case '/mine/mine_page':
            if (store.getMoxieBackUrl()) {
              store.removeMoxieBackUrl();
            } else {
              logoutAppHandler();
            }
            break;
          case '/mine/bind_credit_page':
            if (store.getBackUrl() === '/mine/credit_extension_page') {
              window.ReactRouterHistory.push('/home/home')
            } else {
              window.ReactRouterHistory.goBack();
            }
            break;
          case '/mine/bind_save_page':
            if (store.getBackUrl() === '/mine/credit_extension_page') {
              window.ReactRouterHistory.push('/home/home')
            } else {
              window.ReactRouterHistory.goBack();
            }
            break;
          case '/order/repayment_succ_page':
            window.ReactRouterHistory.push('/home/home')
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
