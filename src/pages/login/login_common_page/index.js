/*
 * @Author: shawn
 * @LastEditTime: 2020-03-26 14:37:10
 */
import qs from 'qs';
import { address } from 'utils/Address';
import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { Toast, InputItem, Modal } from 'antd-mobile';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { domListen } from 'utils/domListen';
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
import defaultBannerImg from './img/login_bg.png';
import loginModalBg from './img/login_modal.png';
import loginModalBtn from './img/login_modal_btn.png';
import closeIco from './img/close_ico.png';
import { setBackGround } from 'utils/background';
import ImageCode from 'components/ImageCode';
import listPNG from './img/list.png';
import yuanPNG from './img/yuan.png';
import { TFDLogin } from 'utils/getTongFuDun';
import {
	dlinputPhoneRiskBury,
	dlinputCodeRiskBury,
	dl_chkBoxRiskBury,
	dlgoLoginRiskBury,
	dlsmsCodeBtnRiskBury
} from '../riskBuryConfig';
import { connect } from 'react-redux';
import { setUserInfoAction } from 'reduxes/actions/staticActions';
import { setIframeProtocolShow } from 'reduxes/actions/commonActions';
import { msg_slide, msg_sms, signup_sms, download_queryDownloadUrl, index_queryPLPShowSts } from 'fetch/api';
import { base64Encode } from 'utils/CommonUtil/toolUtil';
import { ProtocolRead } from 'components';

let timmer;

let modalTimer = null;

let entryPageTime = '';

@setBackGround('#fff')
@fetch.inject()
@createForm()
@domListen()
@connect(
	(state) => state,
	{ setUserInfoAction, setIframeProtocolShow }
)
export default class login_common_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			timers: '???????????????',
			countDownTime: 59,
			timeflag: true,
			smsJrnNo: '', // ???????????????
			disabledInput: false,
			queryData: {},
			isChecked: props.isChecked, // ??????????????????
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
		document.title = '?????????????????????????????????????????????';
		// ?????????session?????????????????????????????????session????????????h5Channel??????????????????
		// ??????cookie
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
		console.log('11111111111111');
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
		this.clearCountDown();
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

	prePressTime = 0;
	//???????????????
	goLogin = () => {
		sxfburiedPointEvent(dlgoLoginRiskBury.key);
		const osType = getDeviceType();
		const nowTime = Date.now();
		if (nowTime - this.prePressTime > 1600 || !this.prePressTime) {
			this.prePressTime = nowTime;
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
		}
	};

	// ???????????????????????????????????????
	handleSmsCodeClick = () => {
		sxfburiedPointEvent(dlsmsCodeBtnRiskBury.key);
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
			Toast.loading('?????????...', 10);
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
				} else if (result.code === '000006') {
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
		/* eslint-disable */
		const { bannerImg } = this.props;
		const {
			slideImageUrl,
			smallImageUrl,
			showSlideModal,
			yOffset,
			bigImageH,
			disabledInput,
			times,
			isChecked,
			showDownloadModal,
			smsCOde,
			mobilePhone
		} = this.state;
		const { getFieldProps } = this.props.form;
		const loginBgImg = bannerImg ? bannerImg : defaultBannerImg;
		const isTrue = isChecked;
		return (
			<div className={styles.dc_landing_page}>
				<img className={styles.banner} src={loginBgImg} alt="?????????banner" />
				<div className={styles.content}>
					<img className={styles.yuanPNG} src={yuanPNG} />
					<div className={styles.loginContentBox}>
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
									this.handleSmsCodeClick();
								}}
							>
								{this.state.timers}
							</div>
						</div>
						<div
							className={isTrue ? [styles.sureBtn].join(' ') : [styles.sureBtn, styles.dis].join(' ')}
							onClick={this.goLogin}
						>
							<span>????????????</span>
						</div>
					</div>
					<img className={styles.listPNG} src={listPNG} />
				</div>

        <ProtocolRead
          tip="???????????????"
          isSelect={isChecked}
          offsetH="0.58rem"
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
        />

				<div className={styles.footer_copyright}>
					<p>???????????????,???????????????;?????????????????????????????????,????????????,????????????</p>
					<p> ????????????????????????????????????????????????????????????</p>
					<p>Copyright ??2019 All Rights Reserved</p>
					<p>??????????????????????????????????????????????????? ???ICP???14062512???-1</p>
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
