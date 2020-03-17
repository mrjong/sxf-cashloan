import React, { Component } from 'react';
import { setBackGround } from 'utils/background';
import styles from './index.scss';

@setBackGround('#fff')
class insurance_introduce_page extends Component {
	render() {
		return (
			<div className={styles.pageWrap}>
				<h3 className={styles.title}>风险保障计划</h3>
				<p className={styles.desc}>
					参与风险保障计划后，借款人逾期还款或因借款人原因导致借款提前到期且借款人未按时还款的，担保公司将逾期后x日前（即：T+X日前）进行逾期代偿，代偿将按照《风险保障计划标准条款》及《风险保障计划明细表》规定，使用风险保障专项账户资金将借款人应向出借人偿还或支付的贷款本金、利息、逾期利息、出借人为实现债权而发生的费用以及其他所有借款人的应付费用赔付给出借人。
				</p>
			</div>
		);
	}
}

export default insurance_introduce_page;
