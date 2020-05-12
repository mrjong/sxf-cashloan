/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2020-05-09 16:47:47
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import ButtonCustom from 'components/ButtonCustom';
import { createForm } from 'rc-form';
import { setBackGround } from 'utils/background';
import ContactResultList from '../contact_result_page/components/ContactResultList';
import { validators, arrCheckDup } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import { connect } from 'react-redux';
import { setCacheContactAction } from 'reduxes/actions/staticActions';
import { setSaveContactAction, setCredictInfoAction } from 'reduxes/actions/commonActions';
import { StepTitle } from 'components';
import { Modal, Progress } from 'antd-mobile';
import { base64Encode, base64Decode } from 'utils/CommonUtil/toolUtil';
import fetch from 'sx-fetch';
import { loan_loanSub, loan_queryContactsList } from 'fetch/api.js';
import qs from 'qs';
import { isMPOS } from 'utils/common';

let timer;
let timerOut;
let queryData = {};
@setBackGround('#fff')
@fetch.inject()
@createForm()
@connect(
	(state) => ({
		confirmAgencyInfo: state.commonState.confirmAgencyInfo,
		cacheContact: state.staticState.cacheContact,
		authId: state.staticState.authId,
		couponData: state.commonState.couponData,
		saveContact: state.commonState.saveContact
	}),
	{
		setCacheContactAction,
		setSaveContactAction,
		setCredictInfoAction
	}
)
export default class add_contact_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			percent: 0,
			progressLoading: false,
			contactInfo: {} // 联系人相关信息
		};
	}
	componentWillMount() {
		queryData = qs.parse(location.search, { ignoreQueryPrefix: true });

		this.queryContactList();
	}
	componentDidMount() {}
	componentWillUnmount() {}

	queryContactList = () => {
		this.props.toast.loading('加载中...', 10);
		this.props.$fetch.post(loan_queryContactsList).then((result) => {
			this.props.toast.hide();
			if (result && result.code === '000000' && result.data !== null) {
				// base64解密
				if (result.data.contacts && result.data.contacts.length) {
					// map 改变引用型数组,值类型数组不改变
					result.data.contacts.map((item, index) => {
						item.name = base64Decode(item.name);
						item.number = base64Decode(item.number);
						if (index < 5) {
							item.isMarked = true;
						} else {
							item.isMarked = false;
						}
						item.uniqMark = 'uniq' + index;
						return item;
					});
				}
				if (result.data.excludedContacts && result.data.excludedContacts.length) {
					for (let i = 0; i < result.data.excludedContacts.length; i++) {
						result.data.excludedContacts[i] = base64Decode(result.data.excludedContacts[i]);
					}
				}
				this.setState({
					contactInfo: result.data
				});
				this.calculationNum(result.data.contacts);
			} else {
				this.props.toast.info(result.message);
			}
		});
	};

	/**
	 * @description: 将后端联系人数据缓存起来  优先取本地 再去后端
	 * @param {type}
	 * @return:
	 */

	calculationNum = (contactList) => {
		const { cacheContact } = this.props;
		const emptyList = [
			{ name: '', number: '', uniqMark: 'uniq0' },
			{ name: '', number: '', uniqMark: 'uniq1' },
			{ name: '', number: '', uniqMark: 'uniq2' },
			{ name: '', number: '', uniqMark: 'uniq3' },
			{ name: '', number: '', uniqMark: 'uniq4' }
		];
		if (!cacheContact || cacheContact.length === 0 || isMPOS()) {
			this.props.setCacheContactAction((contactList && contactList.slice(0, 5)) || emptyList);
			return;
		}
		let isNull = true;
		for (let index = 0; index < cacheContact.length; index++) {
			const element = cacheContact[index];
			if (element.name) {
				isNull = false;
				break;
			}
		}
		if (isNull) {
			this.props.setCacheContactAction((contactList && contactList.slice(0, 5)) || emptyList);
		} else {
			this.props.setCacheContactAction((cacheContact && cacheContact.slice(0, 5)) || emptyList);
		}
	};

	// 确认按钮点击
	confirmHandler = () => {
		const { contactInfo } = this.state;
		buriedPointEvent(home.speContactConfirmClick, {
			contactsLength:
				contactInfo &&
				contactInfo.contacts &&
				contactInfo.contacts.length &&
				Number(contactInfo.contacts.length) >= 5
					? '大于等于5'
					: '小于5'
		});
		const { cacheContact } = this.props;
		const excConatactList = (contactInfo && contactInfo.excludedContacts) || [];
		let filterList = cacheContact.filter((item) => !item.name || !item.number);
		const inValidNmList = cacheContact.filter((item) => item.name.length > 15);
		if (filterList.length) {
			this.props.toast.info('请添加满5个指定联系人');
			return;
		}
		for (var i = 0; i < cacheContact.length; i++) {
			if (!validators.phone(cacheContact[i].number)) {
				this.props.toast.info('请输入有效手机号');
				return;
			}
			if (excConatactList.includes(cacheContact[i].number)) {
				this.props.toast.info('请不要填写当前注册手机号或紧急联系人手机号', 3);
				return;
			}
		}
		if (!arrCheckDup(cacheContact, 'number')) {
			this.props.toast.info('请输入不同联系人手机号');
			return;
		}
		if (inValidNmList.length) {
			this.props.toast.info('联系人姓名最多15个字符');
			return;
		}
		// this.props.setSaveContactAction(cacheContact);
		// this.props.history.goBack();
		this.requestConfirmRepaymentInfo(cacheContact);
	};

	// onchang 时改变state值
	changeContact = (obj, val, key, dataIndex) => {
		const { cacheContact } = this.props;
		let cacheContact2 = [];
		if (cacheContact && cacheContact.length) {
			// cacheContact[dataIndex][key] = val;
			cacheContact2 = [
				...cacheContact.slice(0, dataIndex),
				{ ...cacheContact[dataIndex], [key]: val },
				...cacheContact.slice(dataIndex + 1)
			];
		}
		this.props.setCacheContactAction(cacheContact2);
	};

	// 确认代还信息
	requestConfirmRepaymentInfo = (saveContact) => {
		const { couponData, authId, confirmAgencyInfo } = this.props;
		const { lendersDate, repayInfo, contractData, cardBillAmt, repayInfo2 } = confirmAgencyInfo;
		let couponId = '';
		if (couponData && couponData.coupId) {
			if (couponData.coupId !== 'null') {
				couponId = couponData.coupId;
			} else {
				couponId = '';
			}
		}

		// 处理联系人列表
		let selectedList = [];
		if (saveContact && saveContact.length) {
			saveContact.forEach((item) => {
				selectedList.push({
					num: base64Encode(item.number),
					n: base64Encode(item.name)
				});
			});
		}

		const params = {
			withDrawAgrNo: repayInfo.withdrawBankAgrNo, // 代还信用卡主键
			withHoldAgrNo: repayInfo.withholdBankAgrNo, // 还款卡号主键
			prodId: contractData[0].prodId, // 产品ID
			autId: authId || '', // 信用卡账单ID
			repayType: lendersDate.value, // 还款方式
			coupId: couponId, // 优惠劵id
			loanAmt: cardBillAmt, // 签约金额
			prodType: '01',
			contacts: selectedList,
			riskGuarantee: queryData.isRiskGuaranteeProd
		};
		timerOut = setTimeout(() => {
			this.setState(
				{
					percent: 0,
					progressLoading: true
				},
				() => {
					timer = setInterval(() => {
						this.setPercent();
						// ++this.state.time;
					}, 1000);
				}
			);
		}, 300);
		// 代还确认-确认借款
		buriedPointEvent(home.borrowingSubmit, {
			lenders_date: repayInfo2.perdCnt
		});
		this.props.$fetch
			.post(loan_loanSub, params, {
				timeout: 100000,
				hideLoading: true
			})
			.then((result) => {
				this.props.toast.hide();
				this.setState(
					{
						percent: 100
					},
					() => {
						timer && clearInterval(timer);
						timerOut && clearTimeout(timerOut);
						this.setState({
							progressLoading: false
						});
						if (result && result.code === '000000') {
							this.jumpRouter(result.data);
							buriedPointEvent(home.borrowingSubmitResult, {
								is_success: true
							});
						} else {
							buriedPointEvent(home.borrowingSubmitResult, {
								is_success: false,
								fail_cause: result.message
							});
							if (result && (result.code === '100021' || result.code === '100020')) {
								// LOAN_CRED_ERROR("100020", "授信拒绝"),
								// LOAN_ADV_ERROR("100021", "预签约订单提交失败"),
								this.props.toast.info(result.message, 3, () => {
									this.props.history.push('/home/home');
								});
							} else {
								this.props.toast.info(result.message);
							}
						}
					}
				);
			})
			.catch(() => {
				clearInterval(timer);
				clearTimeout(timerOut);
				this.setState({ percent: 100 }, () => {
					this.setState({
						progressLoading: false
					});
				});
			});
	};
	// 设置百分比
	setPercent = () => {
		if (this.state.percent < 90 && this.state.percent >= 0) {
			this.setState({
				percent: this.state.percent + parseInt(Math.random() * 10 + 1)
			});
		} else {
			clearInterval(timer);
		}
	};
	// 跳转页面
	jumpRouter = (res) => {
		// 增加标识
		if (res.loanType === 'M') {
			this.props.history.push({
				pathname: '/home/loan_person_succ_page',
				search: `?creadNo=${res.credApplNo}`
			});
		} else if (res.loanType === 'H') {
			this.props.history.replace({
				pathname: '/home/loan_robot_succ_page',
				search: `?telNo=${res.rmk}`
			});
		} else if (res.loanType === 'ING') {
			// 预签约审核中
			this.props.history.replace({
				pathname: '/home/loan_applying_page',
				search: `?advanceNum=${res.loanAdvanceNo}`
			});
		} else if (res.loanType === 'A') {
			this.props.history.push({
				pathname: '/home/loan_apply_succ_page',
				search: `?title=预计60秒完成放款`
			});
		} else if (res.loanType === 'MIM') {
			// 额度不满足
			this.props.setCredictInfoAction(res);
			this.props.history.push({
				pathname: '/home/lend_confirm_page'
			});
		}
	};

	render() {
		const { progressLoading, percent } = this.state;
		const { cacheContact } = this.props;
		let filterList = (cacheContact && cacheContact.filter((item) => !item.name || !item.number)) || [];
		return (
			<div className={styles.contact_result_page}>
				<StepTitle
					title="请确认联系人信息"
					titleSub="确认则表示您已授权此联系人信息与我们，在紧急联系人无法联系时，用于与您取得联系时使用"
				/>

				<ContactResultList isCanSelect={false} changeContact={this.changeContact} toast={this.props.toast} />
				<div className={styles.confirm_btn_box}>
					<ButtonCustom onClick={this.confirmHandler} type={filterList.length ? 'default' : 'yellow'}>
						确认并借款
					</ButtonCustom>
				</div>
				<Modal wrapClassName={styles.modalLoading} visible={progressLoading} transparent maskClosable={false}>
					<div className="show-info">
						<div className={styles.modalLoading}>借款处理中...</div>
						<div className="confirm_agency_progress">
							<Progress percent={percent} position="normal" />
						</div>
					</div>
				</Modal>
			</div>
		);
	}
}
