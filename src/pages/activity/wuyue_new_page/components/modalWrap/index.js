import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, InputItem, Toast, Icon } from 'antd-mobile';
import { createForm } from 'rc-form';
import style from './index.scss';
import logo from './img/logo.png';
import { getDeviceType, getFirstError, validators, handleInputBlur } from 'utils';
import { getH5Channel } from 'utils/common';
import SXFButton from 'components/ButtonCustom';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import qs from 'qs';
import Cookie from 'js-cookie';

const API = {
	smsForLogin: '/signup/smsForLogin',
	sendsms: '/cmm/sendsms',
};
let timmer;
@fetch.inject()
@createForm()
export default class LoginAlert extends Component {

	static defaultProps = {
	};
	constructor(props) {
		super(props);
		this.state = {
			smsText: '获取验证码',
			timeflag: true,
			modalShow: true,
			disabled: false,
			mblNoHid: '',
			smsProps_disabled: false,
			loginProps_disabled: false,
			smsJrnNo: '', // 短信流水号
			otherProps_type: '', // 传递过来的参数
			loginProps_needLogin: false, // 是登陆不是短验
			loginProps_needLogin_copy: false
		};
	}
	componentDidMount() {

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
		const { goSubmitCb, smsSuccess } = this.props;
		const { otherProps_type } = this.state;
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
								goSubmitCb.PTM0000 && goSubmitCb.PTM0000(res, otherProps_type);
								// sa.login(res.userId);
								Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
								// TODO: 根据设备类型存储token
								store.setMposToken(true);
								smsSuccess && smsSuccess();
								store.setToken(res.loginToken);
								this.closeCb();
								// refreshPageFn();
							} else if (
								res.msgCode === 'URM0008' ||
								res.msgCode === 'PCC-UMS-0013' ||
								res.msgCode === 'PTM3011'
							) {
								goSubmitCb.URM0008 && goSubmitCb.URM0008(res, otherProps_type);
								Toast.info(res.msgInfo);
								this.props.form.setFieldsValue({
									smsCd: ''
								});
							} else {
								goSubmitCb.others && goSubmitCb.others(res, otherProps_type);
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
	validateMposRelSts = ({
		smsProps_disabled = true,
		loginProps_disabled = true,
		loginProps_needLogin = false,
		otherProps_type = 'home'
	}) => {
		const { validateMposCb } = this.props;
		this.setState({
			smsProps_disabled,
			loginProps_needLogin,
			loginProps_needLogin_copy: loginProps_needLogin,
			loginProps_disabled
		});
		const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
		this.props.$fetch
			.post(API.validateMposRelSts, {
				appid: query.appId,
				token: query.token
			})
			.then((res) => {
				if (res.msgCode === 'URM0000') {
					validateMposCb.URM0000 && validateMposCb.URM0000(res, otherProps_type);
					this.chkAuth(otherProps_type);
				} else if (res.msgCode === 'PTM9000' || res.msgCode === 'URM0001') {
					validateMposCb.PTM9000 && validateMposCb.PTM9000(res, otherProps_type);
				} else {
					validateMposCb.others && validateMposCb.others(res, otherProps_type);
					// Toast.info(res.msgInfo);
				}
			});
	};

	// 确定去登陆按钮
	goLogin = () => {
		const { goLoginCb, smsSuccess } = this.props;
		const { otherProps_type } = this.state;
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
							if (res.msgCode === 'PTM0000') {
								goLoginCb.PTM0000 && goLoginCb.PTM0000(res, otherProps_type);
								// sa.login(res.userId);
								store.setMposToken(true);
								smsSuccess && smsSuccess();
								Cookie.set('fin-v-card-token', res.data.tokenId, { expires: 365 });
								// TODO: 根据设备类型存储token
								store.setToken(res.data.tokenId);
								this.closeCb();
								// refreshPageFn();
							} else if (
								res.msgCode === 'URM0008' ||
								res.msgCode === 'PCC-UMS-0013' ||
								res.msgCode === 'PTM3011'
							) {
								goLoginCb.URM0008 && goLoginCb.URM0008(res, otherProps_type);
								Toast.info(res.msgInfo);
								this.props.form.setFieldsValue({
									smsCd: ''
								});
							} else {
								goLoginCb.others && goLoginCb.others(res, otherProps_type);
								// Toast.info('暂无活动资格');
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
		const { smsText, timeflag, loginProps_needLogin,loginProps_needLogin_copy } = this.state;
		return (
			<Modal
				className="login_alert_modal"
				visible={this.state.modalShow}
				transparent
				// onClose={this.onClose('modalShow')}
			>
				<div className={style.login_alert}>
					<i onClick={this.closeCb} className={style.close_icon} />
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
								pattern="[0-9]*{6,6}"
								{...getFieldProps('smsCd', {
									rules: [
										{ required: true, message: '请输入正确验证码' },
										{ validator: this.verifyVerifyCode }
									]
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
							<SXFButton
								onClick={
									loginProps_needLogin_copy && loginProps_needLogin ? this.goLogin : this.goSubmit
								}
								className={style.btn_primary}
							>
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
			</Modal>
		);
	}
}
