import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import { createForm } from 'rc-form';
import { List, InputItem } from 'antd-mobile';
import { store } from 'utils/store';
import ButtonCustom from 'components/ButtonCustom';
import CountDownButton from 'components/CountDownButton';
import { setBackGround } from 'utils/background';
import { validators, handleInputBlur, getFirstError } from 'utils';
import { getH5Channel } from 'utils/common';
import { buriedPointEvent } from 'utils/analytins';
import { mine } from 'utils/analytinsType';
import styles from './index.scss';
import qs from 'qs';

const API = {
	GETUSERINF: '/my/getRealInfo', // 获取用户信息
	GECARDINF: '/cmm/qrycardbin', // 绑定银行卡前,卡片信息查
	BINDCARD: '/withhold/card/bindConfirm', // 绑定银行卡
	GETCODE: '/withhold/card/bindApply', // 绑定银行卡短信验证码获取
	protocolSms: '/withhold/protocolSms', // 校验协议绑卡
	protocolBind: '/withhold/protocolBink', //协议绑卡接口
	contractInfo: '/withhold/protocolInfo' // 委托扣款协议数据查询
};

@fetch.inject()
@createForm()
@setBackGround('#fff')
export default class bind_save_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			userName: '', // 持卡人姓名
			enable: true, // 计时器是否可用
			cardData: {}, // 绑定的卡的数据
			isProtocolBindCard: false //是否走协议绑卡逻辑
		};
	}

	componentWillMount() {
		this.queryUserInf();
	}

	componentDidMount() {
		this.props.form.setFieldsValue({
			valueInputCarNumber: store.getBindCardNo(),
			valueInputCarPhone: store.getBindCardPhone()
		});
	}

	componentWillUnmount() {
		store.removeBackUrl(); // 清除session里的backurl的值
		//如果不是进入协议页面，清除反显数据
		if (this.props.history.location.pathname.indexOf('/protocol') < 0) {
			store.removeBindCardNo();
			store.removeBindCardPhone();
		}
	}
	// 获取信用卡信息
	queryUserInf = () => {
		this.props.$fetch.get(API.GETUSERINF).then(
			(result) => {
				if (result.data) {
					this.setState({ userName: result.data.usrNm });
				}
			},
			(error) => {
				error.msgInfo && this.props.toast.info(error.msgInfo);
			}
		);
	};

	// 校验储蓄卡卡号
	validateCarNumber = (rule, value, callback) => {
		if (!validators.bankCardNumber(value)) {
			callback('请输入有效银行卡号');
		} else {
			callback();
		}
	};
	// 校验手机号
	validateCarPhone = (rule, value, callback) => {
		if (!validators.phone(value)) {
			callback('请输入银行卡绑定的有效手机号');
		} else {
			callback();
		}
	};
	// 协议绑卡校验接口
	checkProtocolBindCard = (params, fn) => {
		const { valueInputCarNumber, valueInputCarPhone, cardTyp, bankCd, bankName } = params;
		this.props.$fetch
			.post(API.protocolSms, {
				cardNo: valueInputCarNumber,
				bnkMblNo: valueInputCarPhone,
				usrSignCnl: getH5Channel(),
				cardTyp,
				bankCd,
				bankName
			})
			.then((res) => {
				switch (res.msgCode) {
					case 'PTM0000':
						//协议绑卡校验成功提示（走协议绑卡逻辑）
						this.props.toast.info('发送成功，请注意查收！');
						this.setState({
							isProtocolBindCard: true
						});
						fn(true);
						break;
					case 'PTM9901':
						this.props.toast.info(res.data);
						break;
					case 'PBM1010':
						this.props.toast.info(res.msgInfo);
						break;
					default:
						// 修改数据解构
						const { valueInputCarNumber: cardNo, valueInputCarPhone: mblNo, cardTyp, bankCd } = params;
						this.getOldBindCardCode(
							{
								cardNo,
								mblNo,
								cardTyp,
								bankCd
							},
							fn
						);
						break;
				}
			});
	};
	//老的绑卡获取验证码
	getOldBindCardCode = (params, fn) => {
		const { cardNo, mblNo, cardTyp, bankCd } = params;
		this.props.$fetch
			.post(API.GETCODE, {
				cardNo, //持卡人卡号
				mblNo,
				cardTyp, //卡类型
				bankCd
			})
			.then(
				(result) => {
					if (result.msgCode !== 'PTM0000') {
						this.props.toast.info(result.msgInfo);
					} else {
						this.props.toast.info('发送成功，请注意查收！');
						fn && fn(true);
					}
				},
				(error) => {
					error.retMsg && this.props.toast.info(error.retMsg);
				}
			);
	};

	//存储现金分期卡信息
	storeCashFenQiCardData = (cardDatas) => {
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		const cashFenQiCardArr = store.getCashFenQiCardArr()
		//现金分期收、还款银行卡信息
		if (queryData.cardType === 'resave') {
			cashFenQiCardArr[0] = cardDatas;
		} else if (queryData.cardType === 'pay') {
			cashFenQiCardArr[1] = cardDatas;
		}
		store.setCashFenQiCardArr(cashFenQiCardArr);
	};

	// 协议绑卡(新的绑卡流程)
	doProtocolBindCard = (params) => {
		this.props.$fetch
			.post(API.protocolBind, {
				cardNo: params.cardNo,
				smsCd: params.smsCd
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					//协议绑卡成功
					const backUrlData = store.getBackUrl();
					if (backUrlData) {
						let cardDatas = { agrNo: res.data.agrNo, ...this.state.cardData };
						// 首页不需要存储银行卡的情况，防止弹窗出现
						const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
						if (queryData && queryData.noBankInfo) {
							store.removeCardData();
						} else {
							this.storeCashFenQiCardData(cardDatas);
							store.setCardData(cardDatas);
						}
						store.removeBackUrl();
						// 如果是从四项认证进入，绑卡成功则回到首页
						if (store.getCheckCardRouter() === 'checkCardRouter') {
							this.props.history.push('/home/home');
						} else {
							this.props.history.goBack();
						}
					} else {
						this.props.history.goBack();
					}
				} else if (res.msgCode === 'PTM9901') {
					this.props.toast.info(res.data);
					this.setState({ valueInputCarSms: '' });
				} else {
					this.props.toast.info('请重新输入验证码');
					this.setState({ valueInputCarSms: '' });
					//静默重新获取老的验证码(走老的代扣逻辑,此时不需要验证码倒计时)
					this.getOldBindCardCode(params);
				}
			});
	};
	// 绑卡之前进行校验
	checkCard = (values) => {
		this.props.$fetch.post(API.GECARDINF, { cardNo: values.valueInputCarNumber }).then(
			(result) => {
				if (result.msgCode === 'PTM0000' && result.data && result.data.bankCd && result.data.cardTyp !== 'C') {
					this.setState({
						cardData: {
							cardNo: values.valueInputCarNumber,
							lastCardNo: values.valueInputCarNumber.slice(-4),
							...result.data
						}
					});
					const params = {
						bankCd: result.data.bankCd, //银行代号
						cardTyp: 'D', //卡类型(借记卡)
						cardNo: values.valueInputCarNumber, //持卡人卡号
						mblNo: values.valueInputCarPhone, //预留手机号
						smsCd: values.valueInputCarSms //短信验证码
					};
					// 判断用户是否为协议绑卡
					this.state.isProtocolBindCard ? this.doProtocolBindCard(params) : this.bindSaveCard(params);
				} else {
					this.props.toast.info('请输入有效银行卡号');
					buriedPointEvent(mine.saveConfirm, {
						entry: store.getBackUrl() ? '绑定储蓄卡' : '储蓄卡管理',
						is_success: false,
						fail_cause: result.msgInfo
					});
				}
			},
			(error) => {
				error.msgInfo && this.props.toast.info(error.msgInfo);
			}
		);
	};

	// 绑定储蓄卡（老的绑卡流程）
	bindSaveCard = (params) => {
		this.props.$fetch.post(API.BINDCARD, params).then((data) => {
			if (
				data.msgCode === 'PTM0000' ||
				(store.getBackUrl() && data.msgCode === 'PTM0010') ||
				(store.getBackUrl() && data.msgCode === 'PBM1010')
			) {
				buriedPointEvent(mine.saveConfirm, {
					entry: store.getBackUrl() ? '绑定储蓄卡' : '储蓄卡管理',
					is_success: true
				});
				const backUrlData = store.getBackUrl();
				if (backUrlData) {
					let cardDatas = { agrNo: data.data.agrNo, ...this.state.cardData };
					// 首页不需要存储银行卡的情况，防止弹窗出现
					const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
					if (queryData && queryData.noBankInfo) {
						store.removeCardData();
					} else {
						this.storeCashFenQiCardData(cardDatas);
						store.setCardData(cardDatas);
					}
					store.removeBackUrl();
					// this.props.history.replace(backUrlData);
					// 如果是从四项认证进入，绑卡成功则回到首页
					if (store.getCheckCardRouter() === 'checkCardRouter') {
						this.props.history.push('/home/home');
					} else {
						this.props.history.goBack();
					}
				} else {
					this.props.history.goBack();
				}
			} else {
				buriedPointEvent(mine.saveConfirm, {
					entry: store.getBackUrl() ? '绑定储蓄卡' : '储蓄卡管理',
					is_success: false,
					fail_cause: data.msgInfo
				});
				this.props.toast.info(data.msgInfo);
				this.setState({ valueInputCarSms: '' });
			}
		});
	};

	// 确认绑卡
	confirmBindCard = () => {
		this.props.form.validateFields((err, values) => {
			if (!err) {
				this.checkCard(values);
			} else {
				if (!this.jsonIsNull(values)) {
					buriedPointEvent(mine.saveConfirm, {
						entry: store.getBackUrl() ? '绑定储蓄卡' : '储蓄卡管理',
						is_success: false,
						fail_cause: getFirstError(err)
					});
				}
				// 如果存在错误，获取第一个字段的第一个错误进行提示
				this.props.toast.info(getFirstError(err));
			}
		});
	};
	// 判断json里的每一项是否为空
	jsonIsNull = (values) => {
		for (let val in values) {
			if (values[val] === undefined || values[val] === '') {
				return true;
			}
		}
		return false;
	};
	// 点击开始倒计时
	countDownHandler = (fn) => {
		const formData = this.props.form.getFieldsValue();
		if (!validators.bankCardNumber(formData.valueInputCarNumber)) {
			this.props.toast.info('请输入有效银行卡号');
			return;
		}
		if (!validators.phone(formData.valueInputCarPhone)) {
			this.props.toast.info('请输入银行卡绑定的有效手机号');
			return;
		}
		//获取卡号对应的银行代号
		this.props.$fetch.post(API.GECARDINF, { cardNo: formData.valueInputCarNumber }).then((result) => {
			if (result.msgCode === 'PTM0000' && result.data && result.data.bankCd && result.data.cardTyp !== 'C') {
				const params = { ...formData, ...result.data };
				this.checkProtocolBindCard(params, fn);
			} else {
				this.props.toast.info('请输入有效银行卡号');
			}
		});
	};

	// 跳转到支持的银行
	supporBank = () => {
		this.props.history.push('/mine/support_save_page');
	};

	// 跳转委托扣款协议
	readContract = () => {
		const formData = this.props.form.getFieldsValue();
		const params = {
			cardNo: formData.valueInputCarNumber,
			isEntry: '01'
		};
		this.props.$fetch.post(API.contractInfo, params).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				store.setProtocolFinancialData(result.data);
				this.props.history.push('/protocol/delegation_withhold_page');
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};

	render() {
		const Item = List.Item;
		const { getFieldProps } = this.props.form;
		return (
			<div>
				<div className={styles.header}>请先绑定还款储蓄卡,再签约借款</div>
				<div className="bind_save_page_listBox">
					<Item extra={this.state.userName}>持卡人</Item>
					<InputItem
						maxLength="24"
						{...getFieldProps('valueInputCarNumber', {
							initialValue: this.state.bindCardNo,
							rules: [ { required: true, message: '请输入有效银行卡号' }, { validator: this.validateCarNumber } ],
							onChange: (value) => {
								store.setBindCardNo(value);
							}
						})}
						type="number"
						placeholder="请输入储蓄卡卡号"
						onBlur={() => {
							handleInputBlur();
						}}
					>
						储蓄卡卡号
					</InputItem>
					<div className={styles.top20}>
						<InputItem
							maxLength="11"
							type="number"
							{...getFieldProps('valueInputCarPhone', {
								initialValue: this.state.bindCardPhone,
								rules: [
									{ required: true, message: '请输入银行卡绑定的有效手机号' },
									{ validator: this.validateCarPhone }
								],
								onChange: (value) => {
									store.setBindCardPhone(value);
								}
							})}
							placeholder="银行卡预留手机号"
							onBlur={() => {
								handleInputBlur();
							}}
						>
							手机号
						</InputItem>
						<div className={[ styles.time_container, 'sms' ].join(' ')}>
							<InputItem
								maxLength="6"
								{...getFieldProps('valueInputCarSms', {
									rules: [ { required: true, message: '请输入验证码' } ]
								})}
								onBlur={() => {
									handleInputBlur();
								}}
							>
								验证码
							</InputItem>
							<div className={styles.count_btn}>
								<CountDownButton
									className={styles.CountDownButton}
									enable={this.state.enable}
									onClick={this.countDownHandler}
									timerActiveTitle={[ '', '"' ]}
								/>
							</div>
						</div>
					</div>
				</div>
				<span className={styles.support_type} onClick={this.supporBank}>
					支持绑定卡的银行
				</span>
				<ButtonCustom onClick={this.confirmBindCard} className={styles.confirm_btn}>
					确认
				</ButtonCustom>
				<div className={styles.xieyi}>
					{' '}
					确认即代表同意
					<a
						onClick={() => {
							this.readContract('delegation_withhold_page');
						}}
						className={styles.link}
					>
						《用户授权扣款委托书》
					</a>
				</div>
			</div>
		);
	}
}
