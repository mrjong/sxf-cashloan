import React, { Component } from 'react';
import styles from './index.scss';
import bg1 from './img/bg1.png';
import bg2 from './img/bg2.png';

class fudai_page extends Component {
	render() {
		return (
			<div className={styles.fudai_page}>
				<img src={bg1} alt="" className={styles.img} />
				<img src={bg2} alt="" className={styles.img} />
				<div>
					<h3 className={styles.title}>活动规则</h3>
					<ul>
						<li className={styles.rule_item}>1.活动参与对象：随行付plus首贷用户</li>
						<li className={styles.rule_item}>2.活动奖励：免息券，5天内有效，借款时使用</li>
						<li className={styles.rule_item}>
							3.用户每按时结清或提前结清1期账单，可激活免息券奖励资格，奖励采用累加形式，全部还清后发放到优惠券账户中；若有逾期行为，奖励不予发送且之前奖励作废
						</li>
					</ul>
					<p className={styles.desc}>更多特权活动持续更新中。。。</p>
				</div>
			</div>
		);
	}
}

export default fudai_page;
