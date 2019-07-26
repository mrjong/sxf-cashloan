import React from 'react';
import { Modal, Progress } from 'antd-mobile';
import OverDueModal from '../OverDueModal';
import ActivityModal from 'components/ActivityModal';
import AgreementModal from 'components/AgreementModal';
import style from './index.scss';

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
			homeModal = <OverDueModal toast={toast} overDueInf={overDueInf} handleClick={handleOverDueClick} />;
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
