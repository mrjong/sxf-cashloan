import qs from 'qs';
import { address } from 'utils/Address';
import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { Toast, InputItem } from 'antd-mobile';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { getDeviceType, getFirstError, isWXOpen, validators, handleInputBlur } from 'utils';
import { setH5Channel, getH5Channel } from 'utils/common';
import { buriedPointEvent, pageView } from 'utils/analytins';
import { login } from 'utils/analytinsType';
import styles from './index.scss';
import bannerImg from './img/login_bg.png';
import logoImg from 'assets/images/common/black_logo.png';
import { setBackGround } from 'utils/background';
let timmer;
const API = {
	smsForLogin: '/signup/smsForLogin',
  sendsms: '/cmm/sendsms'
};

@setBackGround('#fff')
@fetch.inject()
@createForm()
export default class login_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			timers: '获取验证码',
			timeflag: true,
			flag: true,
			smsJrnNo: '', // 短信流水号
			disabledInput: false,
			queryData: {},
			isChecked: true, // 是否勾选协议
			inputFocus: false
		};
	}

	componentWillMount() {
		const queryData = qs.parse(this.props.history.location.search, {
			ignoreQueryPrefix: true
		});
		this.setState({
			queryData
		});
		store.removeLoginDownloadBtn();
		// 登录页单独处理
		window.history.pushState(null, null, document.URL);
		document.title = '还到';
		// 保存h5Channel变量
		const query = qs.parse(window.location.search, {
			ignoreQueryPrefix: true
		});
		// 在清除session之前先获取，然后再存到session里，防止h5Channel在登录页丢失
		const storeH5Channel = getH5Channel();
		// 移除cookie
		Cookie.remove('fin-v-card-token');

		let MessageTagError = store.getMessageTagError();
		let MessageTagStep = store.getMessageTagStep();
		sessionStorage.clear();
		localStorage.clear();
		// 首页弹窗要用的
		MessageTagError && store.setMessageTagError(MessageTagError);
		MessageTagStep && store.setMessageTagStep(MessageTagStep);

		setH5Channel(storeH5Channel);

		store.setHistoryRouter(window.location.pathname);

		this.props.form.getFieldProps('phoneValue');
		// mpos 初始化手机号
		this.props.form.setFieldsValue({
			phoneValue: queryData && queryData.mblNoHid
		});
		if (queryData && queryData.mblNoHid) {
			this.setState({
				disabledInput: true
			});
		}
	}
	componentDidMount() {
		let _this = this;
		let originClientHeight = document.documentElement.clientHeight;
		// 安卓键盘抬起会触发resize事件，ios则不会
		window.addEventListener('resize', function() {
			if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
				let clientHeight = document.documentElement.clientHeight;
				_this.setState({
					inputFocus: originClientHeight > clientHeight
				});
				window.setTimeout(function() {
					document.activeElement.scrollIntoViewIfNeeded();
				}, 0);
			}
		});
		// 获取地址
		address();
		pageView();
	}

	componentWillUnmount() {
		window.removeEventListener('resize', function() {
			if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
				window.setTimeout(function() {
					document.activeElement.scrollIntoViewIfNeeded();
				}, 0);
			}
		});
		clearInterval(timmer);
	}

	// 校验手机号
	validatePhone = (rule, value, callback) => {
		let v = value && value.replace(/\s*/g, '');
		if (!validators.phone(v)) {
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
		if (!this.state.isChecked) {
			Toast.info('请先勾选协议');
			return;
		}
		this.props.form.validateFields((err, values) => {
			if (!err) {
				// 埋点-注册登录页一键代还
				buriedPointEvent(login.submit);
				let param = {
					smsJrnNo: this.state.smsJrnNo, // 短信流水号
					osType, // 操作系统
					smsCd: values.smsCd,
					usrCnl: getH5Channel(), // 用户渠道
					location: store.getPosition() // 定位地址 TODO 从session取
				};
				if (!this.state.disabledInput) {
					param.mblNo = values.phoneValue; // 手机号
				}
				this.props.$fetch.post(API.smsForLogin, param).then(
					(res) => {
						if (res.msgCode !== 'PTM0000') {
							res.msgInfo && Toast.info(res.msgInfo);
							return;
						}
						Cookie.set('fin-v-card-token', res.data.tokenId, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.data.tokenId);
						this.props.history.replace('/others/download_page');
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
		const { queryData } = this.state;
		const osType = getDeviceType();
		this.props.form.validateFields((err, values) => {
			if (err && err.smsCd) {
				delete err.smsCd;
			}
			if (!err || JSON.stringify(err) === '{}') {
				// 埋点-登录页获取验证码
				buriedPointEvent(login.getCode);
				let param = {};
				if (this.state.disabledInput) {
					param = {
						type: '6',
						authToken: queryData && queryData.tokenId,
						osType
					};
				} else {
					param = {
						type: '6',
						mblNo: values.phoneValue && values.phoneValue.replace(/\s*/g, ''),
						osType
					};
				}
				// 发送验证码
				this.props.$fetch.post(API.sendsms, param).then((result) => {
					if (result.msgCode !== 'PTM0000') {
						Toast.info(result.msgInfo);
						this.setState({ valueInputImgCode: '' });
						return false;
					}
					Toast.info('发送成功，请注意查收！');
					this.setState({ timeflag: false, smsJrnNo: result.data.smsJrnNo });
					timmer = setInterval(() => {
						this.setState({ flag: false, timers: i-- + 's' });
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
	// 跳转协议
	go = (url) => {
		store.setLoginBack(true);
		this.props.history.push(`/protocol/${url}`);
	};

	backTop = () => {
		this.refs.loginWrap.scrollTop = 0;
	};

	checkAgreement = () => {
		this.setState({
			isChecked: !this.state.isChecked
		});
	};

	render() {
		const { getFieldProps } = this.props.form;
		return (
			<div ref="loginWrap" className={styles.dc_landing_page}>
				<img className={styles.banner} src={bannerImg} alt="落地页banner" />
				<div ref="loginContent" className={styles.content}>
					<div className={styles.loginContentBox}>
						<p className={styles.title}>最高可借额度(元)</p>
						<p className={styles.moneyText}>50000</p>
						<InputItem
							disabled={this.state.disabledInput}
							id="inputPhone"
							maxLength="13"
							type="phone"
							className={styles.loginInput}
							placeholder="请输入您的手机号"
							{...getFieldProps('phoneValue', {
								rules: [
									{ required: true, message: '请输入正确手机号' },
									{ validator: !this.state.disabledInput && this.validatePhone }
								]
							})}
							onBlur={() => {
								this.setState({
									inputFocus: false
								});
								handleInputBlur();
							}}
						/>
						<div className={styles.smsBox}>
							<InputItem
								id="inputCode"
								type="number"
								maxLength="6"
								className={[styles.loginInput, styles.smsCodeInput].join(' ')}
								placeholder="请输入短信验证码"
								{...getFieldProps('smsCd', {
									rules: [{ required: true, message: '请输入正确验证码' }]
								})}
								onBlur={() => {
									this.setState({
										inputFocus: false
									});
									handleInputBlur();
								}}
							/>
							<div
								className={
									this.state.timers.indexOf('s') === -1
										? styles.smsCode
										: [styles.smsCode, styles.smsCode2].join(' ')
								}
								onClick={() => {
									this.state.timeflag ? this.getTime(59) : '';
								}}
							>
								{this.state.timers}
								<i className={styles.leftBorder} />
							</div>
						</div>
						<div className={styles.sureBtn} onClick={this.goLogin}>
							<span>查看额度</span>
						</div>
						<i className={[styles.commonLine, styles.leftTopLine].join(' ')} />
						<i className={[styles.commonLine, styles.rightTopLine].join(' ')} />
						<i className={[styles.commonLine, styles.leftBottomLine].join(' ')} />
						<i className={[styles.commonLine, styles.rightBottomLine].join(' ')} />
					</div>
				</div>
				<div className={styles.agreement}>
					<i
						className={this.state.isChecked ? styles.checked : [styles.checked, styles.nochecked].join(' ')}
						onClick={this.checkAgreement}
					/>
					<div className={styles.agreementCont}>
						阅读并接受
						<span
							onClick={() => {
								this.go('register_agreement_page');
							}}
						>
							《随行付金融用户注册协议》
						</span>
						<span
							onClick={() => {
								this.go('privacy_agreement_page');
							}}
						>
							《随行付用户隐私权政策》
						</span>
					</div>
				</div>
			</div>
		);
	}
}
