import React, { PureComponent } from 'react';
import fetch from 'sx-fetch-rjl';
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
import SelectList from 'components/SelectList';

const API = {
	GETUSERINF: '/my/getRealInfo', // 获取用户信息
	GECARDINF: '/cmm/qrycardbin', // 绑定银行卡前,卡片信息查
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
		this.setState({
			bankType: store.getDepositBankName()
		});
	}

	componentWillUnmount() {
		if (
			location.pathname !== '/mine/support_save_page' &&
			location.pathname !== '/protocol/delegation_withhold_page'
		) {
			store.removeBackUrl(); // 清除session里的backurl的值
			store.removeBindCardNo();
			store.removeBindCardPhone();
			store.removeDepositBankName();
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
		if (!validators.bankCardNumber(value.replace(/\s*/g, ''))) {
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
		const insuranceFlag = store.getInsuranceFlag();

		const sendParams = insuranceFlag
			? {
					cardNo: valueInputCarNumber,
					bnkMblNo: valueInputCarPhone,
					usrSignCnl: getH5Channel(),
					cardTyp,
					bankCd,
					bankName,
					type: '1', // 0 可以重复 1 不可以重复
					priorityType: 'ZY' // * 优先绑定标识 * 标识该次绑卡是否要求优先绑定某类型卡, * JR随行付金融 XD随行付小贷 ZY中元保险  其他情况:无优先级
			  }
			: {
					cardNo: valueInputCarNumber,
					bnkMblNo: valueInputCarPhone,
					usrSignCnl: getH5Channel(),
					cardTyp,
					bankCd,
					bankName,
					type: '1' // 0 可以重复 1 不可以重复
			  };
		this.props.$fetch.post(API.protocolSms, sendParams).then((res) => {
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
					buriedPointEvent(mine.protocolSmsFail, { reason: `${res.msgCode}-${res.msgInfo}` });
					break;
				case '1010':
				case 'PBM1010':
					this.props.toast.info(res.msgInfo);
					buriedPointEvent(mine.protocolSmsFail, { reason: `${res.msgCode}-${res.msgInfo}` });
					break;
				default:
					this.props.toast.info('暂不支持该银行卡，请换卡重试');
					buriedPointEvent(mine.protocolSmsFail, { reason: `${res.msgCode}-${res.msgInfo}` });
					break;
			}
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
		this.props.$fetch
			.post(API.protocolBind, {
				cardNo: params.cardNo,
				smsCd: params.smsCd
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					buriedPointEvent(mine.protocolBindFail, {
						is_success: true,
						reason: `${res.msgCode}-${res.msgInfo}`
					});
					//协议绑卡成功
					const backUrlData = store.getBackUrl();
					// 在这里清，是为了防止进入支持银行卡列表页和协议页，返回的时候没有insuranceFlag
					store.removeInsuranceFlag();
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
					// this.setState({ valueInputCarSms: '' });
					this.props.form.setFieldsValue({
						valueInputCarSms: ''
					});
					buriedPointEvent(mine.protocolBindFail, {
						is_success: false,
						reason: `${res.msgCode}-${res.msgInfo}`
					});
				} else {
					this.props.toast.info('绑卡失败，请换卡或重试');
					buriedPointEvent(mine.protocolBindFail, {
						is_success: false,
						reason: `${res.msgCode}-${res.msgInfo}`
					});
				}
			});
	};
	// 绑卡之前进行校验
	checkCard = (values) => {
		const factCardNo = values.valueInputCarNumber.replace(/\s*/g, '');
		this.props.$fetch.post(API.GECARDINF, { cardNo: factCardNo }).then(
			(result) => {
				if (
					result.msgCode === 'PTM0000' &&
					result.data &&
					result.data.bankCd &&
					result.data.cardTyp !== 'C'
				) {
					this.setState({
						cardData: {
							cardNo: factCardNo,
							lastCardNo: factCardNo.slice(-4),
							...result.data
						}
					});
					const params = {
						bankCd: result.data.bankCd, //银行代号
						cardTyp: 'D', //卡类型(借记卡)
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

	// 确认绑卡
	confirmBindCard = () => {
		if (!this.validateFn()) return;
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

	//	校验必填项
	validateFn = () => {
		const { userName, bankType } = this.state;
		const formData = this.props.form.getFieldsValue();
		if (
			userName &&
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
		if (!validators.bankCardNumber(formData.valueInputCarNumber)) {
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
			cardNo: formData.valueInputCarNumber && formData.valueInputCarNumber.replace(/\s*/g, ''),
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
				<div className="bind_save_page_listBox list-extra">
					<Item extra={this.state.userName}>持卡人</Item>
					<Item
						extra={<SelectList selectText={this.state.bankType} defaultText={'请选择发卡银行'} />}
						onClick={() => {
							this.props.history.push('/mine/support_save_page?isClick=0');
						}}
					>
						发卡行
					</Item>
					<InputItem
						maxLength="29"
						{...getFieldProps('valueInputCarNumber', {
							initialValue: this.state.bindCardNo,
							rules: [
								{ required: true, message: '请输入有效银行卡号' },
								{ validator: this.validateCarNumber }
							],
							onChange: (value) => {
								store.setBindCardNo(value);
							}
						})}
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
					<div className={[styles.time_container, 'sms'].join(' ')}>
						<InputItem
							maxLength="6"
							{...getFieldProps('valueInputCarSms', {
								rules: [{ required: true, message: '请输入验证码' }]
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
								timerActiveTitle={['', '"']}
							/>
						</div>
					</div>
				</div>
				<span className={styles.support_type} onClick={this.supporBank}>
					支持绑定卡的银行
				</span>
				<ButtonCustom
					onClick={this.confirmBindCard}
					className={[styles.confirm_btn, this.validateFn() ? '' : styles.confirm_disable_btn].join(' ')}
				>
					确认
				</ButtonCustom>
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
