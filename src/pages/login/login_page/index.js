/*
 * @Author: shawn
 * @LastEditTime : 2020-02-19 15:17:07
 */
import qs from 'qs';
import { address } from 'utils/Address';
import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { Toast, InputItem, Modal } from 'antd-mobile';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { connect } from 'react-redux';
import { TFDLogin } from 'utils/getTongFuDun';
import { logoutClearData } from 'utils/CommonUtil/commonFunc';

import {
	getDeviceType,
	getFirstError,
	validators,
	handleInputBlur,
	activeConfigSts,
	queryUsrSCOpenId,
	recordContract
} from 'utils';
import { setUserInfoAction } from 'reduxes/actions/staticActions';
import { base64Encode } from 'utils/CommonUtil/toolUtil';
import { msg_slide, msg_sms, signup_sms, download_queryDownloadUrl } from 'fetch/api';

import { setH5Channel, getH5Channel } from 'utils/common';
import {
	buriedPointEvent,
	pageView,
	SxfDataRegisterEventSuperPropertiesOnce,
	sxfDataPv,
	sxfburiedPointEvent
} from 'utils/analytins';
import { login, wxTest } from 'utils/analytinsType';
import { domListen } from 'utils/domListen';
import styles from './index.scss';
import ImageCode from 'components/ImageCode';
import { setBackGround } from 'utils/background';
import hegui_bg from './img/hegui_bg.png';
import login_bg1 from './img/login_bg1.png';
import login_bg2 from './img/login_bg2.png';
import login_bg3 from './img/login_bg3.png';
import login_bg4 from './img/login_bg4.png';
import loginModalBg from './img/login_modal.png';
import loginModalBtn from './img/login_modal_btn.png';
import closeIco from './img/close_ico.png';

let timmer;
let modalTimer = null;
let entryPageTime = '';

@fetch.inject()
@createForm()
@domListen()
@setBackGround('#50C5FC')
@connect(
	(state) => state,
	{ setUserInfoAction }
)
// @connect()
export default class login_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			timers: '获取验证码',
			countDownTime: 59,
			timeflag: true,
			smsJrnNo: '', // 短信流水号
			disabledInput: false,
			queryData: {},
			isChecked: false, // 是否勾选协议
			imageCodeUrl: '', // 图片验证码url
			showSlideModal: false,
			slideImageUrl: '',
			mobilePhone: '',
			times: 3, // 弹框里的倒计时
			showDownloadModal: false,
			errMsg: '' // 错误信息
		};
	}

	componentWillMount() {
		const queryData = qs.parse(this.props.history.location.search, {
			ignoreQueryPrefix: true
		});
		this.setState({
			queryData
		});
		// 登录页单独处理
		window.history.pushState(null, null, document.URL);
		document.title = '登录和注册';
		// 在清除session之前先获取，然后再存到session里，防止h5Channel在登录页丢失
		const storeH5Channel = getH5Channel();

		let sxfDataLocal = localStorage.getItem('_bp_wqueue');
		let sxfData_20190815_sdk = localStorage.getItem('sxfData_20190815_sdk');
		let wenjuan = localStorage.getItem('wenjuan');

		logoutClearData();

		// 首页弹窗要用的

		wenjuan && localStorage.setItem('wenjuan', wenjuan);
		sxfDataLocal && localStorage.setItem('_bp_wqueue', sxfDataLocal);
		sxfData_20190815_sdk && localStorage.setItem('sxfData_20190815_sdk', sxfData_20190815_sdk);

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
		sxfDataPv({ pId: 'dl' });
		sxfburiedPointEvent('DC_chkBox');
	}
	componentDidMount() {
		// 获取地址
		address();
		pageView();
		entryPageTime = new Date();
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
		const { queryData = {} } = this.state;
		if (queryData && queryData.wxTestFrom) {
			let exitPageTime = new Date();
			let durationTime = (exitPageTime.getTime() - entryPageTime.getTime()) / 1000;
			buriedPointEvent(wxTest.wxTestLoginPageTime, {
				durationTime: durationTime,
				entry: queryData.wxTestFrom
			});
		} else {
			entryPageTime = '';
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
	goFLHome = () => {
		activeConfigSts({
			$props: this.props,
			type: 'A',
			callback: this.requestGetStatus
		});
	};
	//去登陆按钮
	goLogin = () => {
		const { queryData = {} } = this.state;
		if (queryData && queryData.wxTestFrom) {
			buriedPointEvent(wxTest.wxTestLoginBtnClick, {
				entry: queryData.wxTestFrom
			});
		}
		if (!this.validateFn()) {
			return;
		}
		const osType = getDeviceType();
		if (!this.state.smsJrnNo) {
			// Toast.info('请先获取短信验证码');
			this.setState({
				errMsg: '请先获取短信验证码'
			});
			return;
		}
		this.props.form.validateFields((err, values) => {
			if (!err) {
				this.setState({
					errMsg: ''
				});
				// 埋点-注册登录页一键代还
				buriedPointEvent(login.submit);
				let param = {
					tokenId: this.state.relyToken, // 短信流水号
					osType: osType.toLowerCase(), // 操作系统
					loginType: '0',
					smsCode: values.smsCd,
					imei: '',
					mac: '',
					registrationId: '',
					userChannel: getH5Channel(), // 用户渠道
					location: store.getPosition() // 定位地址 TODO 从session取
				};
				Toast.loading('加载中...', 10);
				this.props.$fetch.post(signup_sms, param).then(
					(res) => {
						if (res.code !== '000000') {
							Toast.hide();
							this.setState({
								errMsg: res.message
							});
							buriedPointEvent(login.submitFail, {
								fail_cause: res.message
							});
							return;
						}
						this.setState({
							errMsg: ''
						});
						this.props.setUserInfoAction(res.data);
						Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.data.tokenId);
						// 登录之后手动触发通付盾 需要保存cookie 和session fin-v-card-toke
						TFDLogin();
						SxfDataRegisterEventSuperPropertiesOnce({ gps: store.getPosition() });
						// contractType 为协议类型 01为用户注册协议 02为用户隐私协议 03为用户协议绑卡,用户扣款委托书
						recordContract({
							contractType: '01,02'
						});
						if (this.state.disabledInput) {
							this.goFLHome();
						} else {
							this.goHome();
						}
					},
					(error) => {
						buriedPointEvent(login.submitFail, {
							fail_cause: error.message
						});
						error.message &&
							this.setState({
								errMsg: error.message
							});
					}
				);
			} else {
				this.setState({
					errMsg: getFirstError(err)
				});
			}
		});
	};
	// 开始倒计时
	startCountDownTime = () => {
		clearInterval(timmer);
		let { countDownTime } = this.state;
		timmer = setInterval(() => {
			this.setState(
				{
					timers: countDownTime-- + 's'
				},
				() => {
					if (countDownTime === -1) {
						clearInterval(timmer);
						this.setState({ timers: '重新获取', timeflag: true, countDownTime: 59 });
					}
				}
			);
		}, 1000);
	};

	// 处理获取验证码按钮点击事件
	handleSmsCodeClick = () => {
		const { queryData = {} } = this.state;
		if (queryData && queryData.wxTestFrom) {
			buriedPointEvent(wxTest.wxTestLoginSmsCode, {
				entry: queryData.wxTestFrom
			});
		}
		if (!this.state.timeflag) return;
		this.getSmsCode();
	};

	// 获得手机验证码
	getSmsCode() {
		this.props.form.validateFields((err, values) => {
			if (err && err.smsCd) {
				delete err.smsCd;
			}
			if (!err || JSON.stringify(err) === '{}') {
				this.setState({
					errMsg: ''
				});
				// 埋点-登录页获取验证码
				buriedPointEvent(login.getCode);
				this.setState(
					{
						mobilePhone: values.phoneValue
					},
					() => {
						this.handleTokenAndSms();
					}
				);
			} else {
				this.setState({
					errMsg: getFirstError(err)
				});
				// Toast.info(getFirstError(err));
			}
		});
	}

	/**华丽的分割线 */
	// 获取滑动验证码token并发短信
	handleTokenAndSms = () => {
		this.refreshSlideToken().then(() => {
			this.sendSlideVerifySmsCode();
		});
	};

	// 获取滑动验证码token并获取大图
	handleTokenAndImage = () => {
		this.refreshSlideToken();
	};

	// 刷新滑动验证码token
	refreshSlideToken = () => {
		return new Promise((resolve) => {
			const osType = getDeviceType();
			const { queryData } = this.state;
			Toast.loading('加载中...', 10);
			let mobilePhone = '';
			if (this.state.disabledInput) {
				mobilePhone = queryData.tokenId;
			} else {
				mobilePhone = base64Encode(this.state.mobilePhone);
			}
			this.props.$fetch.get(`${msg_slide}/${mobilePhone}`).then((result) => {
				if (result.code === '000003' && result.data && result.data.tokenId) {
					this.setState({
						relyToken: (result && result.data && result.data.tokenId) || '',
						submitData: {
							mblNo: this.state.mobilePhone,
							osType,
							bFlag: '',
							type: '6'
						}
					});
					resolve();
				} else if (result.code === '000000') {
					Toast.hide();
					this.setState({
						relyToken: result.data.tokenId,
						slideImageUrl: result.data.backImage,
						smallImageUrl: result.data.sliderImage,
						yOffset: result.data.sliderHeight, // 小图距离大图顶部距离
						bigImageH: result.data.backHeight, // 大图实际高度
						showSlideModal: true
					});
				} else {
					Toast.info(result.message);
				}
			});
		});
	};

	// 获取短信(滑动验证码)
	sendSlideVerifySmsCode = (xOffset = '', cb) => {
		const data = {
			slideDistance: xOffset,
			tokenId: this.state.relyToken,
			type: '6'
		};
		this.props.$fetch
			.post(msg_sms, data)
			.then((result) => {
				this.setState({
					// 去掉错误显示
					errMsg: ''
				});
				if (result.code === '000000') {
					Toast.info('发送成功，请注意查收！');
					this.setState({
						timeflag: false,
						smsJrnNo: result.data.tokenId
					});
					cb && cb('success');
					setTimeout(() => {
						this.closeSlideModal();
					}, 1500);

					this.startCountDownTime();
				} else if (result.code === '000006') {
					// 弹窗不存在时请求大图
					!this.state.showSlideModal && this.handleTokenAndImage();
					cb && cb('error');
				} else if (result.code === '000004') {
					//重新刷新relyToken
					this.handleTokenAndImage();
					cb && cb('refresh');
				} else {
					// 达到短信次数限制
					if (xOffset) {
						Toast.info(result.message);
					} else {
						this.setState({
							errMsg: result.message
						});
					}
					cb && cb('error');
					this.closeSlideModal();
				}
			})
			.catch(() => {
				cb && cb('error');
				this.closeSlideModal();
			});
	};

	showSlideModal = () => {
		this.setState({ showSlideModal: true });
	};

	closeSlideModal = () => {
		this.setState({ showSlideModal: false });
	};
	/**华丽的分割线 */
	// 跳转协议
	go = (url) => {
		store.setLoginBack(true);
		this.props.history.push(`/protocol/${url}`);
	};

	checkAgreement = () => {
		this.setState(
			{
				isChecked: !this.state.isChecked
			},
			() => {
				if (this.state.isChecked) {
					sxfburiedPointEvent('DC_chkBox');
				}
			}
		);
	};

	//	校验必填项 按钮是否可以点击
	validateFn = () => {
		const { isChecked } = this.state;
		const formData = this.props.form.getFieldsValue();
		if (formData.phoneValue && formData.smsCd && isChecked) {
			return true;
		}
		return false;
	};

	goHome = () => {
		const { queryData = {} } = this.state;
		if (queryData && queryData.wxTestFrom) {
			queryUsrSCOpenId({ $props: this.props })
				.then(() => {
					buriedPointEvent(login.goDownLoad);
					if (queryData.jumpUrl) {
						//如果登录页链接存在jumpUrl,则登录后直接跳转至目标页
						this.props.history.replace(queryData.jumpUrl);
					} else {
						this.showDownLoadModal();
					}
				})
				.catch(() => {
					buriedPointEvent(login.queryUsrSCOpenIdFail);
				});
		} else {
			buriedPointEvent(login.goHome);
			this.props.history.replace('/home/home');
		}
	};
	// 获取授信列表状态
	requestGetStatus = () => {
		this.goHome();
	};

	// 弹框里的倒计时
	startCountDown = () => {
		let times = this.state.times;
		this.clearCountDown();
		modalTimer = setInterval(() => {
			this.setState({
				times: times--
			});
			if (times <= -1) {
				this.clearCountDown();
				this.downloadApp();
			}
		}, 1000);
	};

	clearCountDown = () => {
		clearInterval(modalTimer);
	};

	// 下载app
	downloadApp = () => {
		buriedPointEvent(login.downloadModalBtnClick);
		this.closeDownLoadModal();
		const phoneType = getDeviceType();
		if (phoneType === 'IOS') {
			window.location.href = 'https://itunes.apple.com/cn/app/id1439290777?mt=8';
		} else {
			this.props.$fetch.get(`${download_queryDownloadUrl}/02`).then(
				(res) => {
					if (res.code === '000000') {
						Toast.info('安全下载中');
						window.location.href = res.data.downloadUrl;
					} else {
						res.message && Toast.info(res.message);
					}
				},
				(error) => {
					error.message && Toast.info(error.message);
				}
			);
		}
	};

	// 显示弹框
	showDownLoadModal = () => {
		buriedPointEvent(login.downloadModalShow);
		this.setState(
			{
				showDownloadModal: true
			},
			() => {
				this.startCountDown();
			}
		);
	};

	// 关闭弹框
	closeDownLoadModal = () => {
		this.setState(
			{
				showDownloadModal: false,
				times: 3
			},
			() => {
				this.clearCountDown();
			}
		);
	};

	render() {
		const {
			slideImageUrl,
			smallImageUrl,
			showSlideModal,
			yOffset,
			bigImageH,
			disabledInput,
			errMsg,
			showDownloadModal
		} = this.state;
		const { getFieldProps } = this.props.form;
		return (
			<div className={styles.dc_landing_page_wrap}>
				<div className={styles.dc_landing_page}>
					<div className={styles.img_wrap}>
						<img src={login_bg1} alt="" className={styles.login_bg1} />
						<img src={login_bg2} alt="" className={styles.login_bg2} />
						<img src={login_bg3} alt="" className={styles.login_bg3} />
						<img src={login_bg4} alt="" className={styles.login_bg4} />
					</div>
					<div className={styles.content}>
						<img src={hegui_bg} alt="" className={styles.hegui_bg} />
						<InputItem
							disabled={disabledInput}
							id="inputPhone"
							maxLength="11"
							type="number"
							className={styles.loginInput}
							placeholder="请输入您的手机号"
							{...getFieldProps('phoneValue', {
								onChange(value) {
									if (value === '') {
										sxfburiedPointEvent('inputPhone', {
											actId: 'delAll'
										});
									}
								},
								rules: [
									{ required: true, message: '请输入正确手机号' },
									{ validator: !disabledInput && this.validatePhone }
								]
							})}
							onBlur={() => {
								handleInputBlur();
							}}
							clear
							data-sxf-props={JSON.stringify({
								type: 'input',
								name: 'inputPhone',
								notSendValue: true, // 无需上报输入框的值
								eventList: [
									{
										type: 'focus'
									},
									{
										type: 'delete'
									},
									{
										type: 'blur'
									},
									{
										type: 'paste'
									}
								]
							})}
						/>

						<div className={styles.smsBox}>
							<InputItem
								id="inputCode"
								type="number"
								maxLength="6"
								className={[styles.loginInput, styles.smsCodeInput].join(' ')}
								placeholder="请输入短信验证码"
								{...getFieldProps('smsCd', {
									onChange(value) {
										if (value === '') {
											sxfburiedPointEvent('inputCode', {
												actId: 'delAll'
											});
										}
									},
									rules: [{ required: true, message: '请输入正确验证码' }]
								})}
								onBlur={() => {
									handleInputBlur();
								}}
								data-sxf-props={JSON.stringify({
									type: 'input',
									name: 'inputCode',
									eventList: [
										{
											type: 'focus'
										},
										{
											type: 'delete'
										},
										{
											type: 'blur'
										},
										{
											type: 'paste'
										}
									]
								})}
							/>
							<div
								className={
									this.state.timers.indexOf('s') > -1
										? `${styles.smsCode} ${styles.smsCode2}`
										: styles.smsCode
								}
								data-sxf-props={JSON.stringify({
									type: 'btn',
									name: 'clickCode',
									eventList: [
										{
											type: 'click'
										}
									]
								})}
								onClick={() => {
									this.handleSmsCodeClick();
								}}
							>
								{this.state.timers}
							</div>
						</div>
						{errMsg ? <p className={styles.errMsgBox}>{errMsg}</p> : null}
						<div className={styles.operateBox}>
							<div
								className={!this.validateFn() ? `${styles.sureBtn} ${styles.sureDisableBtn}` : styles.sureBtn}
								onClick={this.goLogin}
								data-sxf-props={JSON.stringify({
									type: 'btn',
									name: 'loginBtn',
									eventList: [
										{
											type: 'click'
										}
									]
								})}
							>
								<span>立即申请</span>
							</div>
						</div>
						<div className={styles.agreement}>
							<i
								className={this.state.isChecked ? styles.checked : `${styles.checked} ${styles.nochecked}`}
								onClick={this.checkAgreement}
							/>
							<div className={styles.agreementCont}>
								阅读并接受
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
						<p className={styles.bottom_tip}>温馨提示：如您是老用户，请前往还到app操作并还款</p>
					</div>
				</div>
				{showSlideModal && (
					<ImageCode
						imageUrl={slideImageUrl}
						smallImageUrl={smallImageUrl}
						yOffset={yOffset}
						bigImageH={bigImageH}
						onReload={this.handleTokenAndImage}
						onMoveEnd={(xOffset, cb) => {
							this.sendSlideVerifySmsCode(xOffset, cb);
						}}
						onClose={this.closeSlideModal}
					/>
				)}
				{showDownloadModal && (
					<Modal wrapClassName="loginModalBox" visible={true} transparent maskClosable={false}>
						<div className={styles.loginModalContainer}>
							{/* 大图 */}
							<img className={styles.loginModalBg} src={loginModalBg} alt="背景" />
							{/* 按钮 */}
							<img
								className={styles.loginModalBtn}
								src={loginModalBtn}
								onClick={() => {
									this.downloadApp();
								}}
								alt="按钮"
							/>
							{/* 关闭 */}
							<img
								className={styles.closeIcoStyle}
								src={closeIco}
								onClick={this.closeDownLoadModal}
								alt="关闭"
							/>
						</div>
					</Modal>
				)}
			</div>
		);
	}
}
