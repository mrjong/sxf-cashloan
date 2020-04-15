import React, { Component } from 'react';
import { isMPOS } from 'utils/common';
import { isWXOpen, isPhone } from 'utils';
import styles from './index.scss';
class OverdueEntry extends Component {
	render() {
		const { isOverdue, overdueDays } = this.props;
		return (
			<div>
				{overdueDays > 0 && (isMPOS() || !isPhone() || isWXOpen()) && (
					<div className={styles.overdueEntryTip}>
						关注“还到”公众号，使用<span>微信支付</span>还款
					</div>
				)}
				{isOverdue && (
					<div
						className={styles.overdueEntry}
						onClick={() => {
							this.props.history.push({
								pathname: '/order/overdue_progress_page'
							});
						}}
					>
						<span className={styles.overdueItem}>
							<i className={styles.warningIco} />
							您的账单已逾期!
						</span>
						<span className={styles.overdueItem}>
							查看逾期信用进度
							<i className={styles.entryIco} />
						</span>
					</div>
				)}
			</div>
		);
	}
}

export default OverdueEntry;
