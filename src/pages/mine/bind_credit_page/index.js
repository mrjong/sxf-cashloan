import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import { createForm } from 'rc-form';
import { List, InputItem } from 'antd-mobile';
import ButtonCustom from 'components/ButtonCustom';
import { validators, handleInputBlur, getFirstError } from 'utils';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { mine } from 'utils/analytinsType';
import { setBackGround } from 'utils/background';
import styles from './index.scss';
import qs from 'qs';

const API = {
	GETUSERINF: '/my/getRealInfo', // 获取用户信息
	GECARDINF: '/cmm/qrycardbin', // 绑定银行卡前,卡片信息查
	BINDCARD: '/withhold/card/bindConfirm', // 绑定银行卡
	CHECKCARD: '/my/chkCard', // 是否绑定了一张信用卡一张储蓄卡
	queryCardInfo: '/withhold/getLast4No' // 获取银行名称/后四位
};

// let isFetching = false;
let backUrlData = ''; // 从除了我的里面其他页面进去
let autId = '';
@setBackGround('#fff')
@fetch.inject()
@createForm()
export default class bind_credit_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			userName: '', // 持卡人姓名
			cardData: {} // 绑定的卡的数据
		};
		backUrlData = store.getBackUrl();
	}

	componentWillMount() {
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		autId = query && query.autId;
		console.log(autId, '------------');
		// isFetching = false;
		store.removeBackUrl();
		this.queryUserInf();
		this.queryCardInfo()
	}

	componentDidMount() {
		this.props.form.setFieldsValue({
			valueInputCarNumber: store.getBindCreditCardNo(),
		});
	}

	componentWillUnmount() {
		// isFetching = false;
		const pathname = this.props.history.location.pathname
		if (!(pathname === '/mine/support_credit_page') ) {
			store.removeBindCreditCardNo();
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

	// 获取信用卡后四位,发卡行
	queryCardInfo = () => {
		this.props.$fetch.get(`${API.queryCardInfo}/${autId ? autId : ''}`).then(
			(result) => {
				console.log(result)
				if (result.msgCode === 'PTM0000' && result.data) {
					this.setState({
						bankNm: result.data.bankNm,
						cardLastNo: result.data.cardLastNo
					})
				}
			},
			(error) => {
				error.msgInfo && this.props.toast.info(error.msgInfo);
			}
		);
	};

	// 校验信用卡卡号
	validateCarNumber = (rule, value, callback) => {
		if (!validators.bankCardNumber(value.replace(/\s*/g, ''))) {
			callback('请输入有效银行卡号');
		} else {
			callback();
		}
	};

	// 绑定银行卡
	bindConfirm = (params1) => {
		this.props.$fetch.post(API.BINDCARD, params1).then((result) => {
			if (
				result.msgCode === 'PTM0000' ||
				(backUrlData && result.msgCode === 'PTM0010') ||
				(backUrlData && result.msgCode === 'PBM1010')
			) {
				buriedPointEvent(mine.creditConfirm, {
					entry: backUrlData ? '绑定信用卡' : '信用卡管理',
					is_success: true
				});
				const cardDatas = {
					agrNo: result.data && result.data.agrNo ? result.data.agrNo : '',
					...this.state.cardData
				};
				if (backUrlData) {
					// 提交申请 判断是否绑定信用卡和储蓄卡
					this.props.$fetch.get(API.CHECKCARD).then((result) => {
						if (result.msgCode === 'PTM2003') {
							// 进入绑定储蓄卡页面，如何不需要存银行卡（防止弹窗出现）则加一个noBankInfo
							const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
							store.setBackUrl(backUrlData);
							if (queryData && queryData.noBankInfo) {
								this.props.history.replace({
									pathname: '/mine/bind_save_page',
									search: '?noBankInfo=true'
								});
							} else {
								this.props.history.replace('/mine/bind_save_page');
							}
						} else {
							// 首页不需要存储银行卡的情况，防止弹窗出现
							const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
							if (queryData && queryData.noBankInfo) {
								store.removeCardData();
							} else {
								store.setCardData(cardDatas);
							}
							store.removeBackUrl();
							// this.props.history.push(backUrlData);
							// 如果是从四项认证进入，绑卡成功则回到首页
							if (store.getCheckCardRouter() === 'checkCardRouter') {
								this.props.history.push('/home/home');
							} else {
								this.props.history.goBack();
							}
						}
					});
				} else {
					// this.props.history.replace('/mine/select_credit_page');
					this.props.history.goBack();
				}
			} else {
				// isFetching = false;
				buriedPointEvent(mine.creditConfirm, {
					entry: backUrlData ? '绑定信用卡' : '信用卡管理',
					is_success: false,
					fail_cause: result.msgInfo
				});
				this.props.toast.info(result.msgInfo);
			}
		});
	};
	// 通过输入的银行卡号 查出查到卡banCd
	checkCard = (values) => {
		values.valueInputCarNumber = values.valueInputCarNumber.replace(/\s*/g, '');
		this.props.$fetch.post(API.GECARDINF, { cardNo: values.valueInputCarNumber }).then(
			(result) => {
				this.setState({
					cardData: {
						cardNo: values.valueInputCarNumber,
						lastCardNo: values.valueInputCarNumber.slice(-4),
						...result.data
					}
				});
				if (result.msgCode === 'PTM0000' && result.data && result.data.bankCd && result.data.cardTyp !== 'D') {
					const params1 = {
						bankCd: result.data.bankCd,
						cardTyp: 'C', //卡类型。
						cardNo: values.valueInputCarNumber, //持卡人卡号
						autId: autId ? autId : '' // autId
					};
					this.bindConfirm(params1);
				} else {
					// isFetching = false;
					this.props.toast.info('请输入有效银行卡号');
					buriedPointEvent(mine.creditConfirm, {
						entry: backUrlData ? '绑定信用卡' : '信用卡管理',
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
	// 确认购买
	confirmBuy = () => {
		if (!this.validateFn()) return
		this.props.form.validateFields((err, values) => {
			if (!err) {
				this.checkCard(values);
				// TODO 发送请求等操作
			} else {
				if (!this.jsonIsNull(values)) {
					buriedPointEvent(mine.creditConfirm, {
						entry: backUrlData ? '绑定信用卡' : '信用卡管理',
						is_success: false,
						fail_cause: getFirstError(err)
					});
				}
				this.props.toast.info(getFirstError(err));
			}
		});
	};

	//	校验必填项
	validateFn = () => {
		const { userName } = this.state
		const formData = this.props.form.getFieldsValue();
		if (userName && formData.valueInputCarNumber) {
			return true
		}
		return false
	}


	// 判断json里的每一项是否为空
	jsonIsNull = (values) => {
		for (let val in values) {
			if (values[val] === undefined || values[val] === '') {
				return true;
			}
		}
		return false;
	};

	// 跳转到支持的银行
	supporBank = () => {
		this.props.history.push('/mine/support_credit_page');
	};

	render() {
		const Item = List.Item;
		const { getFieldProps } = this.props.form;
		return (
			<div>
				<div className={styles.header}>请确认需要还款的信用卡信息</div>
				<div className="bind_credit_page_listBox">
					<Item extra={this.state.userName}>持卡人</Item>
					<Item extra={this.state.bankNm}>发卡行</Item>
					<InputItem
						maxLength="24"
						type="bankCard"
						{...getFieldProps('valueInputCarNumber', {
							rules: [{ required: true, message: '请输入有效银行卡号' }, { validator: this.validateCarNumber }],
							onChange: (value) => {
								store.setBindCreditCardNo(value);
							}
						})}
						placeholder={`请补足尾号为${this.state.cardLastNo || 'xxxx'}的信用卡`}
						onBlur={() => {
							handleInputBlur();
						}}
					>
						信用卡卡号
					</InputItem>
					<div className={[styles.time_container, 'sms'].join(' ')} />
				</div>
				<span className={styles.support_type} onClick={this.supporBank}>
					支持绑定卡的银行
				</span>
				<ButtonCustom onClick={this.confirmBuy} className={[styles.confirm_btn, this.validateFn() ? '' : styles.confirm_disable_btn].join(' ')}>
					确认
				</ButtonCustom>
			</div>
		);
	}
}
