/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2020-03-10 17:07:30
 */
import React from 'react';
import { Modal } from 'antd-mobile';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import styles from './index.scss';
import { ButtonCustom, CheckRadio } from 'components';
import { connect } from 'react-redux';
import { setProtocolSelFlagAction, setIframeProtocolShow } from 'reduxes/actions/commonActions';

import Image from 'assets/image';
import {
	preWarningModalInRiskBury,
	preWarningModalOutRiskBury,
	preWarningModalCloseRiskBury,
	preContinueLoanRiskBury
} from '../../../pre_loan_page/riskBuryConfig';

@connect(
	(state) => ({
		protocolSelFlag: state.commonState.protocolSelFlag
	}),
	{
		setProtocolSelFlagAction,
		setIframeProtocolShow
	}
)
export default class InsuranceModal extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			checkBox1: false
		};
	}
	componentWillMount() {
		const { protocolSelFlag } = this.props;
		protocolSelFlag && this.setState({ checkBox1: protocolSelFlag });
		sxfburiedPointEvent(preWarningModalInRiskBury.key);
	}
	// 跳转协议
	go = (params) => {
		const { cacheData } = this.props;
		// 缓存弹框展示
		cacheData && cacheData();
		this.props.setIframeProtocolShow({
			...params
		});
	};

	// 关闭弹框
	closeModal = () => {
		const { closeWarningModal, prodType } = this.props;
		closeWarningModal && closeWarningModal();
		this.props.setProtocolSelFlagAction(false);
		sxfburiedPointEvent(preWarningModalCloseRiskBury.key);
		buriedPointEvent(home.warningModalClose, {
			prodType
		});
	};

	// 点击继续申请
	handleButtonClick = () => {
		sxfburiedPointEvent(preContinueLoanRiskBury.key);
		const { handleConfirm, prodType, toast, protocolSelFlag } = this.props;

		if (protocolSelFlag) {
			handleConfirm && handleConfirm();
			sxfburiedPointEvent(preWarningModalOutRiskBury.key);
		} else {
			// 签约借款-警示-继续申请借款-提示 埋点
			buriedPointEvent(home.warningTips, {
				prodType
			});
			toast.info('请同意并勾选协议才能继续申请借款', 3);
		}
	};
	// 点击勾选协议
	checkAgreement = () => {
		const { prodType } = this.props;
		const { checkBox1 } = this.state;
		buriedPointEvent(home.warningProtoClick, {
			isSelected: checkBox1,
			prodType
		});
		this.setState({ checkBox1: !this.state.checkBox1 }, () => {
			this.props.setProtocolSelFlagAction(this.state.checkBox1);
		});
	};
	render() {
		const { protocolSelFlag } = this.props;
		return (
			<Modal popup className="warningModal" visible={true} animationType="slide-up" maskClosable={false}>
				<div className={styles.warningModalCont}>
					<img onClick={this.closeModal} className={styles.closeBtn} src={Image.icon.icon_close} alt="关闭" />

					<h2 className={styles.mainTit}>尊敬的还到用户：</h2>

					<div className={styles.warningCont}>
						<h3 className={styles.subTit}>一、请您保持良好的还款记录。</h3>
						<p className={[styles.subCont, styles.redText].join(' ')}>
							如果逾期将会上报您的逾期记录至人行征信，百行征信、互金信息共享平台。
						</p>
						<h3 className={styles.subTit}>二、为了避免影响您的信用，请您务必认真阅读以下内容：</h3>
						<p className={styles.subCont}>
							①{' '}
							<span
								className={styles.underlineText}
								onClick={() => {
									this.go({ url: 'credit_query_page', pId: 'grxyxxcxsqs' });
								}}
							>
								个人信用信息查询授权书
							</span>
						</p>
						<p className={styles.subCont}>
							②{' '}
							<span
								className={styles.underlineText}
								onClick={() => {
									this.go({ url: 'overdue_effect_page', pId: 'grxyyqyxgzs' });
								}}
							>
								个人信用逾期影响告知书
							</span>
						</p>
						<h3 className={[styles.subTit, styles.spaceStyle].join(' ')}>
							三、如您的逾期记录上传至征信平台后将会对您产生以下影响：
						</h3>
						<div className={[styles.subCont, styles.specialText].join(' ')}>
							<p>①</p>
							<p className={styles.modl_special_text}>影响您银行及互联网金融的借贷业务（房贷、车贷等）。</p>
						</div>
						<p className={styles.subCont}>② 影响您子女上学、入伍、就业等。</p>
						<p className={styles.subCont}>③ 逾期时间的增长会使您成为银行“黑户”。</p>
						<div className={[styles.subCont, styles.specialText].join(' ')}>
							<p>④</p>
							<p className={styles.modl_special_text}>
								征信变“黑”将会影响您的出行及高消费（乘坐高铁、飞机、出境等）。
							</p>
						</div>
					</div>

					<div className={styles.fixedBottomWrap}>
						{/* 底部合同 */}
						<div className={styles.agreement} onClick={this.checkAgreement}>
							<CheckRadio isSelect={protocolSelFlag} />
							您已悉知并同意
							<span
								onClick={(e) => {
									e.stopPropagation();
									this.go({ url: 'credit_query_page', pId: 'grxyxxcxsqs' });
								}}
							>
								《个人信用信息查询授权书》
							</span>
							<span
								onClick={(e) => {
									e.stopPropagation();
									this.go({ url: 'overdue_effect_page', pId: 'grxyyqyxgzs' });
								}}
							>
								《个人信用逾期影响告知书》
							</span>
							<span>及以上内容</span>
						</div>

						{/* 继续申请借款按钮 */}
						<ButtonCustom onClick={this.handleButtonClick} type={protocolSelFlag ? 'yellow' : 'default'}>
							继续申请借款
						</ButtonCustom>
					</div>
				</div>
			</Modal>
		);
	}
}
