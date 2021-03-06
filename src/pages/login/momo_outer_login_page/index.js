/*
 * @Author: shawn
 * @LastEditTime: 2020-03-24 11:02:51
 */
import qs from 'qs';
import { address } from 'utils/Address';
import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { Toast, InputItem, Modal } from 'antd-mobile';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { logoutClearData } from 'utils/CommonUtil/commonFunc';
import {
	getDeviceType,
	getFirstError,
	validators,
	handleInputBlur,
	recordContract,
	queryUsrSCOpenId
} from 'utils';
import { getH5Channel } from 'utils/common';
import {
	buriedPointEvent,
	pageView,
	SxfDataRegisterEventSuperPropertiesOnce,
	sxfDataPv,
	sxfburiedPointEvent
} from 'utils/analytins';
import { daicao } from 'utils/analytinsType';
import styles from './index.scss';
import bannerImg from './img/login_bg.png';
import { setBackGround } from 'utils/background';
import ImageCode from 'components/ImageCode';
import loginModalBg from '../login_common_page/img/login_modal.png';
import loginModalBtn from '../login_common_page/img/login_modal_btn.png';
import closeIco from '../login_common_page/img/close_ico.png';
import linkConf from 'config/link.conf';
import { TFDLogin } from 'utils/getTongFuDun';
import { domListen } from 'utils/domListen';
import { connect } from 'react-redux';
import { setUserInfoAction } from 'reduxes/actions/staticActions';
import { setIframeProtocolShow } from 'reduxes/actions/commonActions';
import { msg_slide, msg_sms, signup_sms, download_queryDownloadUrl, index_queryPLPShowSts } from 'fetch/api';
import { base64Encode } from 'utils/CommonUtil/toolUtil';
import { ProtocolRead } from 'components';

import {
	dlinputPhoneRiskBury,
	dlinputCodeRiskBury,
	dl_chkBoxRiskBury,
	dlgoLoginRiskBury,
	dlsmsCodeBtnRiskBury
} from '../riskBuryConfig';
let timmer;

let entryPageTime = '';
let modalTimer = null;

@setBackGround('#fff')
@fetch.inject()
@createForm()
@domListen()
@connect(
	(state) => state,
	{ setUserInfoAction, setIframeProtocolShow }
)
export default class momo_outer_login_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			timers: '???????????????',
			countDownTime: 59,
			timeflag: true,
			smsJrnNo: '', // ???????????????
			disabledInput: false,
			queryData: {},
			isChecked: true, // ??????????????????
			inputFocus: false,
			imageCodeUrl: '', // ???????????????url
			showSlideModal: false,
			slideImageUrl: '',
			mobilePhone: '',
			times: 3, // ?????????????????????
			showDownloadModal: false
		};
	}

	componentWillMount() {
		sxfDataPv({ pId: 'dwdl' });
		sxfburiedPointEvent(dl_chkBoxRiskBury.key);
		const queryData = qs.parse(this.props.history.location.search, {
			ignoreQueryPrefix: true
		});
		this.setState({
			queryData
		});
		// ?????????????????????
		// window.history.pushState(null, null, document.URL);
		document.title = '??????';
		// ?????????session?????????????????????????????????session????????????h5Channel??????????????????
		logoutClearData();

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
	}
	componentDidMount() {
		let _this = this;
		let originClientHeight = document.documentElement.clientHeight;
		// ???????????????????????????resize?????????ios?????????
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
		let exitPageTime = new Date();
		let durationTime = (exitPageTime.getTime() - entryPageTime.getTime()) / 1000;
		buriedPointEvent(daicao.loginPageTime, {
			durationTime: durationTime
		});
	}

	// ???????????????
	validatePhone = (rule, value, callback) => {
		let v = value && value.replace(/\s*/g, '');
		if (!validators.phone(v)) {
			callback('????????????????????????');
		} else {
			callback();
		}
	};

	//???????????????
	goLogin = () => {
		sxfburiedPointEvent(dlgoLoginRiskBury.key);
		// ????????????????????????,????????????????????????
		if (store.getToken() || Cookie.get('FIN-HD-AUTH-TOKEN')) {
			this.setState(
				{
					showDownloadModal: true
				},
				() => {
					this.startCountDown();
				}
			);
			return;
		}
		const osType = getDeviceType();
		if (!this.state.smsJrnNo) {
			Toast.info('???????????????????????????');
			return;
		}
		if (!this.state.isChecked) {
			Toast.info('??????????????????');
			return;
		}
		this.props.form.validateFields((err, values) => {
			if (!err) {
				buriedPointEvent(daicao.loginBtn);
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
				this.props.$fetch.post(signup_sms, param).then(
					(res) => {
						Toast.hide();
						if (res.code !== '000000') {
							res.message && Toast.info(res.message);
							return;
						}
						this.props.setUserInfoAction(res.data);
						Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });
						// TODO: ????????????????????????token
						store.setToken(res.data.tokenId);
						// ????????????????????????????????? ????????????cookie ???session fin-v-card-toke
						TFDLogin();
						SxfDataRegisterEventSuperPropertiesOnce({ gps: store.getPosition() });
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
						queryUsrSCOpenId({ $props: this.props }).then(() => {
							this.setState(
								{
									showDownloadModal: true
								},
								() => {
									this.startCountDown();
								}
							);
						});
					},
					(error) => {
						error.message && Toast.info(error.message, 3);
					}
				);
			} else {
				Toast.info(getFirstError(err));
			}
		});
	};

	// ???????????????????????????????????????
	handleSmsCodeClick = () => {
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
				buriedPointEvent(daicao.smsCodeBtnClick);
				this.setState(
					{
						mobilePhone: values.phoneValue && values.phoneValue.replace(/\s*/g, '')
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
			let mobilePhone = '';
			if (this.state.disabledInput) {
				mobilePhone = queryData.tokenId;
			} else {
				mobilePhone = base64Encode(this.state.mobilePhone);
			}
			this.props.$fetch.get(`${msg_slide}/${mobilePhone}`).then((result) => {
				if (result.code === '000003') {
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
					Toast.info(result.message);
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

	startCountDownTime = () => {
		clearInterval(timmer);
		let { countDownTime } = this.state;
		timmer = setInterval(() => {
			this.setState(
				{
					timers: countDownTime-- + '"'
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

	// ????????????
	go = (item) => {
		store.setLoginBack(true);
		this.props.setIframeProtocolShow({
			url: item.url
		});
	};

	checkAgreement = () => {
		buriedPointEvent(daicao.selectProtocol);
		this.setState(
			{
				isChecked: !this.state.isChecked
			},
			() => {
				sxfburiedPointEvent(dl_chkBoxRiskBury.key);
			}
		);
	};

	// ??????app
	downloadApp = () => {
		this.closeModal();
		const phoneType = getDeviceType();
		if (phoneType === 'IOS') {
			window.location.href = linkConf.APPSTORE_URL;
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

	// ????????????
	closeModal = () => {
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
							maxLength="13"
							type="phone"
							data-sxf-props={JSON.stringify({
								type: 'input',
								name: dlinputPhoneRiskBury.key,
								actContain: dlinputPhoneRiskBury.actContain
							})}
							className={styles.loginInput}
							placeholder="????????????????????????"
							{...getFieldProps('phoneValue', {
								rules: [
									{ required: true, message: '????????????????????????' },
									{ validator: !disabledInput && this.validatePhone }
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
								data-sxf-props={JSON.stringify({
									type: 'input',
									name: dlinputCodeRiskBury.key,
									actContain: dlinputCodeRiskBury.actContain
								})}
								className={[styles.loginInput, styles.smsCodeInput].join(' ')}
								placeholder="????????????????????????"
								{...getFieldProps('smsCd', {
									rules: [{ required: true, message: '????????????????????????' }]
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
									sxfburiedPointEvent(dlsmsCodeBtnRiskBury.key);
									this.handleSmsCodeClick();
								}}
							>
								{this.state.timers}
								<i className={styles.leftBorder} />
							</div>
						</div>
						<div className={styles.sureBtn} onClick={this.goLogin}>
							<span>????????????</span>
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
							label: '?????????????????????',
							url: 'personal_credit_page'
						},
						{
							label: '??????????????????',
							url: 'register_agreement_page'
						},
						{
							label: '?????????????????????',
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
									buriedPointEvent(daicao.modalBtnClick);
									this.downloadApp();
								}}
								alt="??????"
							/>
							{/* ?????? */}
							<img className={styles.closeIcoStyle} src={closeIco} onClick={this.closeModal} alt="??????" />
						</div>
					</Modal>
				)}
			</div>
		);
	}
}
