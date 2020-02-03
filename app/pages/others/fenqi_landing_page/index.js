import React, { PureComponent } from 'react';
import styles from './index.scss';
import ruleImg from './img/rule.png';
import img from './img/img.png';

export default class fenqi_landing_page extends PureComponent {
	render() {
		return (
			<div className={styles.fenqi_landing_page}>
				<div className={styles.title}>关于还到Plus</div>
				<h3 className={styles.subTitle}>什么是还到Plus</h3>
				<div className={styles.cardBox}>
					<div className={styles.cardInner}>
						<em>还到Plus</em>
						是还到全新升级的明星产品，针对信用良好且及时结清的还到用户，将直接提供授信额度，用户可一键操作提款至
						<em>储蓄卡</em>。
					</div>
				</div>
				<h3 className={styles.subTitle}>还到Plus专属权益</h3>
				<img src={img} alt="" className={styles.img} />
				<h3 className={styles.subTitle}>如何申请还到Plus</h3>
				<img src={ruleImg} alt="" className={styles.ruleImg} />
			</div>
		);
	}
}
