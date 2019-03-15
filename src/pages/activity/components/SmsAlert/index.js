import React, { Component } from 'react';
import { Button, Modal, InputItem, Toast, Icon } from 'antd-mobile';
import { createForm } from 'rc-form';
import style from './index.scss';
import logo from './img/logo.png';
import { getDeviceType, getFirstError, validators, handleInputBlur } from 'utils';
import { getH5Channel } from 'utils/common';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import qs from 'qs';
import Cookie from 'js-cookie';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
const API = {
	smsForLogin: '/signup/smsForLogin',
	sendsms: '/cmm/sendsms',
	validateMposRelSts: '/authorize/validateMposRelSts',
	chkAuth: '/authorize/chkAuth',
	doAuth: '/authorize/doAuth'
};
let timmer;
@fetch.inject()
@createForm()
export default class SmsAlert extends Component {
	constructor(props) {
		super(props);
		this.state = {
			smsText: '获取验证码',
			timeflag: true,
			modalShow: false,
			disabled: false,
			mblNoHid: '',
			smsJrnNo: '' // 短信流水号
		};
	}
	componentDidMount() {
		this.props.onRef(this);
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
						authToken: this.state.authToken
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
	goSubmit = () => {
		if (!this.state.smsJrnNo) {
			Toast.info('请先获取短信验证码');
			return;
		}
		this.props.form.validateFields((err, values) => {
			if (!err) {
				this.props.$fetch
					.post(API.doAuth, {
						authToken: this.state.authToken,
						location: store.getPosition(), // 定位地址 TODO 从session取,
						osType: getDeviceType(),
						smsCd: values.smsCd,
						smsJrnNo: this.state.smsJrnNo,
						smsFlg: 'Y'
					})
					.then(
						(res) => {
							if (res.msgCode === 'PTM0000') {
								// sa.login(res.userId);
								Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
                                // TODO: 根据设备类型存储token
                                store.setMposToken(true)
								store.setToken(res.loginToken);
								this.closeCb();
								// refreshPageFn();
							} else {
                                buriedPointEvent(activity.dazhuanpan_316_draw_result, {
                                    draw_result: '暂无资格',
                                });
								Toast.info('暂无活动资格');
								this.closeCb();
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
	closeCb = () => {
		this.setState({
			modalShow: false
		});
	};
	// 实名
	validateMposRelSts = (type) => {
		this.setState({
			disabled: type
		});
		const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
		if (query.appId && query.token) {
			this.props.$fetch
				.post(API.validateMposRelSts, {
					appid: query.appId,
					token: query.token
				})
				.then((res) => {
					if (res.msgCode === 'URM0000') {
						this.chkAuth();
					} else if (res.msgCode === 'PTM9000' || res.msgCode === 'URM0001') {
                        buriedPointEvent(activity.dazhuanpan_316_draw_result, {
                            draw_result: '暂无资格',
                        });
						Toast.info('暂无活动资格');
					} else {
						Toast.info(res.msgInfo);
					}
				});
		} else {
			this.setState({ type: 'login_tip' });
		}
	};

	chkAuth = () => {
		const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
		this.props.$fetch
			.post(API.chkAuth, {
				mblNo: query.telNo,
				appId: query.appId,
				token: query.token,
				location: store.getPosition(), // 定位地址 TODO 从session取,
				osType: getDeviceType(),
				province: '',
				usrCnl: getH5Channel()
			})
			.then((res) => {
				if (res.authFlag === '0') {
					this.setState({
						authToken: res.tokenId,
						mblNoHid: res.mblNoHid
					});
					this.doAuth(res.tokenId);
				} else if (res.authFlag === '1') {
                    // 已授权
                    store.setMposToken(true)
					Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
					store.setToken(res.loginToken);
				} else {
					Toast.info(res.msgInfo);
				}
			});
	};
	// 去授权
	doAuth = (token) => {
		this.props.$fetch
			.post(API.doAuth, {
				location: store.getPosition(), // 定位地址 TODO 从session取,
				osType: getDeviceType(),
				authToken: token
			})
			.then(
				(res) => {
					if (res.authSts === '01') {
                        console.log('发验证码');
                        buriedPointEvent(activity.dazhuanpan_316_draw_result, {
                            draw_result: '短验',
                        });
						this.setState({
							modalShow: true
						});
						this.props.form.setFieldsValue({
							phoneValue: res.mblNoHid
						});
					} else if (res.authSts === '00') {
                        // sa.login(res.userId);
                        store.setMposToken(true)
						Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
						store.setToken(res.loginToken);
					} else {
                        buriedPointEvent(activity.dazhuanpan_316_draw_result, {
                            draw_result: '暂无资格',
                        });
						// 暂无抽奖资格
						Toast.info('暂无活动资格');
					}
				},
				(err) => {
					Toast.info(err.msgInfo);
				}
			);
	};
	// 确定去登陆按钮
	goLogin = () => {
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
                                store.setMposToken(true)
								Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
								// TODO: 根据设备类型存储token
								store.setToken(res.loginToken);
								this.closeCb();
								// refreshPageFn();
							} else {
								Toast.info('暂无活动资格');
								this.closeCb();
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
		const { smsText, timeflag } = this.state;
		return (
			<Modal
				className="alert_sms"
				visible={this.state.modalShow}
				transparent
				// onClose={this.onClose('modalShow')}
			>
				<div className={style.login_alert}>
					<div className={style.logo_box}>
						<Icon type="cross" onClick={this.closeCb} className={style.close_icon} />
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
							<Button onClick={this.goSubmit} className={style.btn_primary} type="primary">
								确定
							</Button>
						</div>
					</div>
				</div>
			</Modal>
		);
	}
}
