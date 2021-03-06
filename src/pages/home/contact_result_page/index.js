/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2020-04-29 17:04:13
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import ButtonCustom from 'components/ButtonCustom';
import { createForm } from 'rc-form';
// import { setBackGround } from 'utils/background';
import ContactResultList from './components/ContactResultList';
import { validators, arrCheckDup } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import { connect } from 'react-redux';
import { setCacheContactAction, setSaveContactAction } from 'reduxes/actions/commonActions';

import { Modal, Progress } from 'antd-mobile';
import { base64Encode } from 'utils/CommonUtil/toolUtil';
import fetch from 'sx-fetch';
import dayjs from 'dayjs';
import { loan_loanSub } from 'fetch/api.js';
let timer;
let timerOut;

// @setBackGround('#fff')
@fetch.inject()
@createForm()
@connect(
	(state) => ({
		confirmAgencyInfo: state.commonState.confirmAgencyInfo,
		cacheContact: state.commonState.cacheContact,
		authId: state.staticState.authId,
		couponData: state.commonState.couponData,
		saveContact: state.commonState.saveContact
	}),
	{
		setCacheContactAction,
		setSaveContactAction
	}
)
export default class contact_result_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			percent: 0,
			progressLoading: false
		};
	}
	componentWillMount() {}
	componentDidMount() {}
	componentWillUnmount() {}

	// 修改联系人
	editContactHandler = (obj, dataIndex) => {
		buriedPointEvent(home.reContactConfirmModify);
		this.props.history.push({ pathname: '/home/modify_contact_page', state: { ind: dataIndex, ...obj } });
	};

	// 确认按钮点击
	confirmHandler = () => {
		buriedPointEvent(home.reContactSaveClick);
		const { cacheContact, confirmAgencyInfo = {} } = this.props;
		const excConatactList =
			(confirmAgencyInfo.repayInfo && confirmAgencyInfo.repayInfo.excludedContacts) || [];
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
			contacts: selectedList
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
							this.props.toast.info(result.message);
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
		} else {
			// 预约放款的标识
			this.props.history.push({
				pathname: '/home/loan_apply_succ_page',
				search: `?title=预计60秒完成放款`
			});
		}
	};

	render() {
		const { progressLoading, percent } = this.state;
		return (
			<div className={styles.contact_result_page}>
				<ContactResultList
					isCanSelect={true}
					editContactHandler={this.editContactHandler}
					changeContact={this.changeContact}
					toast={this.props.toast}
				/>
				<div className={styles.confirm_btn_box}>
					<ButtonCustom onClick={this.confirmHandler} className={styles.confirm_btn}>
						确认
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
