import React from 'react';
import { Modal, Icon, NoticeBar } from 'antd-mobile';
import { StepBar, ButtonCustom, ProtocolRead } from 'components';
import styles from './index.scss';

export default class InsuranceModal extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isChecked: false
		};
	}
	render() {
		const {
			data = [],
			visible,
			onClose,
			onButtonClick,
			guaranteeCompany,
			handleContractClick,
			handlePlanClick,
			contact = {},
			isChecked,
			toggleCheckbox
		} = this.props;
		const stepData =
			data &&
			data.map((item) => {
				let { riskGuaranteeAmt, deductRiskAmt, perdNum } = item;
				return {
					riskGuaranteeAmt,
					deductRiskAmt,
					perdNum
				};
			});
		return (
			<Modal popup visible={visible} className={styles.antModal} onClose={onClose} animationType="slide-up">
				<div className={styles.modalInner}>
					<h3 className={styles.title}>风险保障计划</h3>
					<p className={styles.subTitle}>还款时授权担保机构扣款保障金</p>
					<a className={styles.link_bar} onClick={handlePlanClick}>
						<span>什么是风险保障计划?</span>
						<Icon type="right" className={styles.link_bar_close} />
					</a>
					{/* 针对3期产品不需要设置高度, 没有1期产品暂时不考虑 */}
					<div
						className={
							stepData && stepData.length < 6
								? [styles.stepBarWrap, styles.stepBarWrap2].join(' ')
								: styles.stepBarWrap
						}
					>
						<StepBar data={stepData} riskGuarantee={true} />
					</div>

					<div className={styles.buttonWrap}>
						<ButtonCustom
							className={styles.button}
							onClick={() => {
								onButtonClick('exit');
							}}
						>
							暂不考虑
						</ButtonCustom>
						<ButtonCustom
							className={[styles.button, isChecked && styles.activeButton].join(' ')}
							onClick={() => {
								if (!isChecked) {
									this.props.toast.info('请先阅读并勾选相关协议,再授权并参与');
									return;
								}
								onButtonClick('submit');
							}}
						>
							授权并参与
						</ButtonCustom>
					</div>
					<ProtocolRead
						className={styles.protocolWrap}
						tip="我已认真阅读，点击确认表示同意"
						isSelect={isChecked}
						protocolList={[
							{
								label: contact.contractMdlName
							}
						]}
						clickRadio={toggleCheckbox}
						clickProtocol={handleContractClick}
						offsetH="0"
					/>
				</div>
				<div className={styles.fix_bottom}>
					<NoticeBar
						marqueeProps={{
							loop: true,
							leading: 1000,
							trailing: 1000,
							style: { color: '#C9CDD5', fontSize: '0.22rem' }
						}}
						icon={null}
					>
						{`本保障计划由${guaranteeCompany}公司提供服务，最终结果以担保公司为准`}
					</NoticeBar>
				</div>
			</Modal>
		);
	}
}
