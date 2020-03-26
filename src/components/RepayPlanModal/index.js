import React from 'react';
import { Modal, Icon, Drawer } from 'antd-mobile';
import style from './index.scss';
import { StepBar } from 'components';

export default class RepayPlanModal extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			openDrawer: false
		};
	}

	render() {
		const { openDrawer } = this.state;
		const { visible, onClose, data, loanMoney, goPage, isJoinInsurancePlan } = this.props;
		// let totalMoney = 0,
		// 	totalPrincipal = 0;
		// periods = data && data.length;
		const data1 =
			data &&
			data.map((item) => {
				let {
					perdPrcpAmt,
					perdItrtAmt,
					perdNum,
					perdTotAmt,
					perdMngAmt,
					perdDeductAmt,
					riskGuaranteeAmt
				} = item;
				// totalMoney = totalMoney + Number(perdTotAmt); //总金额
				// totalPrincipal = totalPrincipal + Number(perdPrcpAmt); //总本金
				return {
					perdNum,
					perdTotalMoney: perdTotAmt,
					perdPrcpAmt,
					perdItrtAmt,
					perdMngAmt,
					perdDeductAmt,
					riskGuaranteeAmt: isJoinInsurancePlan ? riskGuaranteeAmt : 0
				};
			});
		const data2 =
			data &&
			data.map((item) => {
				let { perdPrcpAmt, perdItrtAmt, perdNum, perdPrcpAndIntr, riskGuaranteeAmt } = item;
				return {
					perdNum,
					perdTotalMoney: perdPrcpAndIntr,
					perdPrcpAmt,
					perdItrtAmt,
					riskGuaranteeAmt: isJoinInsurancePlan ? riskGuaranteeAmt : 0
				};
			});
		const sidebar = (
			<div className={style.drawer_wrap}>
				<div className={style.modalTitle}>
					<Icon
						type="left"
						className={style.left_arrow}
						onClick={() => {
							this.setState({
								openDrawer: !this.state.openDrawer
							});
						}}
					/>
					利息合计
					<Icon
						type="cross"
						className={style.modal_close_btn}
						onClick={() => {
							onClose();
							let timer = setTimeout(() => {
								this.setState({
									openDrawer: !this.state.openDrawer
								});
								clearTimeout(timer);
							}, 500);
						}}
					/>
				</div>
				<div className={style.money_box}>
					<span className={style.label}>借款金额</span>
					<span className={style.money}>
						<i className={style.moneyUnit}>¥ </i>
						<i className={style.value}>{loanMoney}</i>
					</span>
				</div>
				<div className={style.inner_wrap}>
					<a
						className={style.link_bar}
						onClick={() => {
							goPage();
						}}
					>
						<span>借款须知</span>
						<span>查看详情</span>
						<Icon type="right" className={style.link_bar_close} />
					</a>
					<div className={style.stepbar_wrap}>
						<StepBar data={data2} />
					</div>
				</div>
			</div>
		);

		return (
			<Modal popup className="plan_modal" visible={visible} animationType="slide-up" transparent>
				<Drawer
					className="my-drawer"
					position="right"
					touch={false}
					style={{ minHeight: document.documentElement.clientHeight }}
					sidebar={sidebar}
					open={openDrawer}
					sidebarStyle={{
						width: '100%'
					}}
				>
					<div className={style.modalTitle}>
						还款计划
						<Icon
							type="cross"
							className={style.modal_close_btn}
							onClick={() => {
								onClose();
							}}
						/>
					</div>
					<div className={style.money_box}>
						<span className={style.label}>借款金额</span>
						<span className={style.money}>
							<i className={style.moneyUnit}>¥</i>
							<i className={style.value}>{loanMoney}</i>
						</span>
					</div>
					<div className={style.inner_wrap}>
						<a
							className={style.link_bar}
							onClick={() => {
								this.setState({
									openDrawer: !this.state.openDrawer
								});
							}}
						>
							<span>利息如何计算的？</span>
							<span>查看详情</span>
							<Icon type="right" className={style.link_bar_close} />
						</a>
						<div className={style.stepbar_wrap}>
							<StepBar data={data1} />
						</div>
					</div>
				</Drawer>
				{/* <div className={style.fix_bottom}>
					<NoticeBar
						marqueeProps={{
							loop: true,
							leading: 1000,
							trailing: 1000,
							style: { color: '#C9CDD5', fontSize: '0.22rem' }
						}}
						icon={null}
					>
						{this.state.openDrawer
							? '出借人仅收取本金、利息、罚息（如有），其他费用以您与平台的约定为准'
							: `本平台仅收取服务费，利息由实际出借人收取，综合成本不超过${(
									((totalMoney - totalPrincipal) / totalPrincipal / periods) *
									12
							  ).toFixed(2) * 100}%/年`}
					</NoticeBar>
				</div> */}
			</Modal>
		);
	}
}
