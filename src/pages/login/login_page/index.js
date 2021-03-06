/*
 * @Author: shawn
 * @LastEditTime: 2020-04-28 10:31:32
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
import { setIframeProtocolShow } from 'reduxes/actions/commonActions';
import { base64Encode } from 'utils/CommonUtil/toolUtil';
import { msg_slide, msg_sms, signup_sms, download_queryDownloadUrl, index_queryPLPShowSts } from 'fetch/api';
import { getH5Channel } from 'utils/common';
import {
	buriedPointEvent,
	pageView,
	SxfDataRegisterEventSuperPropertiesOnce,
	sxfDataPv,
	sxfburiedPointEvent
} from 'utils/analytins';
import { login, wxTest, H5CHANNEL_TEST } from 'utils/analytinsType';
import { domListen } from 'utils/domListen';
import styles from './index.scss';
import ImageCode from 'components/ImageCode';
import { ProtocolRead } from 'components';
import { setBackGround } from 'utils/background';
import bannerImg from './img/login_bg.png';
import tooltip from './img/tooltip.png';
import loginModalBg from './img/login_modal.png';
import loginModalBtn from './img/login_modal_btn.png';
import closeIco from './img/close_ico.png';
import {
	clickCodeRiskBury,
	inputPhoneRiskBury,
	inputCodeRiskBury,
	loginBtnRiskBury,
	DC_chkBoxRiskBury
} from './riskBuryConfig';
let timmer;
let modalTimer = null;
let entryPageTime = '';

@fetch.inject()
@createForm()
@domListen()
@setBackGround('#fff')
@connect(
	(state) => state,
	{ setUserInfoAction, setIframeProtocolShow }
)
export default class login_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			timers: '???????????????',
			countDownTime: 59,
			timeflag: true,
			smsJrnNo: '', // ???????????????
			disabledInput: false,
			queryData: {},
			isChecked: false, // ??????????????????
			imageCodeUrl: '', // ???????????????url
			showSlideModal: false,
			slideImageUrl: '',
			mobilePhone: '',
			times: 3, // ?????????????????????
			showDownloadModal: false
		};
	}

	componentWillMount() {
		const queryData = qs.parse(this.props.history.location.search, {
			ignoreQueryPrefix: true
		});
		this.setState({
			queryData
		});
		// ?????????????????????
		window.history.pushState(null, null, document.URL);
		document.title = '???????????????';
		// ?????????session?????????????????????????????????session????????????h5Channel??????????????????

		let sxfDataLocal = localStorage.getItem('_bp_wqueue');
		let sxfData_20190815_sdk = localStorage.getItem('sxfData_20190815_sdk');
		let wenjuan = localStorage.getItem('wenjuan');
		buriedPointEvent(H5CHANNEL_TEST.loginWillS, {
			test_h5Channel: getH5Channel()
		});
		logoutClearData();

		// ?????????????????????

		wenjuan && localStorage.setItem('wenjuan', wenjuan);
		sxfDataLocal && localStorage.setItem('_bp_wqueue', sxfDataLocal);
		sxfData_20190815_sdk && localStorage.setItem('sxfData_20190815_sdk', sxfData_20190815_sdk);

		store.setHistoryRouter(window.location.pathname);

		this.props.form.getFieldProps('phoneValue');
		// mpos ??????????????????
		this.props.form.setFieldsValue({
			phoneValue: queryData && queryData.mblNoHid
		});
		if (queryData && queryData.mblNoHid) {
			this.setState({
				disabledInput: true
			});
		}
		sxfDataPv({ pId: 'dl' });
		sxfburiedPointEvent(DC_chkBoxRiskBury.key);
	}
	componentDidMount() {
		// ????????????
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

	// ???????????????
	validatePhone = (rule, value, callback) => {
		if (!validators.phone(value)) {
			callback('????????????????????????');
		} else {
			callback();
		}
	};
	goFLHome = () => {
		activeConfigSts({
			$props: this.props,
			type: 'A',
			callback: this.goHome
		});
	};

	//	??????????????? ????????????????????????
	validateFn = () => {
		const formData = this.props.form.getFieldsValue();
		if (formData.phoneValue && formData.smsCd) {
			return true;
		}
		return false;
	};

	//???????????????
	goLogin = () => {
		buriedPointEvent(H5CHANNEL_TEST.loginWillE, {
			test_h5Channel: getH5Channel()
		});
		const { queryData = {}, isChecked } = this.state;
		if (queryData && queryData.wxTestFrom) {
			buriedPointEvent(wxTest.wxTestLoginBtnClick, {
				entry: queryData.wxTestFrom
			});
		}
		if (!this.state.smsJrnNo) {
			Toast.info('???????????????????????????');
			return;
		}
		if (!isChecked) {
			Toast.info('?????????????????????????????????????????????????????????');
			return;
		}
		const osType = getDeviceType();

		this.props.form.validateFields((err, values) => {
			if (!err) {
				// ??????-???????????????????????????
				buriedPointEvent(login.submit);
				let param = {
					tokenId: this.state.relyToken, // ???????????????
					osType: osType.toLowerCase(), // ????????????
					loginType: '0',
					smsCode: values.smsCd,
					imei: '',
					mac: '',
					registrationId: '',
					userChannel: getH5Channel(), // ????????????
					location: store.getPosition() // ???????????? TODO ???session???
				};
				Toast.loading('?????????...', 10);
				this.props.$fetch
					.post(signup_sms, param, {
						'FIN-HD-WECHAT-TOKEN': Cookie.get('FIN-HD-WECHAT-TOKEN')
					})
					.then(
						(res) => {
							Toast.hide();
							if (res.code !== '000000') {
								Toast.info(res.message);
								buriedPointEvent(login.submitFail, {
									fail_cause: res.message
								});
								return;
							}
							this.props.setUserInfoAction(res.data);
							Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });
							// TODO: ????????????????????????token
							store.setToken(res.data.tokenId);
							// ????????????????????????????????? ????????????cookie ???session fin-v-card-toke
							TFDLogin();
							SxfDataRegisterEventSuperPropertiesOnce({ gps: store.getPosition() });
							// contractType ??????????????? 01????????????????????? 02????????????????????? 03?????????????????????,?????????????????????
							this.props.$fetch.get(index_queryPLPShowSts).then((res) => {
								if (res.code === '000000' && res.data && res.data.plpSts === '1') {
									recordContract({
										contractType: '01'
									});
								} else {
									recordContract({
										contractType: '01,02'
									});
								}
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
							error.message && Toast.info(error.message);
						}
					);
			} else {
				Toast.info(getFirstError(err));
			}
		});
	};
	// ???????????????
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
						this.setState({ timers: '????????????', timeflag: true, countDownTime: 59 });
					}
				}
			);
		}, 1000);
	};

	// ???????????????????????????????????????
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

	// ?????????????????????
	getSmsCode() {
		this.props.form.validateFields((err, values) => {
			if (err && err.smsCd) {
				delete err.smsCd;
			}
			if (!err || JSON.stringify(err) === '{}') {
				// ??????-????????????????????????
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
				Toast.info(getFirstError(err));
			}
		});
	}

	/**?????????????????? */
	// ?????????????????????token????????????
	handleTokenAndSms = () => {
		this.refreshSlideToken().then(() => {
			this.sendSlideVerifySmsCode();
		});
	};

	// ?????????????????????token???????????????
	handleTokenAndImage = () => {
		this.refreshSlideToken();
	};

	// ?????????????????????token
	refreshSlideToken = () => {
		return new Promise((resolve) => {
			const osType = getDeviceType();
			const { queryData } = this.state;
			Toast.loading('?????????...', 10);
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
						yOffset: result.data.sliderHeight, // ??????????????????????????????
						bigImageH: result.data.backHeight, // ??????????????????
						showSlideModal: true
					});
				} else {
					Toast.info(result.message);
				}
			});
		});
	};

	// ????????????(???????????????)
	sendSlideVerifySmsCode = (xOffset = '', cb) => {
		const data = {
			slideDistance: xOffset,
			tokenId: this.state.relyToken,
			type: '6'
		};
		this.props.$fetch
			.post(msg_sms, data)
			.then((result) => {
				if (result.code === '000000') {
					Toast.info('?????????????????????????????????');
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
					// ??????????????????????????????
					!this.state.showSlideModal && this.handleTokenAndImage();
					cb && cb('error');
				} else if (result.code === '000004') {
					//????????????relyToken
					this.handleTokenAndImage();
					cb && cb('refresh');
				} else {
					// ????????????????????????
					if (xOffset) {
						Toast.info(result.message);
					} else {
						Toast.info(result.message);
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
	/**?????????????????? */
	// ????????????
	go = (item) => {
		store.setLoginBack(true);
		this.props.setIframeProtocolShow({
			url: item.url
		});
	};

	checkAgreement = () => {
		this.setState(
			{
				isChecked: !this.state.isChecked
			},
			() => {
				if (this.state.isChecked) {
					sxfburiedPointEvent(DC_chkBoxRiskBury.key);
				}
			}
		);
	};

	goHome = () => {
		const { queryData = {} } = this.state;
		if (queryData && queryData.wxTestFrom) {
			queryUsrSCOpenId({ $props: this.props })
				.then(() => {
					buriedPointEvent(login.goDownLoad);
					if (queryData.jumpUrl) {
						//???????????????????????????jumpUrl,????????????????????????????????????
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

	// ?????????????????????
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

	// ??????app
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
						Toast.info('???????????????');
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

	// ????????????
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

	// ????????????
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
			showDownloadModal
		} = this.state;
		const { getFieldProps } = this.props.form;
		return (
			<div className={styles.dc_landing_page}>
				<img className={styles.banner} src={bannerImg} alt="?????????banner" />
				<div className={styles.content}>
					<div className={styles.loginContentBox}>
						<p className={styles.title}>??????????????????(???)</p>
						<p className={styles.moneyText}>50000</p>
						<InputItem
							disabled={disabledInput}
							id="inputPhone"
							maxLength="11"
							type="number"
							className={styles.loginInput}
							placeholder="????????????????????????"
							{...getFieldProps('phoneValue', {
								rules: [
									{ required: true, message: '????????????????????????' },
									{ validator: !disabledInput && this.validatePhone }
								]
							})}
							onBlur={() => {
								handleInputBlur();
							}}
							clear
							data-sxf-props={JSON.stringify({
								type: inputPhoneRiskBury.type,
								name: inputPhoneRiskBury.key,
								actContain: inputPhoneRiskBury.actContain
							})}
						/>

						<div className={styles.smsBox}>
							<InputItem
								id="inputCode"
								type="number"
								maxLength="6"
								className={[styles.loginInput, styles.smsCodeInput].join(' ')}
								placeholder="????????????????????????"
								{...getFieldProps('smsCd', {
									rules: [{ required: true, message: '????????????????????????' }]
								})}
								onBlur={() => {
									handleInputBlur();
								}}
								data-sxf-props={JSON.stringify({
									type: inputCodeRiskBury.type,
									name: inputCodeRiskBury.key,
									actContain: inputCodeRiskBury.actContain
								})}
							/>
							<div
								className={
									this.state.timers.indexOf('s') > -1
										? `${styles.smsCode} ${styles.smsCode2}`
										: styles.smsCode
								}
								data-sxf-props={JSON.stringify({
									type: clickCodeRiskBury.type,
									name: clickCodeRiskBury.key,
									actContain: clickCodeRiskBury.actContain
								})}
								onClick={() => {
									this.handleSmsCodeClick();
								}}
							>
								{this.state.timers}
								<i className={styles.leftBorder} />
							</div>
						</div>
						<div
							className={!this.validateFn() ? `${styles.sureBtn} ${styles.sureDisableBtn}` : styles.sureBtn}
							onClick={this.goLogin}
							data-sxf-props={JSON.stringify({
								type: loginBtnRiskBury.type,
								name: loginBtnRiskBury.key,
								actContain: loginBtnRiskBury.actContain
							})}
						>
							<span>??????????????????</span>
							<img className={styles.sureBtn_tooltip} src={tooltip} />
						</div>

						<i className={[styles.commonLine, styles.leftTopLine].join(' ')} />
						<i className={[styles.commonLine, styles.rightTopLine].join(' ')} />
						<i className={[styles.commonLine, styles.leftBottomLine].join(' ')} />
						<i className={[styles.commonLine, styles.rightBottomLine].join(' ')} />
					</div>
				</div>
				<ProtocolRead
					className={styles.agreement}
					tip="???????????????"
					isSelect={this.state.isChecked}
					protocolList={[
						{
							label: '?????????????????????????????????',
							url: 'register_agreement_page'
						},
						{
							label: '??????????????????????????????',
							url: 'user_privacy_page'
						}
					]}
					clickRadio={this.checkAgreement}
					clickProtocol={this.go}
					offsetH="0"
				/>
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
							{/* ?????? */}
							<img className={styles.loginModalBg} src={loginModalBg} alt="??????" />
							{/* ?????? */}
							<img
								className={styles.loginModalBtn}
								src={loginModalBtn}
								onClick={() => {
									this.downloadApp();
								}}
								alt="??????"
							/>
							{/* ?????? */}
							<img
								className={styles.closeIcoStyle}
								src={closeIco}
								onClick={this.closeDownLoadModal}
								alt="??????"
							/>
						</div>
					</Modal>
				)}
			</div>
		);
	}
}
