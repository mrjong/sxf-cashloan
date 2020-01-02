/*
 * @Author: shawn
 * @LastEditTime : 2020-01-02 16:39:39
 */
import qs from 'qs';
import { address } from 'utils/Address';

import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { Toast, InputItem } from 'antd-mobile';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import {
	getDeviceType,
	getFirstError,
	validators,
	handleInputBlur,
	queryUsrSCOpenId,
	recordContract
} from 'utils';
import { setH5Channel, getH5Channel } from 'utils/common';
import {
	buriedPointEvent,
	pageView,
	sxfDataPv,
	sxfburiedPointEvent,
	SxfDataRegisterEventSuperPropertiesOnce
} from 'utils/analytins';
import { daicao } from 'utils/analytinsType';
import styles from './index.scss';
import bannerImg from './img/login_bg.png';
import { setBackGround } from 'utils/background';
import ImageCode from 'components/ImageCode';
import { TFDLogin } from 'utils/getTongFuDun';
import { domListen } from 'utils/domListen';

let timmer;
const API = {
	smsForLogin: '/signup/smsForLogin',
	sendsms: '/cmm/sendsms',
	imageCode: '/signup/sendImg',
	createImg: '/cmm/createImg', // 获取滑动大图
	getRelyToken: '/cmm/getRelyToken', //图片token获取
	sendImgSms: '/cmm/sendImgSms' //新的验证码获取接口
};

let entryPageTime = '';

@setBackGround('#fff')
@fetch.inject()
@createForm()
@domListen()
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
			isChecked: true, // 是否勾选协议
			inputFocus: false,
			imageCodeUrl: '', // 图片验证码url
			showSlideModal: false,
			slideImageUrl: '',
			mobilePhone: ''
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
		document.title = '还到';
		// 在清除session之前先获取，然后再存到session里，防止h5Channel在登录页丢失
		const storeH5Channel = getH5Channel();
		// 移除cookie
		Cookie.remove('fin-v-card-token');

		let MessageTagError = store.getMessageTagError();
		let MessageTagStep = store.getMessageTagStep();
		let sxfDataLocal = localStorage.getItem('_bp_wqueue');
		let sxfData_20190815_sdk = localStorage.getItem('sxfData_20190815_sdk');
		sessionStorage.clear();
		localStorage.clear();
		// 首页弹窗要用的
		MessageTagError && store.setMessageTagError(MessageTagError);
		MessageTagStep && store.setMessageTagStep(MessageTagStep);
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
			this.getImage();
		}
		sxfDataPv({ pId: 'dwdl' });
		sxfburiedPointEvent('dl_chkBox');
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
		sxfburiedPointEvent('dlgoLogin');
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
				buriedPointEvent(daicao.loginBtn);
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
						// 登录之后手动触发通付盾 需要保存cookie 和session fin-v-card-toke
						TFDLogin();
						SxfDataRegisterEventSuperPropertiesOnce({ gps: store.getPosition() });
						recordContract({
							contractType: '01,02'
						});
						queryUsrSCOpenId({ $props: this.props }).then(() => {
							this.props.history.replace('/others/download_page');
						});
					},
					(error) => {
						error.msgInfo &&
							Toast.info(error.msgInfo, 3, () => {
								this.state.disabledInput && this.getImage();
							});
					}
				);
			} else {
				Toast.info(getFirstError(err));
			}
		});
	};

	// 处理获取验证码按钮点击事件
	handleSmsCodeClick = () => {
		sxfburiedPointEvent('dlsmsCodeBtn');
		if (!this.state.timeflag) return;
		this.getSmsCode();
	};

	// 获得手机验证码
	getSmsCode() {
		const { queryData } = this.state;
		const osType = getDeviceType();
		this.props.form.validateFields((err, values) => {
			if (err && err.smsCd) {
				delete err.smsCd;
			}
			if (!err || JSON.stringify(err) === '{}') {
				let param = {};
				if (this.state.disabledInput) {
					param = {
						type: '6',
						authToken: queryData && queryData.tokenId,
						osType,
						imgCode: values.imgCd
					};
					this.sendSmsCode(param);
				} else {
					this.setState(
						{
							mobilePhone: values.phoneValue && values.phoneValue.replace(/\s*/g, '')
						},
						() => {
							this.handleTokenAndSms();
						}
					);
				}
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
		this.refreshSlideToken().then(() => {
			this.reloadSlideImage();
		});
	};

	// 刷新滑动验证码token
	refreshSlideToken = () => {
		return new Promise((resolve) => {
			const osType = getDeviceType();
			this.props.$fetch.post(API.getRelyToken, { mblNo: this.state.mobilePhone }).then((result) => {
				if (result.msgCode === 'PTM0000') {
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
					Toast.info(result.msgInfo);
				}
			});
		});
	};

	// 获取短信(滑动验证码)
	sendSlideVerifySmsCode = (xOffset = '', cb) => {
		let data = Object.assign({}, this.state.submitData, { bFlag: xOffset });
		this.props.$fetch
			.post(API.sendImgSms, data)
			.then((result) => {
				if (result.msgCode === 'PTM0000') {
					Toast.info('发送成功，请注意查收！');
					this.setState({
						timeflag: false,
						smsJrnNo: result.data.smsJrnNo
					});
					cb && cb('success');
					setTimeout(() => {
						this.closeSlideModal();
					}, 1500);

					this.startCountDownTime();
				} else if (result.msgCode === 'PTM3019') {
					// 弹窗不存在时请求大图
					!this.state.showSlideModal && this.reloadSlideImage();
					cb && cb('error');
				} else if (result.msgCode === 'PTM3020') {
					//重新刷新relyToken
					this.handleTokenAndImage();
					cb && cb('refresh');
				} else {
					// 达到短信次数限制
					Toast.info(result.msgInfo);
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
		this.props.$fetch.get(`${API.createImg}/${this.state.mobilePhone}`).then((res) => {
			if (res && res.msgCode === 'PTM0000') {
				this.setState({
					slideImageUrl: res.data.ossImgBig ? res.data.ossImgBig : `data:image/png;base64,${res.data.b}`,
					smallImageUrl: res.data.ossImgSm ? res.data.ossImgSm : `data:image/png;base64,${res.data.s}`,
					yOffset: res.data.sy, // 小图距离大图顶部距离
					bigImageH: res.data.bh, // 大图实际高度
					showSlideModal: true
				});
			} else {
				Toast.info(res.msgInfo);
			}
		});
	};

	showSlideModal = () => {
		this.setState({ showSlideModal: true });
	};

	closeSlideModal = () => {
		this.setState({ showSlideModal: false });
	};

	// 老的获取短信验证码(mpos)
	sendSmsCode = (param) => {
		this.props.$fetch.post(API.sendsms, param).then((result) => {
			if (result.msgCode === 'PTM0000') {
				Toast.info('发送成功，请注意查收！');
				this.setState({ timeflag: false, smsJrnNo: result.data.smsJrnNo });
				this.startCountDownTime();
			} else {
				Toast.info(result.msgInfo, 3, () => {
					this.getImage();
				});
			}
		});
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
		this.props.history.push(`/protocol/${url}`);
	};

	checkAgreement = () => {
		this.setState(
			{
				isChecked: !this.state.isChecked
			},
			() => {
				if (this.state.isChecked) {
					sxfburiedPointEvent('dl_chkBox');
				}
			}
		);
	};

	//获取图片验证码
	getImage = () => {
		this.props.$fetch.get(API.imageCode).then((res) => {
			if (res && res.msgCode === 'PTM0000') {
				this.setState({
					imageCodeUrl: res.image
				});
				store.setNoLoginToken(res.tokenId);
			} else {
				Toast.info(res.msgInfo);
			}
		});
	};

	render() {
		const {
			imageCodeUrl,
			slideImageUrl,
			smallImageUrl,
			showSlideModal,
			yOffset,
			bigImageH,
			disabledInput
		} = this.state;
		const { getFieldProps } = this.props.form;
		return (
			<div className={styles.dc_landing_page}>
				<img className={styles.banner} src={bannerImg} alt="落地页banner" />
				<div className={styles.content}>
					<div className={styles.loginContentBox}>
						<p className={styles.title}>最高可借额度(元)</p>
						<p className={styles.moneyText}>50000</p>
						<InputItem
							disabled={disabledInput}
							id="inputPhone"
							data-sxf-props={JSON.stringify({
								type: 'input',
								name: 'dlinputPhone',
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
							maxLength="13"
							type="phone"
							className={styles.loginInput}
							placeholder="请输入您的手机号"
							{...getFieldProps('phoneValue', {
								onChange(value) {
									if (value === '') {
										sxfburiedPointEvent('dlinputPhone', {
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
								this.setState({
									inputFocus: false
								});
								handleInputBlur();
							}}
						/>
						{disabledInput && (
							<div className={styles.smsBox}>
								<InputItem
									id="imgCode"
									maxLength="4"
									className={[styles.loginInput, styles.smsCodeInput].join(' ')}
									placeholder="请输入图形验证码"
									{...getFieldProps('imgCd', {
										rules: [{ required: true, message: '请输入正确图形验证码' }]
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
										this.getImage();
									}}
								>
									<div className={styles.getCodeBox}>
										<img className={styles.getCode} src={imageCodeUrl} />
									</div>
								</div>
							</div>
						)}

						<div className={styles.smsBox}>
							<InputItem
								id="inputCode"
								type="number"
								maxLength="6"
								data-sxf-props={JSON.stringify({
									type: 'input',
									name: 'dlinputCode',
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
								className={[styles.loginInput, styles.smsCodeInput].join(' ')}
								placeholder="请输入短信验证码"
								{...getFieldProps('smsCd', {
									onChange(value) {
										if (value === '') {
											sxfburiedPointEvent('dlinputCode', {
												actId: 'delAll'
											});
										}
									},
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
							《用户隐私权政策》
						</span>
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
			</div>
		);
	}
}
