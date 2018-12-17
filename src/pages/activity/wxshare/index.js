import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import { store } from 'utils/store';
import { Toast, InputItem } from 'antd-mobile';
import { createForm } from 'rc-form';
import { validators } from 'utils/validator';
import Cookie from 'js-cookie';
import { getDeviceType, getFirstError, isBugBrowser, isWXOpen } from 'utils/common';
import styles from './index.scss';
import bannerImg from './img/banner.png';

let timmer;
const API = {
	smsForLogin: '/invite/smsForLogin',
	sendsms: '/cmm/sendsms',
	jscfg: '/wx/jscfg',
	getShareUrl: '/invite/getShareUrl',
	doInvite: '/invite/doInvite'
};
const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
@fetch.inject()
@createForm()
export default class dc_landing_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			hideInput: false,
			timers: '获取验证码',
			timeflag: true,
			href: location.href,
			activeId: '',
			urlCode: '',
			flag: true,
			smsJrnNo: '' // 短信流水号
		};
	}
	componentWillMount() {
		if (!queryData.activeId) {
			this.props.toast.info('活动id不能为空');
			return;
		} else {
			this.setState({
				activeId: queryData.activeId
			});
		}
		this.setState({
			hideInput: queryData.hideInput ? true : false
		});
		this.wxshare();
	}
	wxshare = () => {
		const _this = this;
		if (wx) {
			const params = {
				channelCode: '01',
				redirectUrl: window.location.href
			};
			// 获取 微信 sdk
			this.props.$fetch.post(`/wx/jscfg`, params).then((result) => {
				console.log('result', result);
				if (result) {
					const { appId, timestamp, nonceStr, signature } = result;

					wx.config({
						debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
						appId, // 必填，公众号的唯一标识
						timestamp, // 必填，生成签名的时间戳
						nonceStr, // 必填，生成签名的随机串
						signature, // 必填，签名
						// jsApiList: [ 'checkJsApi', 'updateTimelineShareData', 'onMenuShareWeibo','updateTimelineShareData' ] // 必填，需要使用的JS接口列表
						jsApiList: [
							'checkJsApi',
							'onMenuShareAppMessage',
							'onMenuShareTimeline',
							'onMenuShareQQ',
							'onMenuShareWeibo',
							'onMenuShareQZone'
						] // 必填，需要使用的JS接口列表
					});
					wx.ready(function() {
						let shareData = {
							title: '邀请有礼',
							desc: '还到很牛x',
							link: _this.state.href, // 测试
							imgUrl: 'https://lns-static-resource.vbillbank.com/cashloan/wxapp_static/black_logo_2x.png',
							success: function() {
								// _this.doInvite();
								Toast.info('分享成功');
							},
							cancel: function() {
								Toast.info('取消成功');
							}
						};
						// wx.updateAppMessageShareData(shareData);
						// wx.updateTimelineShareData(shareData);
						// wx.onMenuShareWeibo(shareData);
						// 老版sdk
						wx.onMenuShareTimeline(shareData);
						wx.onMenuShareAppMessage(shareData);
						wx.onMenuShareQQ(shareData);
						wx.onMenuShareWeibo(shareData);
						wx.onMenuShareQZone(shareData);
					});
					wx.error(function(res) {
						Toast.info('error: ' + res.errMsg);
					});
				}
			});
		}
	};
	// 校验手机号
	validatePhone = (rule, value, callback) => {
		if (!validators.phone(value)) {
			callback('请输入正确手机号');
		} else {
			callback();
		}
	};

	//活动页登陆入口
	goLogin = () => {
		const osType = getDeviceType();
		if (!this.state.smsJrnNo) {
			Toast.info('请先获取短信验证码');
			return;
		}

		this.props.form.validateFields((err, values) => {
			if (!err) {
				// 埋点-注册登录页一键代还
				// buriedPointEvent(login.submit);
				this.props.$fetch
					.post(API.smsForLogin, {
						mblNo: values.phoneValue, // 手机号
						smsJrnNo: this.state.smsJrnNo, // 短信流水号
						osType, // 操作系统
						smsCd: values.smsCd, // IP地址
						usrCnl: queryData && queryData.h5Channel ? queryData.h5Channel : 'other', // 用户渠道
						location: store.getPosition(), // 定位地址 TODO 从session取
						activeId: Number(this.state.activeId),
						activeSecId: 6,
						activeThirdId: 7,
						code: (queryData && queryData.urlCode) || ''
					})
					.then(
						(res) => {
							if (res.msgCode !== 'PTM0000') {
								res.msgInfo && Toast.info(res.msgInfo);
								return;
							}
							this.setState({
								hideInput: true
							});
							Cookie.set('fin-v-card-token', res.data.tokenId, { expires: 365 });

							// store.setToken(res.data.tokenId);

							// TODO: 根据设备类型存储token
							if (isBugBrowser()) {
								store.setToken(res.data.tokenId);
							} else {
								store.setTokenSession(res.data.tokenId);
							}
							this.getShareUrl();
						},
						(error) => {
							error.msgInfo && Toast.info(error.msgInfo);
						}
					);
			} else {
				Toast.info(getFirstError(err));
			}
		});
	};
	// 获取用户邀请码
	getShareUrl = () => {
		if (!this.state.activeId) {
			Toast.info('活动id不能为空');
			return;
		}
		const osType = getDeviceType();
		this.props.$fetch
			.post(API.getShareUrl, {
				activeId: Number(this.state.activeId),
				channel: queryData && queryData.h5Channel ? queryData.h5Channel : 'other', // 用户渠道
				osType
			})
			.then((res) => {
				if (res.msgCode !== 'PTM0000') {
					res.msgInfo && Toast.info(res.msgInfo);
					return;
				}
				this.setState({
					urlCode: res.data.urlCode,
					href: `${this.state.href}&urlCode=${res.data.urlCode}`
				});
				location.href = `${this.state.href}&urlCode=${res.data.urlCode}&hideInput=true`;
			});
	};
	// 用户点击分享连接行为
	doInvite = () => {
		if (!this.state.activeId) {
			Toast.info('活动id不能为空');
			return;
		}
		const osType = getDeviceType();
		this.props.$fetch
			.post(API.doInvite, {
				activeId: Number(this.state.activeId),
				channel: queryData && queryData.h5Channel ? queryData.h5Channel : 'other', // 用户渠道
				osType,
				url: this.state.href
			})
			.then((res) => {
				if (res.msgCode !== 'PTM0000') {
					res.msgInfo && Toast.info(res.msgInfo);
					return;
				}
				Toast.info('分享成功');
			});
	};
	//获得手机验证码
	getTime(i) {
		if (!this.getSmsCode(i)) {
			return;
		}
	}
	// 获得手机验证码
	getSmsCode(i) {
		const osType = getDeviceType();
		this.props.form.validateFields((err, values) => {
			if (err && err.smsCd) {
				delete err.smsCd;
			}
			if (!err || JSON.stringify(err) === '{}') {
				// 埋点-登录页获取验证码
				// buriedPointEvent(login.getCode);
				// 发送验证码
				this.props.$fetch
					.post(API.sendsms, {
						type: '6',
						mblNo: values.phoneValue,
						osType
					})
					.then((result) => {
						if (result.msgCode !== 'PTM0000') {
							Toast.info(result.msgInfo);
							this.setState({ valueInputImgCode: '' });
							return false;
						}
						Toast.info('发送成功，请注意查收！');
						this.setState({ timeflag: false, smsJrnNo: result.data.smsJrnNo });
						timmer = setInterval(() => {
							this.setState({ flag: false, timers: i-- + '"' });
							if (i === -1) {
								clearInterval(timmer);
								this.setState({ timers: '重新获取', timeflag: true, flag: true });
							}
						}, 1000);
					});
			} else {
				Toast.info(getFirstError(err));
			}
		});
	}
	render() {
		// const {  } = this.state
		const { getFieldProps } = this.props.form;
		return (
			<div className={styles.dc_landing_page}>
				<img className={styles.banner} src={bannerImg} alt="落地页banner" />
				{!this.state.hideInput ? (
					<div className={styles.content}>
						<InputItem
							id="inputPhone"
							maxLength="11"
							type="number"
							className={styles.loginInput}
							placeholder="请输入您的手机号"
							{...getFieldProps('phoneValue', {
								rules: [ { required: true, message: '请输入正确手机号' }, { validator: this.validatePhone } ]
							})}
						/>
						<div className={styles.smsBox}>
							<InputItem
								id="inputCode"
								type="number"
								maxLength="6"
								className={styles.loginInput}
								placeholder="请输入短信验证码"
								{...getFieldProps('smsCd', {
									rules: [ { required: true, message: '请输入正确验证码' } ]
								})}
							/>
							<div
								className={this.state.flag ? styles.smsCode : styles.smsCodeNumber}
								onClick={() => {
									this.state.timeflag ? this.getTime(59) : '';
								}}
							>
								{this.state.timers}
							</div>
						</div>
						<div className={styles.sureBtn} onClick={this.goLogin}>
							<span>免费借款</span>
						</div>
					</div>
				) : null}
			</div>
		);
	}
}
