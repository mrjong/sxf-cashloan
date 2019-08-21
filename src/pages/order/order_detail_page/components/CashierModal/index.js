import React from 'react';
import styles from './index.scss';
import { Modal, Icon } from 'antd-mobile';
import SXFButton from 'components/ButtonCustom';
import fetch from 'sx-fetch';
// import success_icon from '../../img/success_icon.png';

export default class CashierModal extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const {
			isAdvance,
			moneyWithCoupon,
			totalAmtForShow,
			isShowDetail,
			detailArr,
			payType,
			wthdCrdCorpOrgNm,
			wthdCrdNoLast,
			disDisRepayAmt,
			isPayAll,
			billDesc,
			bankInfo = {},
			payTypes = []
		} = this.props.data;
		const { visible, onClose, onSelectCoupon, onSelectBank } = this.props;
		const { b } = this.state;
		return (
			<Modal
				popup
				visible={visible}
				onClose={() => {
					onClose();
				}}
				animationType="slide-up"
			>
				<div className={styles.modal_box}>
					<div className={styles.modal_title}>
						还款详情
						<Icon
							type="cross"
							className={styles.modal_close_btn}
							onClick={() => {
								onClose();
							}}
						/>
					</div>
					<div className={styles.modal_notice}>
						<span className={styles.text}>因银行通道原因，可能出现部分还款成功情况，请留意账单详情</span>
					</div>
					<div className={styles.modal_flex} onClick={isAdvance ? this.showDetail : () => {}}>
						<span className={styles.modal_label}>本次还款金额</span>
						<span className={styles.modal_value}>
							{moneyWithCoupon || (totalAmtForShow && parseFloat(totalAmtForShow).toFixed(2))}元
						</span>
						{isAdvance && <i className={isShowDetail ? styles.arrow_up : styles.arrow_down} />}
					</div>
					{/* 账单明细展示 */}
					{isShowDetail ? (
						<div className={styles.feeDetail}>
							{detailArr.map((item, index) =>
								item.feeAmt ? (
									<div className={styles.modal_flex} key={index}>
										<span className={styles.modal_label}>{item.feeNm}</span>
										<span className={styles.modal_value_desc}>
											{item.feeAmt && parseFloat(item.feeAmt).toFixed(2)}元
										</span>
									</div>
								) : null
							)}
							<div className={`${styles.modal_flex} ${styles.sum_total}`}>
								<span className={styles.modal_label}>本次应还总金额</span>
								<span className={styles.modal_value}>
									{moneyWithCoupon || (totalAmtForShow && parseFloat(totalAmtForShow).toFixed(2))}元
								</span>
							</div>
						</div>
					) : null}
					{!payType || payType === 'BankPay' ? (
						<div className={styles.modal_flex}>
							<span className={styles.modal_label}>还款银行卡</span>
							<span
								onClick={() => {
									onSelectBank();
								}}
								className={`${styles.modal_value}`}
							>
								{bankInfo && bankInfo.bankName ? (
									<span>
										{bankInfo.bankName}({bankInfo.lastCardNo})
									</span>
								) : (
									<span>
										{wthdCrdCorpOrgNm}({wthdCrdNoLast})
									</span>
								)}
							</span>
							&nbsp;
							<i />
						</div>
					) : null}

					{disDisRepayAmt ? (
						<div className={styles.modal_flex}>
							<span className={styles.modal_label}>提前结清优惠</span>
							<span className={`${styles.modal_value_red}`}>-{disDisRepayAmt}元</span>
						</div>
					) : null}

					{// 一键结清不显示优惠劵
					!isPayAll && (
						<div className={`${styles.modal_flex} ${styles.modal_flex2}`}>
							<span className={styles.modal_label}>优惠券</span>
							{billDesc.data && billDesc.data.coupVal ? (
								<span
									onClick={() => {
										onSelectCoupon(false);
									}}
									className={`${styles.modal_value}`}
								>
									{this.renderCoupon()}
								</span>
							) : (
								<span
									onClick={() => {
										onSelectCoupon(true);
									}}
									className={`${styles.modal_value}`}
								>
									无可用优惠券
								</span>
							)}
							&nbsp;
							<i />
						</div>
					)}
					{payTypes.length !== 1 ? (
						<div className={styles.modal_weixin}>
							<div className={styles.modal_label}>还款方式</div>
							<div className={styles.flex_div}>
								{payTypes.includes('WXPay') && !isInsureValid ? (
									<div
										className={payType === 'WXPay' ? [styles.item, styles.active].join(' ') : styles.item}
										onClick={() => {
											this.selectPayType('WXPay');
										}}
									>
										<span className={styles.jian} />
										<i className={styles.wx} />微 信
									</div>
								) : null}
								{payTypes.includes('BankPay') ? (
									<div
										onClick={() => {
											this.selectPayType('BankPay');
										}}
										className={payType === 'BankPay' ? [styles.item, styles.active].join(' ') : styles.item}
									>
										<i className={styles.bank} />
										银行卡
									</div>
								) : null}
							</div>
						</div>
					) : null}

					<SXFButton onClick={this.handleClickConfirm} className={styles.modal_btn}>
						立即还款
					</SXFButton>
				</div>
			</Modal>
		);
	}
}
