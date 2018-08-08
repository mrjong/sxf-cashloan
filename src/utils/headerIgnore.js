export default (type) => {
  const ua = window.navigator.userAgent
  if (type === 'false') {
    if (!/MicroMessenger/i.test(ua) && !/SuiXingPay-Mpos/i.test(ua) && !/SuiXingPay-Cashier/i.test(ua)) {
      return true
    } else {
      return false
    }
  } else {
    if (/MicroMessenger/i.test(ua) || /SuiXingPay-Mpos/i.test(ua) || /SuiXingPay-Cashier/i.test(ua)) {
      return true
    } else {
      return false
    }
  }
};
