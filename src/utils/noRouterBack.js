module.exports = () => {
  let home = [
    '/home/home',
    '/order/order_page',
    '/mine/mine_page',
    '/mine/credit_extension_page',
    '/order/repayment_succ_page',
    '/mine/credit_list_page',
  ];

  if (window.history && window.history.pushState) {
    $(window).on('popstate', function() {
      if (home.includes(location.pathname)) {
        window.history.pushState('forward', null, '#');
        window.history.forward(1);
      }
    });
  }

  if (home.includes(location.pathname)) {
    window.history.pushState('forward', null, '#'); //在IE中必须得有这两行
    window.history.forward(1);
  }
};
