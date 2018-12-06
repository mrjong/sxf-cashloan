import React, { Component } from 'react';
import { Carousel } from 'antd-mobile';
import style from './index.scss'

export default class AwardShow extends Component {
	render() {
		const {allUsersAward} = this.props;
		return (
			<div className={style.message}>
				<Carousel className={style.awardCarousel}
					vertical
					dots={false}
					dragging={false}
					swiping={false}
					autoplay
					infinite
				>
				{allUsersAward.map((item, index) => {
										return (
					<div key={index} className={style.carouselItem}>恭喜{item.mblHid} 获得<span>{item.valDes}</span></div>
					)
				})}
				</Carousel>
			</div>
		);
	}
}
