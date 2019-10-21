/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-10-17 17:59:44
 */
import React, { Component } from 'react';
import { Carousel } from 'antd-mobile';
import style from './index.scss';

export default class AwardShow extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	// 获取两个数之间的随机整数
	getRandomNumberByRange = (start, end) => {
		return Math.floor(Math.random() * (end - start) + start);
	};

	// 随机生成获奖人
	randomAwardUser = () => {
		const familyName = [
			'赵',
			'钱',
			'孙',
			'吴',
			'陈',
			'张',
			'谢',
			'王',
			'杨',
			'秦',
			'曹',
			'李',
			'葛',
			'苏',
			'马',
			'方',
			'金',
			'周',
			'苗',
			'马'
		];
		const sex = ['先生', '女士'];
		const sexId = Math.random() <= 0.5 ? 0 : 1;
		const user = familyName[this.getRandomNumberByRange(0, 19)] + sex[sexId];
		return user;
	};

	// 随机生成奖品金额
	randomAwardAmt = () => {
		const amt = this.getRandomNumberByRange(30, 180);
		return amt;
	};

	// 获取手机随机前一位
	generateMixed = () => {
		const chars = ['3', '5', '7', '8'];
		const id = this.getRandomNumberByRange(0, 3);
		const res = chars[id];
		return res;
	};

	// 随机生成手机号
	randomPhoneNum = () => {
		let phoneNum = '';
		phoneNum = `1${this.generateMixed()}${this.getRandomNumberByRange(0, 9)}****${this.getRandomNumberByRange(
			0,
			9
		)}${this.getRandomNumberByRange(0, 9)}${this.getRandomNumberByRange(0, 9)}${this.getRandomNumberByRange(
			0,
			9
		)}`;
		return phoneNum;
	};

	// 拼凑号码+文字
	getNode = () => {
		let str = '';
		str = `${this.randomPhoneNum()} ${this.randomAwardUser()} 领取了新手礼 成功借款并减免了${this.randomAwardAmt()}元利息`;
		console.log(str, 'sss');
		return str;
	};

	// 获奖列表
	getAwardList = () => {
		let awardList = [];
		for (var i = 0; i < 30; i++) {
			awardList.push(this.getNode());
		}
		return awardList;
	};

	render() {
		const awards = this.getAwardList();
		return (
			<Carousel
				className={style.awardCarousel}
				vertical
				dots={false}
				dragging={false}
				swiping={false}
				autoplay
				infinite
			>
				{/* {this.getNode()} */}
				{awards.map((item, index) => (
					<div className={style.carouselItem} key={index}>
						{item}
					</div>
				))}
			</Carousel>
		);
	}
}
