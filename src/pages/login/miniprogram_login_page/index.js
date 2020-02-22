/*
 * @Author: shawn
 * @LastEditTime : 2020-02-19 15:17:17
 */
import qs from 'qs';
import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { Toast, InputItem } from 'antd-mobile';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { getDeviceType, getFirstError, validators, handleInputBlur, queryUsrSCOpenId } from 'utils';
import { setH5Channel, getH5Channel } from 'utils/common';
import { buriedPointEvent, pageView } from 'utils/analytins';
import styles from './index.scss';
import bannerImg from './img/login_bg.png';
import { setBackGround } from 'utils/background';
import ImageCode from 'components/ImageCode';
import { miniprogram } from '../../../utils/analytinsType';
import CopyModal from 'components/CopyModal';
import { connect } from 'react-redux';
import { setUserInfoAction } from 'reduxes/actions/staticActions';
import { setIframeProtocolShow } from 'reduxes/actions/commonActions';
import { msg_slide, msg_sms, signup_sms } from 'fetch/api';
import { base64Encode } from 'utils/CommonUtil/toolUtil';
import { logoutClearData } from 'utils/CommonUtil/commonFunc';

let timmer;

@setBackGround('#fff')
@fetch.inject()
@createForm()
@connect(
	(state) => state,
	{ setUserInfoAction, setIframeProtocolShow }
)
export default class miniprogram_login_page extends PureComponent {
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
			mobilePhone: '',
			showDownloadModal: false,
			times: 3
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
		document.title = '还到';
		// 在清除session之前先获取，然后再存到session里，防止h5Channel在登录页丢失
		const storeH5Channel = getH5Channel();
		// 移除cookie
		logoutClearData();

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
		// address();
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
		const { queryData } = this.state;
		buriedPointEvent(miniprogram.loginBtnClick);
		const osType = getDeviceType();
		// 防止用户关闭弹框,继续点击进行登录
		if (store.getToken() || Cookie.get('FIN-HD-AUTH-TOKEN')) {
			this.setState(
				{
					showDownloadModal: true
				},
				() => {
					buriedPointEvent(miniprogram.copyModalShow);
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
				let param = {
					tokenId: this.state.relyToken, // 短信流水号
					osType: osType.toLowerCase(), // 操作系统
					loginType: '0',
					smsCode: values.smsCd,
					imei: '',
					mac: '',
					registrationId: '',
					userChannel: getH5Channel(), // 用户渠道
					location: (queryData && queryData.location) || '-1,-1' // 从小程序中传入
				};
				Toast.loading('加载中...', 10);
				this.props.$fetch.post(signup_sms, param).then(
					(res) => {
						if (res.code !== '000000') {
							res.message && Toast.info(res.message);
							return;
						}
						this.props.setUserInfoAction(res.data);
						Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.data.tokenId);
						// 小程序登录不触发通付盾
						queryUsrSCOpenId({ $props: this.props }).then(() => {
							this.setState(
								{
									showDownloadModal: true
								},
								() => {
									buriedPointEvent(miniprogram.copyModalShow);
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
			let mobilePhone = '';
			if (this.state.disabledInput) {
				mobilePhone = queryData.tokenId;
			} else {
				mobilePhone = base64Encode(this.state.mobilePhone);
			}
			Toast.loading('加载中...', 10);
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
				} else if (result.code === 'PTM3019') {
					// 弹窗不存在时请求大图
					!this.state.showSlideModal && this.handleTokenAndImage();
					cb && cb('error');
				} else if (result.code === 'PTM3020') {
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
		timmer = setInterval(() => {
			this.setState(
				{
					timers: this.state.countDownTime-- + '"'
				},
				() => {
					if (this.state.countDownTime === -1) {
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
		this.setState({
			isChecked: !this.state.isChecked
		});
	};

	// 关闭弹框
	closeModal = () => {
		this.setState({
			showDownloadModal: false
		});
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

	confirmHandler = () => {
		buriedPointEvent(miniprogram.copyModalBtnClick);
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
				<img className={styles.banner} src={bannerImg} alt="落地页banner" />
				<div className={styles.content}>
					<div className={styles.loginContentBox}>
						<p className={styles.title}>最高可借额度(元)</p>
						<p className={styles.moneyText}>50000</p>
						<InputItem
							disabled={disabledInput}
							id="inputPhone"
							maxLength="13"
							type="phone"
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
									this.state.timers.indexOf('"') > -1
										? `${styles.smsCode} ${styles.smsCode2}`
										: styles.smsCode
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
							onClick={this.goLogin}
							className={!this.validateFn() ? `${styles.sureBtn} ${styles.sureDisableBtn}` : styles.sureBtn}
						>
							<span>查看我的额度</span>
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
				<CopyModal
					visible={showDownloadModal}
					closeModal={this.closeModal}
					confirmAction={this.confirmHandler}
				/>
			</div>
		);
	}
}
