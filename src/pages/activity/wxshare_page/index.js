import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import { store } from 'utils/store';
import { Toast, InputItem } from 'antd-mobile';
import { createForm } from 'rc-form';
import { validators } from 'utils';
import Cookie from 'js-cookie';
import { getDeviceType, getFirstError, isWXOpen } from 'utils';
import styles from './index.scss';
import bannerImg from './img/banner.png';
import { TFDLogin } from 'utils/getTongFuDun';

let timmer;
const API = {
	smsForLogin: '/invite/smsForLogin',
	sendsms: '/cmm/sendsms',
	jscfg: '/wx/jscfg',
	getShareUrl: '/invite/getShareUrl',
	doInvite: '/invite/doInvite'
};
const osType = getDeviceType();
const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
@fetch.inject()
@createForm()
export default class wxshare_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			hideInput: false,
			timers: '获取验证码',
			timeflag: true,
			href: '',
			activeId: '',
			urlCode: '',
			flag: true,
			smsJrnNo: '' // 短信流水号
		};
	}
	componentWillMount() {
		let hideInputFlag = store.getHideInput();
		store.removeHideInput();
		if (!queryData.activeId) {
			this.props.toast.info('活动id不能为空');
			return;
		}
		this.setState(
			{
				href: location.href,
				activeId: queryData.activeId,
				hideInput: hideInputFlag ? true : false
			},
			() => {
				this.wxshare();
			}
		);
	}
	componentWillUnmount() {
		clearInterval(timmer);
	}
	wxshare = () => {
		const _this = this;
		if (isWXOpen() && window.wx) {
			const params = {
				channelCode: '01',
				redirectUrl: window.location.href
			};
			console.log(params, '------------');
			// 获取 微信 sdk
			this.props.$fetch.post(`/wx/jscfg`, params).then((result) => {
				console.log('result', result);
				if (result) {
					const { appId, timestamp, nonceStr, signature } = result;

					window.wx.config({
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
					window.wx.ready(function() {
						_this.updateLink();
					});
					window.wx.error(function(res) {
						Toast.info('error: ' + res.errMsg);
					});
				}
			});
		}
	};
	updateLink = () => {
		const _this = this;
		if (!isWXOpen()) {
			Toast.info('请用微信浏览器打开');
			return;
		}
		let shareData = {
			title: '邀请有礼',
			desc: '随行付旗下金融信贷产品，解决您每月还信用卡账单的资金压力，全方位保护用户的信息安全。',
			link: this.state.href.replace(/&hideInput=true/g, ''), // 测试
			imgUrl: 'https://lns-static-resource.vbillbank.com/cashloan/wxapp_static/black_logo_2x.png',
			success: function() {
				// 增加timeout 解决ios报系统开小差问题
				setTimeout(() => {
					_this.doInvite();
				}, 200);
			},
			cancel: function() {}
		};
		// window.wx.updateAppMessageShareData(shareData);
		// window.wx.updateTimelineShareData(shareData);
		// window.wx.onMenuShareWeibo(shareData);
		// 老版sdk
		window.wx.onMenuShareTimeline(shareData);
		window.wx.onMenuShareAppMessage({
			...shareData,
			success: function() {
				_this.doInvite(true);
			}
		});
		window.wx.onMenuShareQQ(shareData);
		window.wx.onMenuShareWeibo(shareData);
		window.wx.onMenuShareQZone(shareData);
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
						activeId: this.state.activeId,
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
							Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });

							// store.setToken(res.data.tokenId);

							// TODO: 根据设备类型存储token
							store.setToken(res.data.tokenId);
							// 登录之后手动触发通付盾 需要保存cookie 和session fin-v-card-toke
							TFDLogin();
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
		this.props.$fetch
			.post(API.getShareUrl, {
				activeId: this.state.activeId,
				channel: queryData && queryData.h5Channel ? queryData.h5Channel : 'other', // 用户渠道
				osType
			})
			.then((res) => {
				if (res.msgCode !== 'PTM0000') {
					res.data = {
						...res.data,
						urlCode: ''
					};
					// res.msgInfo && Toast.info(res.msgInfo);
					// return;
				}
				if (queryData.urlCode) {
					delete queryData.urlCode;
				}
				this.setState(
					{
						urlCode: res.data.urlCode,
						href: `${location.origin}${location.pathname}?${qs.stringify(queryData)}&urlCode=${
							res.data.urlCode
						}`
					},
					() => {
						store.setHideInput(true);
						this.updateLink();
					}
				);
				if (this.state.href.indexOf('urlCode') > -1) {
					let url = this.state.href.split('&urlCode')[0];
					location.href = `${url}&urlCode=${res.data.urlCode}`;
				} else {
					location.href = `${this.state.href}&urlCode=${res.data.urlCode}`;
				}
				// location.href = `${this.state.href}&urlCode=${res.data.urlCode}`;
			});
	};
	// 用户点击分享连接行为
	doInvite = (noShowMsg) => {
		if (!this.state.activeId) {
			Toast.info('活动id不能为空');
			return;
		}
		this.props.$fetch
			.post(API.doInvite, {
				activeId: this.state.activeId,
				channel: queryData && queryData.h5Channel ? queryData.h5Channel : 'other', // 用户渠道
				osType,
				url: this.state.href
			})
			.then(() => {
				// if (res.msgCode !== 'PTM0000') { // 暂时注释，活动id错误时不应影响用户注册登录
				// 	res.msgInfo && Toast.info(res.msgInfo);
				// 	return;
				// }
				if (noShowMsg) {
					if (osType !== 'ANDROID') {
						Toast.info('分享成功');
					}
				} else {
					Toast.info('分享成功');
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
				{!this.state.hideInput ? (
					<div className={styles.content}>
						<InputItem
							id="inputPhone"
							maxLength="11"
							type="number"
							className={styles.loginInput}
							placeholder="请输入您的手机号"
							{...getFieldProps('phoneValue', {
								rules: [{ required: true, message: '请输入正确手机号' }, { validator: this.validatePhone }]
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
									rules: [{ required: true, message: '请输入正确验证码' }]
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
