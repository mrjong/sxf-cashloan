/*
 * @Author: shawn
 * @LastEditTime: 2020-03-05 11:11:42
 */
import React from 'react';
import ClockS from 'components/TimeDown/ClockS';
import bg2 from './bg2.png';
import bg from './bg.png';
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
		const { type } = this.props;
		return (
			<div className={classNM.box}>
				{type && type === 'A' ? (
					<img className={classNM.bg} src={bg}></img>
				) : (
					<img className={classNM.bg} src={bg2}></img>
				)}

				<div className={classNM.text}>
					限时参与，成功率高&nbsp;
					<ClockS count={this.state.count} />
					<span className="jg">:</span>
					{this.state.millisecond < 9 ? <span className="mins">0</span> : <span className="mins">1</span>}
					<span className="mins">{this.state.millisecond}</span>
				</div>
			</div>
		);
	}
}
