/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-09-25 15:22:18
 */
import React, { Component } from 'react';
import fetch from 'sx-fetch';
// import { store } from 'utils/store';
import { isWXOpen } from 'utils';
import qs from 'qs';
import Blank from 'components/Blank';

const API = {
	payback: '/bill/getPayDate'
};
@fetch.inject()
export default class wx_middle_page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			errorInf: ''
		};
	}
	componentWillMount() {
		this.repay();
	}
	//调用还款接口逻辑
	repay = () => {
		// 微信外 02  微信内  03
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		queryData.backType = 'wxPay';
		const callbackUrl = location.origin + '/order/wx_pay_success_page?' + qs.stringify(queryData);
		const sendParams = {
			billNo: '',
			// cardAgrNo: '',
			usrBusCnl: 'WEB',
			prodType: '01',
			// coupId: '',
			// isPayOff: isPayAll ? '1' : '0',
			isPayOff: '0',
			thisRepTotAmt: '',
			adapter: '01',
			// repayPerds: isPayAll ? [] : repayPerds,
			repayPerds: [1],
			routeCode: 'WXPay',
			wxPayReqVo: {
				tradeType: isWXOpen() ? '03' : '02',
				osNm: '还到',
				callbackUrl,
				wapUrl: '33',
				wapNm: '44'
			}
		};
		this.props.$fetch
			.post(API.payback, sendParams)
			.then((res) => {
				// if (res.msgCode === 'PTM0000') {
				// buriedPointEvent(order.repaymentFirst, {
				// 	entry: entryFrom && entryFrom === 'home' ? '首页-查看代偿账单' : '账单',
				// 	is_success: true
				// });
				// store.setOrderSuccess({
				// 	isPayAll,
				// 	thisPerdNum,
				// 	thisRepTotAmt: parseFloat(totalAmt).toFixed(2),
				// 	perdLth: billDesc.perdLth,
				// 	perdUnit: billDesc.perdUnit,
				// 	billPrcpAmt: billDesc.billPrcpAmt,
				// 	billRegDt: billDesc.billRegDt
				// });
				// let wxData = res.data && res.data.rspOtherDate && JSON.parse(res.data.rspOtherDate);
				let wxData = res.data && JSON.parse(res.data);
				if (isWXOpen()) {
					document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
						window.WeixinJSBridge.invoke(
							'getBrandWCPayRequest',
							{
								appId: wxData.appId,
								timeStamp: wxData.timeStamp,
								nonceStr: wxData.nonceStr,
								package: wxData.package,
								signType: wxData.signType,
								paySign: wxData.paySign
							},
							(result) => {
								if (result.err_msg == 'get_brand_wcpay_request:ok') {
									setTimeout(() => {
										// this.getpayResult('支付成功');
									}, 2000);
								} else {
									// this.getLoanInfo();
									// this.queryExtendedPayType();
								}
							}
						);
					});
					// h5 支付方式
				} else {
					// let url = wxData.mweb_url && wxData.mweb_url.replace('&amp;', '&');
					// location.href = url;
				}
				// } else {
				// 	// buriedPointEvent(order.repaymentFirst, {
				// 	// 	entry: entryFrom && entryFrom === 'home' ? '首页-查看代偿账单' : '账单',
				// 	// 	is_success: false,
				// 	// 	fail_cause: res.msgInfo
				// 	// });
				// 	// this.setState({
				// 	// 	showModal: false,
				// 	// 	couponInfo: {},
				// 	// 	isShowDetail: false
				// 	// });
				// 	// this.props.toast.info(res.msgInfo);
				// 	// store.removeCouponData();
				// 	// // 刷新当前list
				// 	// setTimeout(() => {
				// 	// 	this.queryExtendedPayType();
				// 	// 	this.getLoanInfo();
				// 	// }, 3000);
				// }
			})
			.catch(() => {
				// store.removeCouponData();
				// this.setState({
				// 	showModal: false,
				// 	couponInfo: {},
				// 	isShowDetail: false
				// });
				this.setState({
					errorInf:
						'加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
				});
			});
	};
	render() {
		return <Blank errorInf={this.state.errorInf} />;
	}
}
