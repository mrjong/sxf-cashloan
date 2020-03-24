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
					为了更高效便捷地获得借款服务，借款人可以申请加入风险保障计划。
					借款人加入风险保障计划的，当借款人发生逾期还款时，出借人可以要求担保公司以风险保障金专项账户余额为限代偿逾期本息，随后借款人向风险保障计划偿还逾期款项，具体详见《风险保障计划标准条款》。
				</p>
			</div>
		);
	}
}

export default insurance_introduce_page;
