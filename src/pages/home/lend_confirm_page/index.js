/*
 * @Author: shawn
 * @LastEditTime: 2020-04-29 10:04:51
 */
import React, { PureComponent } from 'react';
import { Icon } from 'antd-mobile';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import { setBackGround } from 'utils/background';
import fetch from 'sx-fetch';
import { createForm } from 'rc-form';
import style from './index.scss';
import { domListen } from 'utils/domListen';
import { ButtonCustom } from 'components';
import { loan_loanSub } from 'fetch/api.js';
import { connect } from 'react-redux';
import { setRouterTypeAction, setCredictInfoAction } from 'reduxes/actions/commonActions';
import { thousandFormatNum } from 'utils/common';

@setBackGround('#fff')
@fetch.inject()
@createForm()
@domListen()
@connect(
	(state) => ({
		userInfo: state.staticState.userInfo,
		credictInfo: state.commonState.credictInfo,
		authId: state.staticState.authId
	}),
	{
		setRouterTypeAction,
		setCredictInfoAction
	}
)
export default class lend_confirm_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {}

	componentWillUnmount() {}

	// 查看详情
	checkDetail = () => {
		buriedPointEvent(home.lendCheckDetail);
		// 跳转标识存入redux
		this.props.setRouterTypeAction('lendConfirm');
		this.props.history.push({
			pathname: '/home/confirm_agency'
		});
	};

	// 保留额度稍后借款
	savaCredict = () => {
		buriedPointEvent(home.lendSaveBtnClick);
		this.props.history.push('/home/home');
	};

	// 立即放款至信用卡
	loanHandler = () => {
		buriedPointEvent(home.lendLoanBtnClick);
		this.props.toast.loading('加载中...', 10);
		const { credictInfo = {} } = this.props;
		const params = {
			withDrawAgrNo: credictInfo.withDrawAgrNo, // 代还信用卡主键
			withHoldAgrNo: credictInfo.withHoldAgrNo, // 还款卡号主键
			prodId: credictInfo.prodId, // 产品ID
			autId: credictInfo.autId || '', // 信用卡账单ID
			repayType: '0', // 还款方式
			coupId: '', // 优惠劵id 默认不使用优惠劵,因为无法判断这次优惠劵是否可用
			loanAmt: credictInfo.credAmt, // 签约金额
			prodType: '01',
			// contacts: selectedList, // 不需要传,因为在提交借款的时候可以传给后台
			riskGuarantee: credictInfo.riskGuarantee,
			loanAdvanceNo: credictInfo.loanAdvanceNo
		};
		this.props.$fetch
			.post(loan_loanSub, params, {
				timeout: 100000
			})
			.then((result) => {
				this.props.toast.hide();
				console.log(result);
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
			})
			.catch(() => {
				this.props.toast.hide();
			});
	};

	// 跳转页面
	jumpRouter = (res) => {
		const couponInfo = res && res.popupInfo ? res.popupInfo : '';
		// 增加标识
		if (res.loanType === 'M') {
			this.props.history.push({
				pathname: '/home/loan_person_succ_page',
				search: `?creadNo=${res.credApplNo}&couponInfo=${JSON.stringify(couponInfo)}`
			});
		} else if (res.loanType === 'H') {
			this.props.history.replace({
				pathname: '/home/loan_robot_succ_page',
				search: `?telNo=${res.rmk}&couponInfo=${JSON.stringify(couponInfo)}`
			});
		} else if (res.loanType === 'ING') {
			// 预签约审核中
			this.props.history.replace({
				pathname: '/home/loan_applying_page',
				search: `?advanceNum=${res.loanAdvanceNo}`
			});
		} else if (res.loanType === 'A') {
			// 预约放款的标识
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
		const { credictInfo = {} } = this.props;
		return (
			<div className={style.lend_confirm}>
				<div className={style.lend_confirm_cont}>
					<h2 className={style.lend_tit}>
						以您现有资质
						<br />
						本次借款审批成功金额
					</h2>
					<p className={style.realAmt}>
						¥
						<span>
							{(credictInfo && credictInfo.credAmt && thousandFormatNum(credictInfo.credAmt)) || ''}
						</span>
					</p>
					<p className={style.applyAmt}>
						本次申请金额(元)：
						<span>
							{(credictInfo && credictInfo.applyAmt && thousandFormatNum(credictInfo.applyAmt)) || ''}
						</span>
					</p>
					<div className={style.detailWrap} onClick={this.checkDetail}>
						<span>借款详情</span>
						<div className={style.detailRight}>
							<span>查看</span>
							<Icon type="right" className={style.enterIcon} />
						</div>
					</div>
				</div>
				<div className={style.buttonWrap}>
					<ButtonCustom onClick={this.loanHandler}>立即放款至信用卡</ButtonCustom>
					<ButtonCustom
						outline="true"
						outlinetype="solid"
						outlinecolor="#FFBC00"
						color="#FFBC00"
						className={style.saveBtn}
						onClick={this.savaCredict}
					>
						保留额度稍后借款
					</ButtonCustom>
				</div>
			</div>
		);
	}
}
