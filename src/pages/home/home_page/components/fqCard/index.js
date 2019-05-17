import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.scss';

const _handleClick = (onClick, event) => {
	event.preventDefault();
	!!onClick && onClick();
};
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
		title: '可题现金额(元)',
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
export default class FQCard extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			showdata: {}
		};
	}
	componentWillMount() {
		this.getData();
	}
	getData = () => {
		let demoData = {
			cashAcBalSts: '0',
			credAmt: ''
		};
		const showdata = demo.filter((item) => {
			return item.cashAcBalSts === demoData.cashAcBalSts;
		});
		if (demoData.credAmt) {
			showdata[0].credAmt = demoData.credAmt;
		}
		this.setState({
			showdata: showdata[0]
		});
	};
	render() {
		const { showdata } = this.state;
		console.log(showdata);
		return (
			<div>
				{showdata.cashAcBalSts === '2' || showdata.cashAcBalSts === '3' ? (
					<section className={styles.home_xj_black}>
						<div className={styles.title}>{showdata.title}</div>
						<div className={styles.subtitle}>{showdata.credAmt}</div>
						<div className={styles.desc}>
							<div className={styles.item_l}>
								{showdata.desc}
								<i />
							</div>
							<div className={styles.item_r}>
								了解更多权益<i />
							</div>
						</div>
					</section>
				) : null}
				{showdata.cashAcBalSts === '0' || showdata.cashAcBalSts === '1' ? (
					<section className={styles.home_xj_black}>
						<div className={styles.title}>
							{showdata.title}
							<i className={styles[showdata.icon]} />
						</div>
						<div className={styles.subtitle_90}>
							{showdata.credAmt}
							{showdata.time === 90 ? <span>秒</span> : null}
						</div>
						<div className={styles.desc} style={{ marginTop: '-0.15rem' }}>
							<div className={styles.item_l} style={{ opacity: 0.6, fontSize: '.22rem' }}>
								{showdata.desc}
							</div>
							<div className={styles.item_r}>
								了解更多权益<i />
							</div>
						</div>
					</section>
				) : null}
			</div>
		);
	}
}
