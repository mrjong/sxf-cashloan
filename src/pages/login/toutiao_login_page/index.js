/*
 * @Author: shawn
 * @LastEditTime: 2020-03-24 10:54:37
 */
import qs from 'qs';
import { address } from 'utils/Address';

import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { Toast, InputItem, Modal } from 'antd-mobile';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { getDeviceType, getFirstError, validators, handleInputBlur } from 'utils';
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
import loginModalBg from './img/login_modal.png';
import loginModalBtn from './img/login_modal_btn.png';
import feature_img1 from './img/feature_img1.png';
import feature_img2 from './img/feature_img2.png';
import feature_img3 from './img/feature_img3.png';
import closeIco from '../login_common_page/img/close_ico.png';
import linkConf from 'config/link.conf';
import { TFDLogin } from 'utils/getTongFuDun';
import { logoutClearData } from 'utils/CommonUtil/commonFunc';
import { connect } from 'react-redux';
import { setUserInfoAction } from 'reduxes/actions/staticActions';
import { setIframeProtocolShow } from 'reduxes/actions/commonActions';
import { ProtocolRead } from 'components';

import {
	passport_loginBySms,
	passport_createImg,
	passport_getRelyToken,
	passport_sendImgSms,
	download_getDownloadUrl
} from 'fetch/api';

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
		const { queryData } = this.state;
		sxfburiedPointEvent(dlgoLoginRiskBury.key);
		// const { queryData } = this.state;
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
					smsJrnNo: this.state.smsJrnNo, // ???????????????
					osType, // ????????????
					smsCd: values.smsCd,
					usrCnl: getH5Channel(), // ????????????
					location: store.getPosition(), // ???????????? TODO ???session???
					mblNo: values.phoneValue && values.phoneValue.replace(/\s*/g, ''), // ?????????
					userContract: { contractType: '01,02' },
					queryUsrSCOpenId: true,
					sourceData: window.location.href,
					sourceId: queryData.clickid || ''
				};
				Toast.loading('?????????...', 10);
				this.props.$fetch.post(passport_loginBySms, param).then(
					(res) => {
						Toast.hide();
						if (res.code !== '0000') {
							res.message && Toast.info(res.message);
							return;
						}
						this.props.setUserInfoAction(res.data);
						Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });
						// TODO: ????????????????????????token
						store.setToken(res.data.tokenId);
						SxfDataRegisterEventSuperPropertiesOnce({ gps: store.getPosition() });
						// ????????????????????????????????? ????????????cookie ???session fin-v-card-toke
						TFDLogin();
						this.setState(
							{
								showDownloadModal: true
							},
							() => {
								this.startCountDown();
							}
						);
					},
					(error) => {
						error.message && Toast.info(error.message);
					}
				);
			} else {
				Toast.info(getFirstError(err));
			}
		});
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
		this.refreshSlideToken().then(() => {
			this.reloadSlideImage();
		});
	};

	// ?????????????????????token
	refreshSlideToken = () => {
		return new Promise((resolve) => {
			const osType = getDeviceType();
			this.props.$fetch.post(passport_getRelyToken, { mblNo: this.state.mobilePhone }).then((result) => {
				if (result.code === '0000') {
					this.setState({
						submitData: {
							relyToken: result.data.relyToken,
							mblNo: this.state.mobilePhone,
							osType,
							bFlag: '',
							type: '6'
						}
					});
					resolve();
				} else {
					Toast.info(result.message);
				}
			});
		});
	};

	// ????????????(???????????????)
	sendSlideVerifySmsCode = (xOffset = '', cb) => {
		let data = Object.assign({}, this.state.submitData, { bFlag: xOffset });
		this.props.$fetch
			.post(passport_sendImgSms, data)
			.then((result) => {
				if (result.code === '0000') {
					Toast.info('?????????????????????????????????');
					this.setState({
						timeflag: false,
						smsJrnNo: result.data.smsJrnNo
					});
					cb && cb('success');
					setTimeout(() => {
						this.closeSlideModal();
					}, 1500);

					this.startCountDownTime();
				} else if (result.code === '3019') {
					// ??????????????????????????????
					!this.state.showSlideModal && this.reloadSlideImage();
					cb && cb('error');
				} else if (result.code === '3020') {
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

	reloadSlideImage = () => {
		this.props.$fetch.get(`${passport_createImg}/${this.state.mobilePhone}`).then((res) => {
			if (res && res.code === '0000') {
				this.setState({
					slideImageUrl: res.data.ossImgBig ? res.data.ossImgBig : `data:image/png;base64,${res.data.b}`,
					smallImageUrl: res.data.ossImgSm ? res.data.ossImgSm : `data:image/png;base64,${res.data.s}`,
					yOffset: res.data.sy, // ??????????????????????????????
					bigImageH: res.data.bh, // ??????????????????
					showSlideModal: true
				});
			} else {
				Toast.info(res.message);
			}
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
			this.props.$fetch.get(download_getDownloadUrl).then(
				(res) => {
					if (res.code === '0000') {
						Toast.info('???????????????');
						window.location.href = res.data.downUrl;
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

	//	??????????????? ????????????????????????
	validateFn = () => {
		const { isChecked } = this.state;
		const formData = this.props.form.getFieldsValue();
		if (formData.phoneValue && formData.smsCd && isChecked) {
			return true;
		}
		return false;
	};

	render() {
		const {
			slideImageUrl,
			smallImageUrl,
			showSlideModal,
			yOffset,
			bigImageH,
			showDownloadModal
		} = this.state;
		const { getFieldProps } = this.props.form;
		return (
			<div className={styles.dc_landing_page}>
				<img className={styles.banner} src={bannerImg} alt="?????????banner" />
				<div className={styles.content}>
					<div className={styles.loginContentBox}>
						<p className={styles.title}>??????????????????(???)</p>
						<p className={styles.moneyTextStyle}>
							??<span className={styles.moneyText}>50000</span>
						</p>
						{/* <p className={styles.tipsStyle}>???????????????????????????????????????</p> */}
						<InputItem
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
								rules: [{ required: true, message: '????????????????????????' }, { validator: this.validatePhone }]
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
								data-sxf-props={JSON.stringify({
									type: 'input',
									name: dlinputCodeRiskBury.key,
									actContain: dlinputCodeRiskBury.actContain
								})}
								maxLength="6"
								className={[styles.loginInput, styles.smsCodeInput].join(' ')}
								placeholder="??????????????????"
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
								<i className={styles.leftBorder} />
							</div>
						</div>
						<div
							className={!this.validateFn() ? `${styles.sureBtn} ${styles.sureDisableBtn}` : styles.sureBtn}
							onClick={this.goLogin}
						>
							<span>????????????</span>
						</div>
						<i className={[styles.commonLine, styles.leftTopLine].join(' ')} />
						<i className={[styles.commonLine, styles.rightTopLine].join(' ')} />
						<i className={[styles.commonLine, styles.leftBottomLine].join(' ')} />
						<i className={[styles.commonLine, styles.rightBottomLine].join(' ')} />
					</div>
				</div>
				<ul className={styles.featureContainer}>
					<li>
						<img className={styles.featureImg} src={feature_img1} alt="??????" />
						<p className={styles.featureTit}>??????</p>
						<p className={styles.featureDesc}>
							????????????
							<br />
							????????????
						</p>
					</li>
					<li>
						<img className={styles.featureImg} src={feature_img2} alt="??????" />
						<p className={styles.featureTit}>??????</p>
						<p className={styles.featureDesc}>
							??????5????????????
							<br />
							????????????12???
						</p>
					</li>
					<li>
						<img className={styles.featureImg} src={feature_img3} alt="??????" />
						<p className={styles.featureTit}>??????</p>
						<p className={styles.featureDesc}>
							??????????????????
							<br />
							?????????
						</p>
					</li>
				</ul>

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

				<p className={styles.tipsText}>???????????????????????????????????????????????????????????????????????????????????????????????????</p>
				<p className={styles.tipsText}>????????????????????????????????????????????????????????????</p>
				<p className={styles.tipsText}>Copyright &copy;2019 All Rights Reserved</p>
				<p className={styles.tipsText}>??????????????????????????????????????????????????? ???ICP???14062512???-1</p>
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
