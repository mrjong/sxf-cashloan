import React from 'react';
import { Carousel } from 'antd-mobile';

import style from './index.scss';

export default class ActivityEntry extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			activityList: []
		};
	}
	componentWillMount() {
		this.requestMsgCount();
	}
	requestMsgCount = () => {
		this.setState({
			activityList: [{}, {}]
		});
	};
	renderActivityItem = () => {
		const { activityList } = this.state;
		if (!activityList || !activityList.length) {
			return null;
		}
		return activityList.map((item, index) => (
			<div className={style.activityItem} key={index}>
				活动入口
			</div>
		));
	};
	render() {
		const { activityList } = this.state;
		return activityList && activityList.length ? (
			<Carousel vertical dots={false} autoplay infinite>
				{this.renderActivityItem()}
			</Carousel>
		) : null;
	}
}
