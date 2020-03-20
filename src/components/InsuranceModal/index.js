import React from 'react';
import { Modal, Icon, NoticeBar } from 'antd-mobile';
import { StepBar, ButtonCustom, CheckRadio } from 'components';
import styles from './index.scss';

export default class InsuranceModal extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isChecked: false
		};
	}
	toggleCheckbox = () => {
		this.setState({
			isChecked: !this.state.isChecked
		});
	};
	render() {
		const { isChecked } = this.state;
		const {
			data = [],
			visible,
			onClose,
			onButtonClick,
			guaranteeCompany,
			handleContractClick,
			contact = {}
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
					<a
						className={styles.link_bar}
						onClick={() => {
							this.props.history.push('/home/insurance_introduce_page');
						}}
					>
						<span>什么是风险保障计划?</span>
						<Icon type="right" className={styles.link_bar_close} />
					</a>
					<StepBar data={stepData} riskGuarantee={true} />

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
					<div className={styles.protocolWrap} onClick={this.toggleCheckbox}>
						<CheckRadio isSelect={isChecked} />
						<span>我已认真阅读，点击确认表示同意</span>
						<span className={styles.protocolLink} onClick={handleContractClick}>
							《{contact.contractMdlName}》
						</span>
					</div>
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
