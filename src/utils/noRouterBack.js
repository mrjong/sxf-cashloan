/*
 * @Author: shawn
 * @LastEditTime: 2019-09-06 17:46:05
 */
module.exports = () => {
	let home = [
		'/login',
		'/home/home',
		'/order/order_page',
		'/mine/mine_page',
		'/order/repayment_succ_page',
		'/mine/credit_list_page'
	];

	// if (window.history && window.history.pushState) {
	//   window.addEventListener('popstate', function () {
	//       if (home.includes(window.location.pathname)) {
	//         window.history.pushState(null, null, document.URL);
	//         // window.history.forward(1);
	//       }
	//     },
	//     false,
	//   );
	// }

	if (home.includes(window.location.pathname)) {
		window.history.pushState(null, null, document.URL); //在IE中必须得有这两行
	}
};
