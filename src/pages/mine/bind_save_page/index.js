/*
 * @Author: shawn
 * @LastEditTime : 2020-02-08 13:50:14
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import { createForm } from 'rc-form';
import { List, InputItem } from 'antd-mobile';
import { store } from 'utils/store';
import { ButtonCustom, SelectList, CountDownButton } from 'components';
import { setBackGround } from 'utils/background';
import { validators, handleInputBlur, getFirstError } from 'utils';
import { getH5Channel } from 'utils/common';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { mine } from 'utils/analytinsType';
import styles from './index.scss';
import qs from 'qs';
import { domListen } from 'utils/domListen';
import {
	bank_card_bin,
	bank_card_protocol_sms,
	bank_card_protocol_bind,
	bank_card_protocol_info
} from 'fetch/api.js';
import { connect } from 'react-redux';
import {
	setWithholdCardDataAction,
	setWithdrawCardDataAction,
	setBindDepositInfoAction
} from 'reduxes/actions/commonActions';
import { base64Encode } from 'utils/CommonUtil/toolUtil';

@fetch.inject()
@createForm()
@setBackGround('#fff')
@domListen()
@connect(
	(state) => ({
		cardType: state.commonState.cardType,
		userInfo: state.staticState.userInfo,
		nextStepStatus: state.commonState.nextStepStatus,
		backRouter: state.commonState.backRouter,
		bindDepositInfo: state.commonState.bindDepositInfo
	}),
	{
		setWithholdCardDataAction,
		setWithdrawCardDataAction,
		setBindDepositInfoAction
	}
)
export default class bind_save_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			enable: true, // 计时器是否可用
			cardData: {}, // 绑定的卡的数据
			isProtocolBindCard: false, //是否走协议绑卡逻辑
			bankType: '' // 发卡行
		};
	}

	componentWillMount() {}

	componentDidMount() {
		const { bindDepositInfo } = this.props;
		this.props.form.setFieldsValue({
			valueInputCarNumber: (bindDepositInfo && bindDepositInfo.cardNo) || '',
			valueInputCarPhone: (bindDepositInfo && bindDepositInfo.cardPhone) || ''
		});
		this.setState({
			bankType: (bindDepositInfo && bindDepositInfo.bankName) || ''
		});
	}

	componentWillUnmount() {
		if (
			location.pathname !== '/mine/support_save_page' &&
			location.pathname !== '/protocol/delegation_withhold_page'
		) {
			store.removeBackUrl(); // 清除session里的backurl的值
			this.props.setBindDepositInfoAction({});
			// store.removeBindCardNo();
			// store.removeBindCardPhone();
			// store.removeDepositBankName();
		}
	}

	// 校验储蓄卡卡号
	validateCarNumber = (rule, value, callback) => {
		if (!value || !validators.number(value.replace(/\s*/g, ''))) {
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
		const { valueInputCarNumber, valueInputCarPhone, bankCode } = params;

		const sendParams = {
			cardNoCpt: base64Encode(valueInputCarNumber),
			bnkTelNoCpt: base64Encode(valueInputCarPhone),
			bankCode,
			channelFlag: '1', // 0 可以重复 1 不可以重复
			supportType: '',
			merType: '', // * 优先绑定标识 * 标识该次绑卡是否要求优先绑定某类型卡, * JR随行付金融 XD随行付小贷 ZY中元保险  其他情况:无优先级
			usrSignCnl: getH5Channel()
		};
		this.props.$fetch
			.post(bank_card_protocol_sms, sendParams)
			.then((res) => {
				this.props.toast.hide();
				switch (res.code) {
					case '000000':
						//协议绑卡校验成功提示（走协议绑卡逻辑）
						this.props.toast.info('发送成功，请注意查收！');
						this.setState({
							isProtocolBindCard: true
						});
						fn(true);
						break;
					case '0000010':
						this.props.toast.info(res.message);
						buriedPointEvent(mine.protocolSmsFail, { reason: `${res.code}-${res.message}` });
						break;
					case '999999': {
						// let err = res.data ? `绑定失败：${res.data}` : '绑定失败，请重试';
						this.props.toast.info(res.message);
						buriedPointEvent(mine.protocolSmsFail, { reason: `${res.code}-${res.message}` });
						break;
					}
					case '999973':
					case '999968':
						this.props.toast.info(res.message);
						buriedPointEvent(mine.protocolSmsFail, { reason: `${res.code}-${res.message}` });
						break;
					default:
						// this.props.toast.info('暂不支持该银行卡，请换卡重试');
						this.props.toast.info(res.message);
						buriedPointEvent(mine.protocolSmsFail, { reason: `${res.code}-${res.message}` });
						break;
				}
			})
			.catch(() => {
				this.props.toast.hide();
				fn(false);
			});
	};

	//存储现金分期卡信息
	storeCashFenQiCardData = (cardDatas) => {
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		const cashFenQiCardArr = store.getCashFenQiCardArr();
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
		this.props.$fetch.get(`${bank_card_protocol_bind}/${params.smsCd}`).then((res) => {
			if (res.code === '000000') {
				this.props.toast.hide();
				const { cardType, backRouter } = this.props;
				buriedPointEvent(mine.protocolBindFail, {
					is_success: true,
					reason: `${res.code}-${res.message}`
				});
				//协议绑卡成功
				if (cardType) {
					let cardDatas = { agrNo: res.data.agrNo, ...this.state.cardData };
					// 存储到redux中
					if (cardType === 'withhold') {
						// 将还款银行卡数据存储到redux中
						this.props.setWithholdCardDataAction(cardDatas);
					} else if (cardType === 'withdraw') {
						this.props.setWithdrawCardDataAction(cardDatas);
					}
				}
				// 由于入口很多,所以只判断从个人中心进入的为储蓄卡管理,其他的为绑定储蓄卡
				buriedPointEvent(mine.saveConfirm, {
					entry: backRouter === 'Mine' ? '储蓄卡管理' : '绑定储蓄卡',
					is_success: true
				});
				this.props.history.goBack();
			} else if (res.code === '0000010') {
				this.props.toast.info(res.message);
				// this.setState({ valueInputCarSms: '' });
				this.props.form.setFieldsValue({
					valueInputCarSms: ''
				});
				buriedPointEvent(mine.protocolBindFail, {
					is_success: false,
					reason: `${res.code}-${res.message}`
				});
			} else if (res.code === '999999') {
				let err = res.data ? `绑定失败：${res.data}` : '绑定失败，请重试';
				this.props.toast.info(err);
				buriedPointEvent(mine.protocolBindFail, {
					is_success: false,
					reason: `${res.code}-${res.message}`
				});
			} else {
				this.props.toast.info(res.message);
				buriedPointEvent(mine.protocolBindFail, {
					is_success: false,
					reason: `${res.code}-${res.message}`
				});
			}
		});
	};
	// 绑卡之前进行校验
	checkCard = (values) => {
		this.props.toast.loading('加载中...', 10);
		const factCardNo = values.valueInputCarNumber.replace(/\s*/g, '');
		this.props.$fetch.post(bank_card_bin, { cardNoCpt: base64Encode(factCardNo) }).then(
			(result) => {
				if (result.code === '000000' && result.data && result.data.bankCode && result.data.cardType !== 'C') {
					this.setState({
						cardData: {
							cardNo: factCardNo,
							lastCardNo: factCardNo.slice(-4),
							...result.data
						}
					});
					const params = {
						bankCode: result.data.bankCode, //银行代号
						cardType: 'D', //卡类型(借记卡)
						cardNo: factCardNo, //持卡人卡号
						mblNo: values.valueInputCarPhone, //预留手机号
						smsCd: values.valueInputCarSms //短信验证码
					};
					this.doProtocolBindCard(params);
					// 判断用户是否为协议绑卡
					// this.state.isProtocolBindCard ? this.doProtocolBindCard(params) : this.bindSaveCard(params);
				} else {
					this.props.toast.info('请输入有效银行卡号');
					buriedPointEvent(mine.saveConfirm, {
						entry: this.props.backRouter === 'Mine' ? '储蓄卡管理' : '绑定储蓄卡',
						is_success: false,
						fail_cause: result.message
					});
				}
			},
			(error) => {
				error.message && this.props.toast.info(error.message);
			}
		);
	};

	// 确认绑卡
	confirmBindCard = () => {
		const { backRouter } = this.props;
		// if (!this.validateFn()) return;
		this.props.form.validateFields((err, values) => {
			if (!err) {
				this.checkCard(values);
			} else {
				if (!this.jsonIsNull(values)) {
					buriedPointEvent(mine.saveConfirm, {
						entry: backRouter === 'Mine' ? '储蓄卡管理' : '绑定储蓄卡',
						is_success: false,
						fail_cause: getFirstError(err)
					});
				}
				// 如果存在错误，获取第一个字段的第一个错误进行提示
				this.props.toast.info(getFirstError(err));
			}
		});
	};

	//	校验必填项
	validateFn = () => {
		const { bankType } = this.state;
		const formData = this.props.form.getFieldsValue();
		if (
			bankType &&
			formData.valueInputCarNumber &&
			formData.valueInputCarPhone &&
			formData.valueInputCarSms
		) {
			return true;
		}
		return false;
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
		formData.valueInputCarNumber =
			formData.valueInputCarNumber && formData.valueInputCarNumber.replace(/\s*/g, '');
		if (!formData.valueInputCarNumber || !validators.number(formData.valueInputCarNumber)) {
			this.props.toast.info('请输入有效银行卡号');
			return;
		}
		if (!validators.phone(formData.valueInputCarPhone)) {
			this.props.toast.info('请输入银行卡绑定的有效手机号');
			return;
		}
		if (!this.state.bankType) {
			this.props.toast.info('请选择发卡行');
			return;
		}
		this.props.toast.loading('加载中...', 10);
		//获取卡号对应的银行代号
		this.props.$fetch
			.post(bank_card_bin, { cardNoCpt: base64Encode(formData.valueInputCarNumber) })
			.then((result) => {
				if (result.code === '000000' && result.data && result.data.bankCode && result.data.cardType !== 'C') {
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
			cardNo: formData.valueInputCarNumber && base64Encode(formData.valueInputCarNumber.replace(/\s*/g, ''))
		};
		this.props.$fetch.post(bank_card_protocol_info, params).then((result) => {
			if (result && result.code === '000000' && result.data !== null) {
				// store.setProtocolFinancialData(result.data);
				this.props.history.push({
					pathname: '/protocol/delegation_withhold_page',
					state: {
						contractInf: result.data
					}
				});
			} else {
				this.props.toast.info(result.message);
			}
		});
	};

	render() {
		const Item = List.Item;
		const { getFieldProps } = this.props.form;
		const { userInfo = {}, bindDepositInfo = {} } = this.props;
		return (
			<div>
				<div className={styles.header}>请先绑定还款储蓄卡,再签约借款</div>
				<div className="bind_save_page_listBox list-extra">
					<Item extra={userInfo && userInfo.nameHid}>持卡人</Item>
					<Item
						extra={<SelectList selectText={this.state.bankType} defaultText={'请选择发卡银行'} />}
						onClick={() => {
							this.props.history.push('/mine/support_save_page?isClick=0');
						}}
					>
						发卡行
					</Item>
					<InputItem
						data-sxf-props={JSON.stringify({
							type: 'input',
							notSendValue: true, // 无需上报输入框的值
							name: 'valueInputCarNumber',
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
						maxLength="29"
						{...getFieldProps('valueInputCarNumber', {
							initialValue: this.state.bindCardNo,
							rules: [
								{ required: true, message: '请输入有效银行卡号' },
								{ validator: this.validateCarNumber }
							],
							onChange: (value) => {
								if (!value) {
									sxfburiedPointEvent('valueInputCarNumber', {
										actId: 'delAll'
									});
								}
								// store.setBindCardNo(value);
								this.props.setBindDepositInfoAction({
									...bindDepositInfo,
									cardNo: value
								});
							}
						})}
						clear
						type="bankCard"
						placeholder="请输入储蓄卡卡号"
						onBlur={() => {
							handleInputBlur();
						}}
					>
						储蓄卡卡号
					</InputItem>
					<InputItem
						maxLength="11"
						type="number"
						data-sxf-props={JSON.stringify({
							type: 'input',
							notSendValue: true, // 无需上报输入框的值
							name: 'valueInputCarPhone',
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
						{...getFieldProps('valueInputCarPhone', {
							initialValue: this.state.bindCardPhone,
							rules: [
								{ required: true, message: '请输入银行卡绑定的有效手机号' },
								{ validator: this.validateCarPhone }
							],
							onChange: (value) => {
								if (!value) {
									sxfburiedPointEvent('valueInputCarPhone', {
										actId: 'delAll'
									});
								}
								// store.setBindCardPhone(value);
								this.props.setBindDepositInfoAction({
									...bindDepositInfo,
									cardPhone: value
								});
							}
						})}
						clear
						placeholder="银行卡预留手机号"
						onBlur={() => {
							handleInputBlur();
						}}
					>
						手机号
					</InputItem>
					<div className={[styles.time_container, 'sms'].join(' ')}>
						<InputItem
							data-sxf-props={JSON.stringify({
								type: 'input',
								name: 'valueInputCarSms',
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
							maxLength="6"
							{...getFieldProps('valueInputCarSms', {
								rules: [{ required: true, message: '请输入验证码' }],
								onChange: (value) => {
									if (!value) {
										sxfburiedPointEvent('valueInputCarSms', {
											actId: 'delAll'
										});
									}
								}
							})}
							onBlur={() => {
								handleInputBlur();
							}}
							clear
						>
							验证码
						</InputItem>
						<div className={styles.count_btn}>
							<CountDownButton
								className={styles.CountDownButton}
								enable={this.state.enable}
								onClick={this.countDownHandler}
								timerActiveTitle={['', '"']}
							/>
						</div>
					</div>
				</div>
				<span className={styles.support_type} onClick={this.supporBank}>
					支持绑定卡的银行
				</span>
				<div className={styles.confirm_btn_box}>
					<ButtonCustom
						onClick={this.confirmBindCard}
						className={[styles.confirm_btn, this.validateFn() ? '' : styles.confirm_disable_btn].join(' ')}
					>
						确认
					</ButtonCustom>
				</div>
				<div className={styles.xieyi}>
					{' '}
					请阅读协议内容，点击确认即视为您同意
					<a
						onClick={() => {
							this.readContract('delegation_withhold_page');
						}}
						className={styles.link}
					>
						《用户收款扣款委托书》
					</a>
					并确认授权
				</div>
			</div>
		);
	}
}
