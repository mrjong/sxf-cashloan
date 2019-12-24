/*
 * @Author: shawn
 * @LastEditTime : 2019-12-24 13:53:52
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
import { setH5Channel, getH5Channel } from 'utils/common';
import { buriedPointEvent, pageView, sxfDataLogin } from 'utils/analytins';
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

let timmer;
const API = {
	smsForLogin: '/passport/loginBySms',
	createImg: '/passport/createImg', // 获取滑动大图
	getRelyToken: '/passport/getRelyToken', //图片token获取
	sendImgSms: '/passport/sendImgSms', //新的验证码获取接口
	DOWNLOADURL: '/download/getDownloadUrl'
};

let entryPageTime = '';
let modalTimer = null;

@setBackGround('#fff')
@fetch.inject()
@createForm()
export default class momo_outer_login_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			timers: '获取验证码',
			countDownTime: 59,
			timeflag: true,
			smsJrnNo: '', // 短信流水号
			queryData: {},
			isChecked: true, // 是否勾选协议
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
		const queryData = qs.parse(this.props.history.location.search, {
			ignoreQueryPrefix: true
		});
		this.setState({
			queryData
		});
		// 登录页单独处理
		// window.history.pushState(null, null, document.URL);
		document.title = '还到';
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
		const { queryData } = this.state;
		// 防止用户关闭弹框,继续点击进行登录
		if (store.getToken() || Cookie.get('fin-v-card-token')) {
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
					location: store.getPosition(), // 定位地址 TODO 从session取
					mblNo: values.phoneValue && values.phoneValue.replace(/\s*/g, ''), // 手机号
					userContract: { contractType: '01,02' },
					queryUsrSCOpenId: true,
					sourceData: window.location.href,
					sourceId: queryData.clickid || ''
				};
				this.props.$fetch.post(API.smsForLogin, param).then(
					(res) => {
						if (res.code !== '0000') {
							res.message && Toast.info(res.message);
							return;
						}
						Cookie.set('fin-v-card-token', res.data.tokenId, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.data.tokenId);
						// 登录之后手动触发通付盾 需要保存cookie 和session fin-v-card-toke
						TFDLogin();
						// 神策用户绑定
						if (!store.getQueryUsrSCOpenId() && res.data.openId) {
							window.sa.login(res.data.openId);
							sxfDataLogin(res.data.openId);
							store.setQueryUsrSCOpenId(res.data.openId);
						}
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

	// 处理获取验证码按钮点击事件
	handleSmsCodeClick = () => {
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
		this.refreshSlideToken().then(() => {
			this.reloadSlideImage();
		});
	};

	// 刷新滑动验证码token
	refreshSlideToken = () => {
		return new Promise((resolve) => {
			const osType = getDeviceType();
			this.props.$fetch.post(API.getRelyToken, { mblNo: this.state.mobilePhone }).then((result) => {
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

	// 获取短信(滑动验证码)
	sendSlideVerifySmsCode = (xOffset = '', cb) => {
		let data = Object.assign({}, this.state.submitData, { bFlag: xOffset });
		this.props.$fetch
			.post(API.sendImgSms, data)
			.then((result) => {
				if (result.code === '0000') {
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
				} else if (result.code === '3019') {
					// 弹窗不存在时请求大图
					!this.state.showSlideModal && this.reloadSlideImage();
					cb && cb('error');
				} else if (result.code === '3020') {
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

	reloadSlideImage = () => {
		this.props.$fetch.get(`${API.createImg}/${this.state.mobilePhone}`).then((res) => {
			if (res && res.code === '0000') {
				this.setState({
					slideImageUrl: res.data.ossImgBig ? res.data.ossImgBig : `data:image/png;base64,${res.data.b}`,
					smallImageUrl: res.data.ossImgSm ? res.data.ossImgSm : `data:image/png;base64,${res.data.s}`,
					yOffset: res.data.sy, // 小图距离大图顶部距离
					bigImageH: res.data.bh, // 大图实际高度
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
		buriedPointEvent(daicao.selectProtocol);
		this.setState({
			isChecked: !this.state.isChecked
		});
	};

	// 下载app
	downloadApp = () => {
		this.closeModal();
		const phoneType = getDeviceType();
		if (phoneType === 'IOS') {
			window.location.href = linkConf.APPSTORE_URL;
		} else {
			this.props.$fetch.get(API.DOWNLOADURL).then(
				(res) => {
					if (res.code === '0000') {
						Toast.info('安全下载中');
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

	//	校验必填项 按钮是否可以点击
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
				<img className={styles.banner} src={bannerImg} alt="落地页banner" />
				<div className={styles.content}>
					<div className={styles.loginContentBox}>
						<p className={styles.title}>最高可借额度(元)</p>
						<p className={styles.moneyTextStyle}>
							¥<span className={styles.moneyText}>50000</span>
						</p>
						<p className={styles.tipsStyle}>欠多少还多少，有账单就能借</p>
						<InputItem
							id="inputPhone"
							maxLength="13"
							type="phone"
							className={styles.loginInput}
							placeholder="请输入常用手机号"
							{...getFieldProps('phoneValue', {
								rules: [{ required: true, message: '请输入正确手机号' }, { validator: this.validatePhone }]
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
								placeholder="请输入验证码"
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
								<i className={styles.leftBorder} />
							</div>
						</div>
						<div
							className={!this.validateFn() ? `${styles.sureBtn} ${styles.sureDisableBtn}` : styles.sureBtn}
							onClick={this.goLogin}
						>
							<span>去还信用卡</span>
						</div>
						<i className={[styles.commonLine, styles.leftTopLine].join(' ')} />
						<i className={[styles.commonLine, styles.rightTopLine].join(' ')} />
						<i className={[styles.commonLine, styles.leftBottomLine].join(' ')} />
						<i className={[styles.commonLine, styles.rightBottomLine].join(' ')} />
					</div>
				</div>
				<ul className={styles.featureContainer}>
					<li>
						<img className={styles.featureImg} src={feature_img1} alt="特征" />
						<p className={styles.featureTit}>简单</p>
						<p className={styles.featureDesc}>
							仅需身份证
							<br />
							信用卡
						</p>
					</li>
					<li>
						<img className={styles.featureImg} src={feature_img2} alt="特征" />
						<p className={styles.featureTit}>快捷</p>
						<p className={styles.featureDesc}>
							直接还到信用卡
							<br />
							秒到账
						</p>
					</li>
					<li>
						<img className={styles.featureImg} src={feature_img3} alt="特征" />
						<p className={styles.featureTit}>省心</p>
						<p className={styles.featureDesc}>
							持牌金融机构
							<br />
							专业代偿
						</p>
					</li>
				</ul>
				<div className={styles.agreement}>
					<i
						className={this.state.isChecked ? styles.checked : [styles.checked, styles.nochecked].join(' ')}
						onClick={this.checkAgreement}
					/>
					<div className={styles.agreementCont}>
						阅读并接受
						<span
							onClick={() => {
								this.go('personal_credit_page');
							}}
						>
							《信用风险告知书》
						</span>
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
				<p className={styles.tipsText}>贷款有风险，借款需谨慎；请根据个人能力合理贷款，理性消费，避免逾期</p>
				<p className={styles.tipsText}>贷款额度、放款时间以实际审核批准结果为准</p>
				<p className={styles.tipsText}>Copyright &copy;2019 All Rights Reserved</p>
				<p className={styles.tipsText}>随行付（北京）金融信息服务有限公司 京ICP备14062512号-1</p>
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
									buriedPointEvent(daicao.modalBtnClick);
									this.downloadApp();
								}}
								alt="按钮"
							/>
							{/* 关闭 */}
							<img className={styles.closeIcoStyle} src={closeIco} onClick={this.closeModal} alt="关闭" />
						</div>
					</Modal>
				)}
			</div>
		);
	}
}
