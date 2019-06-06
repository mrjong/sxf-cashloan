import React from 'react';
import { Modal, Progress } from 'antd-mobile';
import OverDueModal from '../OverDueModal';
import ActivityModal from 'components/Modal';
import AgreementModal from 'components/AgreementModal';

import style from './index.scss';
const API = {
	BANNER: '/my/getBannerList', // 0101-banner
	// qryPerdRate: '/bill/qryperdrate', // 0105-确认代还信息查询接口
	qryPerdRate: '/bill/prod',
	USR_INDEX_INFO: '/index/usrIndexInfo', // 0103-首页信息查询接口
	CARD_AUTH: '/auth/cardAuth', // 0404-信用卡授信
	CHECK_CARD: '/my/chkCard', // 0410-是否绑定了银行卡
	AGENT_REPAY_CHECK: '/bill/agentRepayCheck', // 复借风控校验接口
	procedure_user_sts: '/procedure/user/sts', // 判断是否提交授信
	chkCredCard: '/my/chkCredCard', // 查询信用卡列表中是否有授权卡
	readAgreement: '/index/saveAgreementViewRecord', // 上报我已阅读协议
	creditSts: '/bill/credit/sts', // 用户是否过人审接口
	checkJoin: '/jjp/checkJoin' // 用户是否参与过拒就赔
};
export default class BlackCard extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			showdata: {}
		};
	}
	render() {
		const {
			showAgreement,
			overDueModalFlag,
			isShowActivityModal,
			visibleLoading,
			overDueInf,
			modalType,
			modalBtnFlag,
			history,
			percent,
			readAgreementCb,
			handleOverDueClick,
			activityModalBtn,
      closeActivityModal,
      toast
		} = this.props;

		let homeModal = null;
		if (showAgreement) {
			homeModal = <AgreementModal visible={showAgreement} readAgreementCb={readAgreementCb} />;
		} else if (overDueModalFlag) {
			homeModal = (
				<OverDueModal
					toast={toast}
					overDueInf={overDueInf}
					handleClick={handleOverDueClick}
				/>
			);
		} else if (isShowActivityModal) {
			homeModal = (
				<ActivityModal
					activityModalBtn={activityModalBtn}
					closeActivityModal={closeActivityModal}
					history={history}
					modalType={modalType}
					modalBtnFlag={modalBtnFlag}
				/>
			);
		} else if (visibleLoading) {
			homeModal = (
				<Modal className="zijian" visible={visibleLoading} transparent maskClosable={false}>
					<div className={style.modalLoading}>资质检测中...</div>
					<Progress percent={percent} position="normal" />
				</Modal>
			);
		}
		return <div>{homeModal}</div>;
	}
}
