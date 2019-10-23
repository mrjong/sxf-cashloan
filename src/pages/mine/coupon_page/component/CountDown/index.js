/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-10-22 17:21:05
 */
import React from 'react';
import styles from './index.scss';
export default class CountDown extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			day: 0,
			hour: 0,
			minute: '00',
			second: '00',
			endRender: false
		};
	}
	componentDidMount() {
		if (this.props.endTime) {
			let endTime = this.props.endTime.replace(/-/g, '/');
			this.countFun(endTime);
		}
	}
	//组件卸载时，取消倒计时
	componentWillUnmount() {
		clearInterval(this.timer);
	}

	countFun = (time) => {
		let end_time = new Date(time).getTime(),
			sys_second = end_time - new Date().getTime();
		this.timer = setInterval(() => {
			//防止倒计时出现负数
			if (sys_second > 1000) {
				sys_second -= 1000;
				let day = Math.floor(sys_second / 1000 / 3600 / 24);
				let hour = Math.floor((sys_second / 1000 / 3600) % 24);
				let minute = Math.floor((sys_second / 1000 / 60) % 60);
				let second = Math.floor((sys_second / 1000) % 60);
				this.setState({
					day: day,
					hour: hour < 10 ? '0' + hour : hour,
					minute: minute < 10 ? '0' + minute : minute,
					second: second < 10 ? '0' + second : second,
					endRender: true
				});
			} else {
				clearInterval(this.timer);
				//倒计时结束时，触发父组件的方法
				if (this.props.timeOver) {
					this.props.timeOver();
				}
			}
		}, 1000);
	};
	render() {
		const { endRender } = this.state;
		const { className } = this.props;
		return (
			<span>
				{endRender && this.state.day > 0 && this.props.type == 'day' ? (
					<span>
						<span className={[styles.hour, className].join(' ')}>{this.state.day}</span> 天
					</span>
				) : (
					endRender && (
						<span className={[styles.hour, className].join(' ')}>
							<span>{this.state.hour}:</span>
							{this.state.minute}:{this.state.second}s
						</span>
					)
				)}
			</span>
		);
	}
}
