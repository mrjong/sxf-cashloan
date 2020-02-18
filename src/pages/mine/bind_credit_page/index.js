/*
 * @Author: shawn
 * @LastEditTime : 2020-02-18 17:31:39
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import { createForm } from 'rc-form';
import { List, InputItem } from 'antd-mobile';
import ButtonCustom from 'components/ButtonCustom';
import { base64Encode } from 'utils/CommonUtil/toolUtil';
import { validators, handleInputBlur, getFirstError } from 'utils';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { mine } from 'utils/analytinsType';
import { setBackGround } from 'utils/background';
import styles from './index.scss';
import qs from 'qs';
import { connect } from 'react-redux';
import { cred_queryCredCardById, bank_card_check, bank_card_bind_credit, bank_card_bin } from 'fetch/api';

// let isFetching = false;
let backUrlData = ''; // 从除了我的里面其他页面进去
let autId = '';
let query = {};
@setBackGround('#fff')
@fetch.inject()
@createForm()
@connect((state) => ({
	userInfo: state.staticState.userInfo,
	cardData: state.commonState.cardData,
	nextStepStatus: state.commonState.nextStepStatus,
	authId: state.staticState.authId,
	backRouter: state.commonState.backRouter
}))
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
		query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		autId = query && query.autId;
		console.log(autId, '------------');
		// isFetching = false;
		store.removeBackUrl();
		this.queryCardInfo();
	}

	componentDidMount() {
		this.props.form.setFieldsValue({
			valueInputCarNumber: store.getBindCreditCardNo()
		});
	}

	componentWillUnmount() {
		// isFetching = false;
		const pathname = this.props.history.location.pathname;
		if (!(pathname === '/mine/support_credit_page')) {
			store.removeBindCreditCardNo();
		}
	}

	// 获取信用卡后四位,发卡行
	queryCardInfo = () => {
		this.props.$fetch
			.post(`${cred_queryCredCardById}`, { autId: (this.props.authId && this.props.authId) || '' })
			.then(
				(result) => {
					console.log(result);
					if (result.code === '000000' && result.data) {
						this.setState({
							bankName: result.data.bankName,
							lastNo: result.data.lastNo
						});
					}
				},
				(error) => {
					error.message && this.props.toast.info(error.message);
				}
			);
	};

	// 校验信用卡卡号
	validateCarNumber = (rule, value, callback) => {
		if (!value || !validators.number(value.replace(/\s*/g, ''))) {
			callback('请输入有效银行卡号');
		} else {
			callback();
		}
	};

	// 绑定银行卡
	bindConfirm = (params1) => {
		this.props.$fetch.post(bank_card_bind_credit, params1).then((result) => {
			if (result.code === '000000' || (backUrlData && result.code === '999968')) {
				buriedPointEvent(mine.creditConfirm, {
					entry: backUrlData ? '绑定信用卡' : '信用卡管理',
					is_success: true
				});
				if (backUrlData) {
					// 提交申请 判断是否绑定信用卡和储蓄卡
					this.props.$fetch
						.get(`${bank_card_check}/${(this.props.authId && this.props.authId) || ''}`)
						.then((result) => {
							if (result.code === '999974') {
								// 进入绑定储蓄卡页面，如何不需要存银行卡（防止弹窗出现）则加一个noBankInfo
								store.setBackUrl(backUrlData);
								if (query && query.noBankInfo) {
									this.props.history.replace({
										pathname: '/mine/bind_save_page',
										search: '?noBankInfo=true'
									});
								} else {
									this.props.history.replace('/mine/bind_save_page');
								}
							} else {
								store.removeBackUrl();
								this.props.history.goBack();
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
					fail_cause: result.message
				});
				this.props.toast.info(result.message);
			}
		});
	};
	// 通过输入的银行卡号 查出查到卡banCd
	checkCard = (values) => {
		values.valueInputCarNumber = values.valueInputCarNumber.replace(/\s*/g, '');
		this.props.$fetch.post(bank_card_bin, { cardNoCpt: base64Encode(values.valueInputCarNumber) }).then(
			(result) => {
				this.setState({
					cardData: {
						cardNo: values.valueInputCarNumber,
						lastCardNo: values.valueInputCarNumber.slice(-4),
						...result.data
					}
				});
				if (result.code === '000000' && result.data && result.data.bankCode && result.data.cardType !== 'D') {
					const params1 = {
						bankCode: result.data.bankCode,
						cardNoCpt: base64Encode(values.valueInputCarNumber), //持卡人卡号
						autId: (this.props.authId && this.props.authId) || '' // autId
					};
					this.bindConfirm(params1);
				} else {
					// isFetching = false;
					this.props.toast.info(`请输入有效银行卡号${result.code}`);
					buriedPointEvent(mine.creditConfirm, {
						entry: backUrlData ? '绑定信用卡' : '信用卡管理',
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
	// 确认购买
	confirmBuy = () => {
		if (!this.validateFn()) return;
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
		const formData = this.props.form.getFieldsValue();
		if (formData.valueInputCarNumber) {
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

	// 跳转到支持的银行
	supporBank = () => {
		this.props.history.push('/mine/support_credit_page');
	};

	render() {
		const Item = List.Item;
		const { getFieldProps } = this.props.form;
		const { userInfo = {} } = this.props;
		const { lastNo } = this.state;
		return (
			<div className={styles.container}>
				<div className={styles.header}>请确认需要还款的信用卡信息</div>
				{lastNo ? <span className={styles.tipText}>请补足尾号为{lastNo}的信用卡</span> : null}
				<div className="bind_credit_page_listBox">
					<Item extra={userInfo && userInfo.nameHid}>持卡人</Item>
					<Item extra={this.state.bankName}>发卡行</Item>
					<InputItem
						maxLength="29"
						type="bankCard"
						{...getFieldProps('valueInputCarNumber', {
							rules: [
								{ required: true, message: '请输入有效银行卡号' },
								{ validator: this.validateCarNumber }
							],
							onChange: (value) => {
								store.setBindCreditCardNo(value);
							}
						})}
						placeholder={`请补足尾号为${lastNo || 'xxxx'}的信用卡`}
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
				<div className={styles.btn_box}>
					<ButtonCustom type={!this.validateFn() ? 'gray' : 'yellow'} onClick={this.confirmBuy}>
						确认
					</ButtonCustom>
				</div>
			</div>
		);
	}
}
