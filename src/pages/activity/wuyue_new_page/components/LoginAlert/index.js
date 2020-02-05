import React, { Component } from 'react';
import { InputItem, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';
import style from './index.scss';
import logo from './img/logo.png';
import { getDeviceType, getFirstError, validators, handleInputBlur } from 'utils';
import { getH5Channel } from 'utils/common';
import SXFButton from 'components/ButtonCustom';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
import { TFDLogin } from 'utils/getTongFuDun';

const API = {
	smsForLogin: '/signup/smsForLogin',
	sendsms: '/cmm/sendsms'
};
let timmer;
@fetch.inject()
@createForm()
export default class LoginAlert extends Component {
	static defaultProps = {};
	constructor(props) {
		super(props);
		this.state = {
			smsText: '获取验证码',
			timeflag: true,
			disabled: false,
			smsJrnNo: '' // 短信流水号
		};
	}
	componentDidMount() {}
	componentWillUnmount() {
		clearInterval(timmer);
	}
	// 校验手机号
	validatePhone = (rule, value, callback) => {
		if (!validators.phone(value)) {
			callback('请输入正确手机号');
		} else {
			callback();
		}
	};
	//获取手机验证码
	getSms(i) {
		if (!this.getSmsCode(i)) {
			return;
		}
	}
	getSmsCode(i) {
		const osType = getDeviceType();
		this.props.form.validateFields((err, values) => {
			if (err && err.smsCd) {
				delete err.smsCd;
			}
			if (!err || JSON.stringify(err) === '{}') {
				// 发送验证码
				this.props.$fetch
					.post(API.sendsms, {
						type: '6',
						mblNo: values.phoneValue,
						osType
					})
					.then(
						(result) => {
							if (result.msgCode !== 'PTM0000') {
								Toast.info(result.msgInfo);
								return;
							}
							Toast.info('发送成功，请注意查收！');
							this.setState({ timeflag: false, smsJrnNo: result.data.smsJrnNo });
							timmer = setInterval(() => {
								this.setState({ flag: false, smsText: i-- + '"' });
								if (i === -1) {
									clearInterval(timmer);
									this.setState({ smsText: '重新获取', timeflag: true, flag: true });
								}
							}, 1000);
						},
						(error) => {
							error.msgInfo && Toast.info(error.msgInfo);
						}
					);
				return true;
			}
			Toast.info(getFirstError(err));
		});
	}

	// 确定去登陆按钮
	goLogin = () => {
		const { loginCb, hasLoginCb } = this.props;
		buriedPointEvent(activity.mayNewConfirmRecBtn);
		if (!this.state.smsJrnNo) {
			Toast.info('请先获取短信验证码');
			return;
		}
		this.props.form.validateFields((err, values) => {
			if (!err) {
				this.props.$fetch
					.post(API.smsForLogin, {
						location: store.getPosition(), // 定位地址 TODO 从session取,
						osType: getDeviceType(),
						smsCd: values.smsCd,
						smsJrnNo: this.state.smsJrnNo,
						usrCnl: getH5Channel() // 用户渠道
					})
					.then(
						(res) => {
							if (res.msgCode !== 'PTM0000') {
								res.msgInfo && Toast.info(res.msgInfo);
								return;
							}
							Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });
							// TODO: 根据设备类型存储token
							store.setToken(res.data.tokenId);
							// 登录之后手动触发通付盾 需要保存cookie 和session fin-v-card-toke
							TFDLogin();
							if (res.data && res.data.registerFlg === '0') {
								// 1为已注册直接弹出针对于新用户弹框 0为发券
								loginCb && loginCb();
							} else {
								hasLoginCb && hasLoginCb();
							}
							// this.props.history.push('/home/home');
						},
						(err) => {
							Toast.info(err.msgInfo);
						}
					);
			} else {
				Toast.info(getFirstError(err));
			}
		});
	};
	// 验证验证码
	verifyVerifyCode = (rule, value, callback) => {
		if (value && value.length !== 6) {
			callback('请输入正确验证码');
		} else {
			callback();
		}
	};

	// 跳转协议
	go = (url) => {
		this.props.history.push(`/protocol/${url}`);
	};
	render() {
		const { getFieldProps } = this.props.form;
		const { smsText, timeflag } = this.state;
		return (
			<div className={style.login_alert}>
				<div className={style.logo_box}>
					<img className={style.logo} src={logo} />
					<div className={style.text}>怕逾期，用还到</div>
				</div>
				<div>
					<InputItem
						maxLength={11}
						type="text"
						disabled={this.state.disabled}
						pattern="[0-9]*"
						{...getFieldProps('phoneValue', {
							rules: [{ required: true, message: '请输入正确手机号' }]
						})}
						className={style.form_control}
						placeholder="请输入手机号码"
						onBlur={() => {
							handleInputBlur();
						}}
					/>
					<div className={style.get_sms_box}>
						<InputItem
							maxLength={6}
							type="text"
							pattern="[0-9]*{6,6}"
							{...getFieldProps('smsCd', {
								rules: [{ required: true, message: '请输入正确验证码' }, { validator: this.verifyVerifyCode }]
							})}
							className={style.form_control}
							placeholder="请输入验证码"
							onBlur={() => {
								handleInputBlur();
							}}
						/>
						<div className={style.sms_text}>
							<span
								className={!timeflag ? style.sms_text_dis : ''}
								onClick={() => {
									timeflag ? this.getSms(60) : '';
								}}
							>
								{smsText}
							</span>
						</div>
					</div>

					<div className={style.btn_box}>
						<SXFButton onClick={this.goLogin} className={style.btn_primary}>
							确认领取
						</SXFButton>
					</div>
					<div className={style.agreement}>
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
