/*
 * @Author: shawn
 * @LastEditTime : 2020-02-19 14:34:02
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
			<div
				className={style.activityItem}
				key={index}
				onClick={() => {
					this.handleGoJump(item);
				}}
			>
				<img className={style.itemImg} src={item.img} />
			</div>
		));
	};
	handleGoJump = (item) => {
		if (!item.link) {
			return;
		}
		window.location.href = item.link;
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
