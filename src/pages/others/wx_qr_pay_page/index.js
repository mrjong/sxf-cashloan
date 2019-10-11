/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-10-11 16:28:28
 */
import React, { Component } from 'react';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { isWXOpen, getDeviceType } from 'utils';
import qs from 'qs';
import Blank from 'components/Blank';
import Cookie from 'js-cookie';

const API = {
	wxAuthcb: '/wx/authcb',
	wxAuth: '/wx/auth',
	payUrl: '/bill/getPayUrl'
};
@fetch.inject()
export default class wx_qr_pay_page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			errorInf: ''
		};
	}
	componentWillMount() {
		this.silentAuth();
	}
	// 静默授权逻辑
	silentAuth = () => {
		// 移除cookie中的token
		Cookie.remove('fin-v-card-token');
		// 从url截取数据
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		const osType = getDeviceType();
		if (query && query.code) {
			this.props.$fetch
				.post(API.wxAuthcb, {
					state: query.state,
					code: query.code,
					// channelCode: getH5Channel(),
					osType: osType
				})
				.then((res) => {
					if (res.msgCode == 'WX0000' || res.msgCode == 'URM0100') {
						//请求成功,跳到登录页(前提是不存在已登录未注册的情况)
						console.log(res);
						// this.props.history.replace('/login')
						this.wxPay();
					} else if (res.msgCode == 'WX0100') {
						// 已授权不需要登陆
						Cookie.set('fin-v-card-token-wechat', res.token, { expires: 365 }); // 微信授权token
						Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.loginToken);
						// localStorage.setItem('authorizedNotLoginStats', 'true')
						// this.props.history.replace('/home/home')
						this.wxPay();
					} else {
						this.props.toast.info(res.msgInfo); //请求失败,弹出请求失败信息
					}
				})
				.catch((err) => {
					console.log(err);
					this.setState({
						errorInf:
							'加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
					});
				});
		} else {
			this.props.$fetch
				.post(API.wxAuth, {
					// channelCode: getH5Channel(),
					redirectUrl: encodeURIComponent(window.location.href),
					osType: osType
				})
				.then((res) => {
					if (res.msgCode == 'WX0101') {
						//没有授权
						Cookie.set('fin-v-card-token-wechat', res.token, { expires: 365 });
						window.location.href = decodeURIComponent(res.url);
					} else if (res.msgCode == 'WX0102' || res.msgCode == 'URM0100') {
						//已授权未登录 (静默授权为7天，7天后过期）
						// this.props.history.replace('/home/home')
						// this.props.history.replace('/login')
						this.wxPay();
					} else if (res.msgCode == 'WX0100') {
						//已授权已登录
						Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.loginToken);
						// localStorage.setItem('authorizedNotLoginStats', 'true')
						this.wxPay();
					} else {
						this.props.toast.info(res.msgInfo);
					}
				})
				.catch((err) => {
					console.log(err);
					this.setState({
						errorInf:
							'加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
					});
				});
		}
	};
	// 调用微信支付逻辑
	wxPay = () => {
		// 微信外 02  微信内  03
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		const sendParams = {
			reqOrdNo: queryData && queryData.reqOrdNo,
			osName: getDeviceType() === 'IOS' ? '01' : getDeviceType() === 'ANDRIOD' ? '02' : ''
		};
		this.props.$fetch
			.post(API.payUrl, sendParams)
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
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
											window.close();
											window.WeixinJSBridge.call('closeWindow');
										}, 2000);
									} else {
										this.setState({
											errorInf:
												'支付失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重试</a>'
										});
									}
								}
							);
						});
					}
					// // h5 支付方式
					// else {
					// 	// let url = wxData.mweb_url && wxData.mweb_url.replace('&amp;', '&');
					// 	// location.href = url;
					// }
				} else {
					this.props.toast.info(res.msgInfo);
				}
			})
			.catch(() => {
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
