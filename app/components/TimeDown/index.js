import React from 'react';
import style from './index.scss';

import Clock from './Clock';
// import Controls from './Controls';
export default class TimeDown extends React.Component {
	constructor() {
		super();
		this.state = {
			count: 0,
			status: 'stopped'
		};
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.status !== prevState.status) {
			switch (this.state.status) {
				case 'started':
					this.handleStart();
					break;
				case 'stopped':
					this.setState({
						count: 0
					});
				case 'paused':
					clearInterval(this.timer);
			}
		}
	}
	componentDidMount() {
		this.props.onRef(this);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
		this.timer = null;
	}
	handleStateChange = (nextStatus, count) => {
		this.setState({
			status: nextStatus,
			count
		});
	};

	handleStart = () => {
		this.timer = setInterval(() => {
			const newCount = this.state.count + 1;
			this.setState({
				count: newCount
			});
		}, 1000);
	};
	render() {
		const { count } = this.state;
		return (
			<div>
				{count && count <= 15 * 60 ? (
					<div className={[style.timebox, 'fadeInRight'].join(' ')}>
						<div className={style.num}>
							<Clock count={count} />
						</div>
					</div>
				) : null}
			</div>
		);
	}
}
