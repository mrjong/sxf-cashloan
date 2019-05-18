import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Progress, Icon, List, InputItem } from 'antd-mobile';
import styles from './index.scss';
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
  // 关闭注册协议弹窗
  readAgreementCb = () => {
		this.props.$fetch.post(`${API.readAgreement}`).then((res) => {
			if (res && res.msgCode === 'PTM0000') {
				this.setState({
					showAgreement: false
				});
			}
		});
	};
	render() {
    const {
      showAgreement
    } =  this.props
		let homeModal = null;
		if (showAgreement) {
			homeModal = <AgreementModal visible={showAgreement} readAgreementCb={this.readAgreementCb} />;
		} else if (billOverDue) {
			homeModal = (
				<Modal className="overDueModal" visible={billOverDue} transparent maskClosable={false}>
					<div>
						<img src={overDueImg} />
						<h3 className={style.modalTitle}>信用风险提醒</h3>
						<p>您的逾期记录已经报送至央行监管的征信机构，未来会影响银行及金融类借款申请，请尽快还款，维护信用。</p>
						<SXFButton onClick={this.handleOverDueClick}>我知道了，前去还款</SXFButton>
					</div>
				</Modal>
			);
		} else if (overDueModalFlag) {
			homeModal = (
				<OverDueModal toast={this.props.toast} overDueInf={overDueInf} handleClick={this.handleOverDueClick} />
			);
		} else if (isShowActivityModal) {
			homeModal = (
				<ActivityModal
					activityModalBtn={this.activityModalBtn}
					closeActivityModal={this.closeActivityModal}
					history={history}
					modalType={this.state.modalType}
				/>
			);
		} else if (visibleLoading) {
			homeModal = (
				<Modal
					className="zijian"
					wrapClassName={style.modalLoadingBox}
					visible={visibleLoading}
					transparent
					maskClosable={false}
				>
					<div className="show-info">
						<div className={style.modalLoading}>资质检测中...</div>
						<div className="progress">
							<Progress percent={percent} position="normal" />
						</div>
					</div>
				</Modal>
			);
		}
		return <div>{homeModal}</div>;
	}
}
