import React from 'react';
import styles from './index.scss';
const demo = [
	{
		cashAcBalSts: '0',
		title: '还到Plus 解锁中...',
		desc: '不用操作，更高额度，直接提现至储蓄卡',
		icon: 'key',
		time: 90,
		credAmt: '90'
	},
	{
		cashAcBalSts: '1',
		title: '可提现金额(元)',
		desc: '不用操作，更高额度，直接提现至储蓄卡',
		icon: 'opened',
		credAmt: '0'
	},
	{
		cashAcBalSts: '2',
		title: '还到Plus',
		desc: '按时还款可解锁',
		icon: 'locked',
		credAmt: '请继续累计信用 解锁'
	},
	{
		cashAcBalSts: '3',
		title: '还到Plus',
		desc: '按时还款可解锁',
		icon: 'locked',
		credAmt: '超多权益任你拿'
	}
];
export default class BlackCard extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		let { blackData } = this.props;
		const showdata = demo.filter((item) => {
			return item.cashAcBalSts === blackData.cashAcBalSts;
		});
		if (blackData.credAmt) {
			showdata[0].credAmt = Number(blackData.credAmt).toFixed(2);
		}
		return (
			<div>
				{(showdata && showdata[0].cashAcBalSts === '2') || (showdata && showdata[0].cashAcBalSts === '3') ? (
					<section className={styles.home_xj_black}>
						<div className={styles.title}>{showdata && showdata[0].title}</div>
						<div className={styles.subtitle}>{showdata && showdata[0].credAmt}</div>
						<div className={styles.desc}>
							<div className={styles.item_l}>
								{showdata && showdata[0].desc}
								<i />
							</div>
							<div className={styles.item_r}>
								了解更多<i />
							</div>
						</div>
					</section>
				) : null}
				{(showdata && showdata[0].cashAcBalSts === '0') || (showdata && showdata[0].cashAcBalSts === '1') ? (
					<section className={styles.home_xj_black}>
						<div className={styles.title}>
							{showdata && showdata[0].title}
							<i className={styles[showdata && showdata[0].icon]} />
						</div>
						<div className={styles.subtitle_90}>
							{showdata && showdata[0].credAmt}
							{showdata && showdata[0].time === 90 ? <span>秒</span> : null}
						</div>
						<div className={styles.desc} style={{ marginTop: '-0.15rem' }}>
							<div className={styles.item_l} style={{ opacity: 0.6, fontSize: '.22rem' }}>
								{showdata && showdata[0].desc}
							</div>
							<div className={styles.item_r}>
								了解更多<i />
							</div>
						</div>
					</section>
				) : null}
			</div>
		);
	}
}
