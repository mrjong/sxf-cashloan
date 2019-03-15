import React, { Component } from 'react';
import { Button, List, InputItem, Toast, Icon } from 'antd-mobile';
import { createForm } from 'rc-form';
import style from './index.scss';
import logo from './img/logo.png';
import { getDeviceType, getFirstError, validators, handleInputBlur } from 'utils';
import { getH5Channel } from 'utils/common';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import qs from 'qs';
import Cookie from 'js-cookie';

const API = {
	smsForLogin: '/signup/smsForLogin',
	sendsms: '/cmm/sendsms'
};
let timmer;
@fetch.inject()
@createForm()
export default class LoginComponent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			smsText: '获取验证码',
			timeflag: true,
			smsJrnNo: '' // 短信流水号
		};
	}
	componentWillMount() {
		this.props.form.setFieldsValue({
			phoneValue: this.props.mblNoHid
		});
	}
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
		this.props.form.validateFields((err, values) => {
			if (err && err.smsCd) {
				delete err.smsCd;
			}
			if (!err || JSON.stringify(err) === '{}') {
				// 发送验证码
				this.props.$fetch
					.post(API.sendsms, {
						type: '5',
						authToken: this.props.smsTokenId
					})
					.then(
						(result) => {
							if (result.msgCode !== 'PTM0000') {
								Toast.info(result.msgInfo);
								return;
							} else {
								Toast.info('发送成功，请注意查收！');
								this.setState({ timeflag: false, smsJrnNo: result.data.smsJrnNo });
								timmer = setInterval(() => {
									this.setState({ flag: false, smsText: i-- + '"' });
									if (i === -1) {
										clearInterval(timmer);
										this.setState({ smsText: '重新获取', timeflag: true, flag: true });
									}
								}, 1000);
							}
						},
						(error) => {
							error.msgInfo && Toast.info(error.msgInfo);
						}
					);
				return true;
			} else {
				Toast.info(getFirstError(err));
			}
		});
	}
	//登录判断
	goSubmit(code) {
		let { codeInput } = this.state;
		if (!codeInput) {
			this.props.toast.info('请输入验证码');
			return;
		}
		if (!/^\d{6}$/.test(codeInput)) {
			this.props.toast.info('验证码输入不正确');
			return;
		}
		this.props.$fetch
			.post(API.doAuth, {
				authToken: this.props.smsTokenId,
				location: store.getPosition(), // 定位地址 TODO 从session取,
				osType: getDeviceType(),
				smsCd: codeInput,
				smsJrnNo: this.state.smsJrnNo,
				smsFlg: 'Y'
			})
			.then(
				(res) => {
					if (res.authSts === '00') {
						// sa.login(res.userId);
						Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.loginToken);
						closeCb();
						refreshPageFn();
					} else {
						Toast.info('暂无活动资格');
						closeCb();
					}
				},
				(err) => {
					Toast.info(err.msgInfo);
				}
			);
	}

	// 确定去登陆按钮
	goLogin = () => {
		const { closeCb, refreshPageFn } = this.props;
		const osType = getDeviceType();
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
						smsFlg: 'Y'
					})
					.then(
						(res) => {
							if (res.authSts === '00') {
								// sa.login(res.userId);
								Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
								// TODO: 根据设备类型存储token
								store.setToken(res.loginToken);
								closeCb();
								refreshPageFn();
							} else {
								Toast.info('暂无活动资格');
								closeCb();
							}
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
	render() {
		const { getFieldProps } = this.props.form;
		return (
			<div className={style.login_alert}>
				<div className={style.logo_box}>
					<Icon type="cross" onClick={this.props.closeCb} className={style.close_icon} />
					<img className={style.logo} src={logo} />
					<div className={style.text}>怕逾期，用还到</div>
				</div>
				<div>
					<InputItem
						maxLength={11}
                        type="text"
                        disabled
						pattern="[0-9]*"
						{...getFieldProps('phoneValue', {
							rules: [ { required: true, message: '请输入正确手机号' } ]
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
							pattern="[0-9]*"
							{...getFieldProps('smsCd', {
								rules: [ { required: true, message: '请输入正确验证码' } ]
							})}
							className={style.form_control}
							placeholder="请输入验证码"
							onBlur={() => {
								handleInputBlur();
							}}
						/>
						<div className={style.sms_text}>
							<span
								onClick={() => {
									this.state.timeflag ? this.getSms(60) : '';
								}}
							>
								获取验证码
							</span>
						</div>
					</div>

					<div className={style.btn_box}>
						<Button onClick={this.goLogin} className={style.btn_primary} type="primary">
							确定
						</Button>
					</div>
				</div>
			</div>
		);
	}
}
