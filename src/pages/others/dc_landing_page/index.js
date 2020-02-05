import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { InputItem } from 'antd-mobile';
import { createForm } from 'rc-form';
import Cookie from 'js-cookie';
import { getDeviceType, getFirstError, validators, handleInputBlur, queryUsrSCOpenId } from 'utils';
import { getH5Channel } from 'utils/common';
import styles from './index.scss';
import bannerImg from './img/banner.png';
import { TFDLogin } from 'utils/getTongFuDun';

let timmer;
const API = {
	smsForLogin: '/signup/smsForLogin',
	sendsms: '/cmm/sendsms'
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
			this.props.toast.info('请先获取短信验证码');
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
						usrCnl: getH5Channel(), // 用户渠道
						location: store.getPosition() // 定位地址 TODO 从session取
					})
					.then(
						(res) => {
							if (res.msgCode !== 'PTM0000') {
								res.msgInfo && this.props.toast.info(res.msgInfo);
								return;
							}
							queryUsrSCOpenId({ $props: this.props });
							Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });

							// store.setToken(res.data.tokenId);

							// TODO: 根据设备类型存储token
							store.setToken(res.data.tokenId);
							// 登录之后手动触发通付盾 需要保存cookie 和session fin-v-card-toke
							TFDLogin();
							this.props.toast.info('领取成功，请去APP打开使用', 2, () => {
								this.props.history.replace('/others/download_page');
							});
						},
						(error) => {
							error.msgInfo && this.props.toast.info(error.msgInfo);
						}
					);
			} else {
				this.props.toast.info(getFirstError(err));
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
							this.props.toast.info(result.msgInfo);
							this.setState({ valueInputImgCode: '' });
							return false;
						}
						this.props.toast.info('发送成功，请注意查收！');
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
				this.props.toast.info(getFirstError(err));
			}
		});
	}

	// 跳转协议
	go = (url) => {
		store.setLoginBack(true);
		this.props.history.push(`/protocol/${url}`);
	};

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
							rules: [{ required: true, message: '请输入正确手机号' }, { validator: this.validatePhone }]
						})}
						onBlur={() => {
							handleInputBlur();
						}}
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
							onBlur={() => {
								handleInputBlur();
							}}
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
					<div className={styles.agreement}>
						注册即视为同意
						<span
							onClick={() => {
								this.go('register_agreement_page');
							}}
						>
							《用户注册协议》
						</span>
						<span
							onClick={() => {
								this.go('privacy_agreement_page');
							}}
						>
							《用户隐私权政策》
						</span>
					</div>
				</div>
			</div>
		);
	}
}
