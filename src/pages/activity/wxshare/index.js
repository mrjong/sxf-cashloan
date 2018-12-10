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
	smsForLogin: '/signup/smsForLogin',
	sendsms: '/cmm/sendsms',
	jscfg: '/wx/jscfg'
};
@fetch.inject()
@createForm()
export default class dc_landing_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			timers: '获取验证码',
			timeflag: true,
			flag: true,
			smsJrnNo: '' // 短信流水号
		};
	}
	componentWillMount() {
		// document.write("<script src='https://res.wx.qq.com/open/js/jweixin-1.4.0.js'></script>");
		if (wx) {
			const params = {
				channelCode: '01',
				redirectUrl: window.location.href
			};

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
						jsApiList: [ 'checkJsApi', 'onMenuShareTimeline', 'onMenuShareAppMessage' ] // 必填，需要使用的JS接口列表
					});
					wx.ready(function() {
						var shareData = {
							title: '测试标题',
							desc: '测试描述',
							link: 'www.bai.com',
							imgUrl: '',
							success: function(res) {
								alert('已分享');
							},
							cancel: function(res) {}
						};
						wx.onMenuShareAppMessage({
							title: '测试标题',
							desc: '测试描述',
							link: 'www.bai.com',
							imgUrl: '',
							trigger: function(res) {
								 alert('用户点击发送给朋友');
							},
							success: function(res) {
								alert('已分享');
							},
							cancel: function(res) {
								alert('已取消');
							},
							fail: function(res) {
								alert(JSON.stringify(res));
							}
						});
						wx.onMenuShareTimeline(shareData);
					});
					wx.error(function(res) {
						alert('error: ' + res.errMsg);
					});
				}
			});
		}
	}

	// 校验手机号
	validatePhone = (rule, value, callback) => {
		if (!validators.phone(value)) {
			callback('请输入正确手机号');
		} else {
			callback();
		}
	};

	//去登陆按钮
	goLogin = () => {
		const osType = getDeviceType();
		if (!this.state.smsJrnNo) {
			Toast.info('请先获取短信验证码');
			return;
		}
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
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
						location: store.getPosition() // 定位地址 TODO 从session取
					})
					.then(
						(res) => {
							if (res.msgCode !== 'PTM0000') {
								res.msgInfo && Toast.info(res.msgInfo);
								return;
							}
							sa.login(res.data.userId);
							Cookie.set('fin-v-card-token', res.data.tokenId, { expires: 365 });

							// store.setToken(res.data.tokenId);

							// TODO: 根据设备类型存储token
							if (isBugBrowser()) {
								store.setToken(res.data.tokenId);
							} else {
								store.setTokenSession(res.data.tokenId);
							}
							Toast.info('领取成功，请去APP打开使用', 2, () => {
								this.props.history.replace('/others/download_page');
							});
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
			</div>
		);
	}
}
