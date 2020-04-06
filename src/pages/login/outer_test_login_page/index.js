/*
 * @Author: shawn
 * @LastEditTime: 2020-03-24 10:52:09
 */
import qs from 'qs';
import { address } from 'utils/Address';
import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { Toast, InputItem, Modal } from 'antd-mobile';
import ImageCode from 'components/ImageCode';
import { ButtonCustom, CheckRadio } from 'components';
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
import { setBackGround } from 'utils/background';
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
import styles from './index.scss';
import logo from './img/logo.png';
import top_money from './img/top_money.png';
import top_title from './img/top_title.png';
import box_01 from './img/box_01.png';
import box_02 from './img/box_02.png';
import box_03 from './img/box_03.png';
import sub_title from './img/sub_title.png';
import step_01 from './img/step_01.png';
import step_02 from './img/step_02.png';
import step_03 from './img/step_03.png';
import arrow from './img/arrow.png';

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
			timers: '获取验证码',
			countDownTime: 59,
			timeflag: true,
			smsJrnNo: '', // 短信流水号
			disabledInput: false,
			queryData: {},
			isChecked: false, // 是否勾选协议
			inputFocus: false,
			imageCodeUrl: '', // 图片验证码url
			showSlideModal: false,
			slideImageUrl: '',
			mobilePhone: '',
			times: 3, // 弹框里的倒计时
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
		document.title = '携手权威征信机构，让信用有价值';
		// 在清除session之前先获取，然后再存到session里，防止h5Channel在登录页丢失
		// 移除cookie
		logoutClearData();

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

	// 校验手机号
	validatePhone = (rule, value, callback) => {
		let v = value && value.replace(/\s*/g, '');
		if (!validators.phone(v)) {
			callback('请输入正确手机号');
		} else {
			callback();
		}
	};

	prePressTime = 0;
	//去登陆按钮
	goLogin = () => {
		sxfburiedPointEvent(dlgoLoginRiskBury.key);
		const osType = getDeviceType();
		const nowTime = Date.now();
		if (nowTime - this.prePressTime > 1600 || !this.prePressTime) {
			this.prePressTime = nowTime;
			// 防止用户关闭弹框,继续点击进行登录
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
				Toast.info('请先获取短信验证码');
				return;
			}
			if (!this.state.isChecked) {
				Toast.info('请先勾选协议');
				return;
			}
			this.props.form.validateFields((err, values) => {
				if (!err) {
					buriedPointEvent(daicao.loginBtn);
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
							Toast.hide();
							if (res.code !== '000000') {
								res.message && Toast.info(res.message);
								return;
							}
							this.props.setUserInfoAction(res.data);
							Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });
							// TODO: 根据设备类型存储token
							store.setToken(res.data.tokenId);
							// 登录之后手动触发通付盾 需要保存cookie 和session fin-v-card-toke
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

	// 处理获取验证码按钮点击事件
	handleSmsCodeClick = () => {
		sxfburiedPointEvent(dlsmsCodeBtnRiskBury.key);
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
				} else if (result.code === '000006') {
					//重新刷新relyToken
					this.handleTokenAndImage();
					cb && cb('refresh');
				} else {
					// 达到短信次数限制
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
						this.setState({ timers: '重新获取', timeflag: true, countDownTime: 59 });
					}
				}
			);
		}, 1000);
	};

	// 跳转协议
	go = (url) => {
		store.setLoginBack(true);
		this.props.setIframeProtocolShow({
			url
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

	// 下载app
	downloadApp = () => {
		this.closeModal();
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

	// 关闭弹框
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
			<div className={styles.page_container}>
				<div className={styles.top_container}>
					<div className={styles.top_carousel}></div>
					<img src={logo} alt="logo" className={styles.top_logo} />
					<img src={top_title} alt="top_title" className={styles.top_title} />
					<img src={top_money} alt="top_money" className={styles.top_money} />
				</div>
				<div className={styles.content}>
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
						placeholder="请输入您的手机号"
						{...getFieldProps('phoneValue', {
							rules: [
								{ required: true, message: '请输入正确手机号' },
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
								this.handleSmsCodeClick();
							}}
						>
							{this.state.timers}
						</div>
					</div>
					<ButtonCustom
						onClick={this.goLogin}
						// loading={!totalAmt || disabled}
						className={true ? [styles.sureBtn].join(' ') : [styles.sureBtn, styles.dis].join(' ')}
					>
						立即申请
					</ButtonCustom>
					<div className={styles.agreement_container}>
						<CheckRadio isSelect={true} />
						{/* <i
						className={this.state.isChecked ? styles.checked : [styles.checked, styles.nochecked].join(' ')}
						onClick={this.checkAgreement}
					/> */}
						<div>
							阅读并接受
							<span
								className={styles.agreement_link}
								onClick={() => {
									this.go('personal_credit_page');
								}}
							>
								《信用风险告知书》
							</span>
							<span
								className={styles.agreement_link}
								onClick={() => {
									this.go('register_agreement_page');
								}}
							>
								《用户注册协议》
							</span>
							<span
								className={styles.agreement_link}
								onClick={() => {
									this.go('privacy_agreement_page');
								}}
							>
								《用户隐私权政策》
							</span>
						</div>
					</div>
				</div>

				<div className={styles.box_container}>
					<img src={box_01} alt="box_01" className={styles.box_img} />
					<img src={box_02} alt="box_02" className={styles.box_img} />
					<img src={box_03} alt="box_03" className={styles.box_img} />
				</div>

				<img src={sub_title} alt="sub_title" className={styles.sub_title} />

				<div className={styles.step_container}>
					<div className={styles.step_item}>
						<img src={step_01} alt="step_01" className={styles.step_img} />
						<span>下载APP</span>
					</div>
					<img src={arrow} alt="arrow" className={styles.arrow} />
					<div className={styles.step_item}>
						<img src={step_02} alt="step_02" className={styles.step_img} />
						<span>绑定信用卡</span>
					</div>
					<img src={arrow} alt="arrow" className={styles.arrow} />
					<div className={styles.step_item}>
						<img src={step_03} alt="step_03" className={styles.step_img} />
						<span>获得额度</span>
					</div>
				</div>

				<div className={styles.footer_copyright}>
					<p>客服电话：400-088-7626</p>
					<p>随行付（北京）金融信息服务有限公司</p>
					<p>Copyright ©2020 All Rights Reserved</p>
					<p>京ICP备14062512号-1</p>
					<p style={{ marginTop: '.38rem' }}>贷款有风险,借款需谨慎</p>
					<p>请根据个人能力合理贷款,理性消费,避免逾期</p>
					<p> 贷款额度、放款时间以实际审核批准结果为准</p>
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
							{/* <img className={styles.loginModalBg} src={loginModalBg} alt="背景" /> */}
							{/* 按钮 */}
							{/* <img
								className={styles.loginModalBtn}
								src={loginModalBtn}
								onClick={() => {
									buriedPointEvent(daicao.modalBtnClick);
									this.downloadApp();
								}}
								alt="按钮"
							/> */}
							{/* 关闭 */}
							{/* <img className={styles.closeIcoStyle} src={closeIco} onClick={this.closeModal} alt="关闭" /> */}
						</div>
					</Modal>
				)}
			</div>
		);
	}
}
