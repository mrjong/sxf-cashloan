/*
 * @Author: shawn
 * @LastEditTime : 2020-02-06 11:53:13
 */
import React from 'react';
import { Carousel } from 'antd-mobile';

import style from './index.scss';

export default class ActivityEntry extends React.PureComponent {
	renderActivityItem = () => {
		const { data } = this.props;
		if (!data || !data.length) {
			return null;
		}
		return data.map((item, index) => (
			<div className={style.activityItem} key={index}>
				<img style={style.itemImg} src={item.img} />
			</div>
		));
	};
	render() {
		const { data } = this.props;
		return data && data.length ? (
			<Carousel vertical dots={false} autoplay infinite>
				{this.renderActivityItem()}
			</Carousel>
		) : null;
	}
}
