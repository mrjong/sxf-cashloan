import React from 'react';
import ClockS from 'components/TimeDown/ClockS';
import { thousandFormatNum } from 'utils/common';

import classNM from './index.scss';

let timedown = null;

export default class LimitTimeJoin extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			count: 0,
			status: 'stopped',
			millisecond: 0
		};
	}

	componentDidMount() {
		this.handleSetCountDown(60 * 60);
		this.getMillisecond();
		this.startTimer();
	}

	componentWillUnmount() {
		clearInterval(timedown);
		clearInterval(this.timer);
	}

	handleSetCountDown = (totalSeconds) => {
		this.setState({
			count: totalSeconds,
			status: 'started'
		});
	};

	getMillisecond = () => {
		setTimeout(() => {
			timedown = setInterval(() => {
				if (Number(this.state.millisecond) > 8) {
					this.setState({
						millisecond: 0
					});
				} else {
					this.setState({
						millisecond: this.state.millisecond + 1
					});
				}
			}, 100);
		}, 0);
	};

	startTimer() {
		this.timer = setInterval(() => {
			const newCount = this.state.count - 1;
			this.setState({
				count: newCount >= 0 ? newCount : 0
			});
			if (newCount === 0) {
				this.setState({
					status: 'stopped'
				});
			}
		}, 1000);
	}

	render() {
		return (
			<div className={classNM.limit_time_join_wrap}>
				<span className={classNM.card_bg1} />
				<span className={classNM.card_bg2} />
				<div className={classNM.cardWrap}>
					<span className={classNM.card_tip}>立即参与，成功率高</span>
					<p className={classNM.card_loan_text}>最高可借金额（元）</p>
					<p className={classNM.card_loan_amout}>{thousandFormatNum(50000)}</p>
					<div className={classNM.text}>
						限时参与&nbsp;
						<ClockS count={this.state.count} />
						<span className="jg">:</span>
						{this.state.millisecond < 9 ? <span className="mins">0</span> : <span className="mins">1</span>}
						<span className="mins">{this.state.millisecond}</span>
					</div>
				</div>
			</div>
		);
	}
}
