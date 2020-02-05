import React, { Component } from 'react';
import { Carousel } from 'antd-mobile';

import SwitchCardItem from './SwitchCardItem';
import typeConfig from './typeConfig';

import classNM from './index.scss';

const checkAZ = /[a-zA-Z]/;

// const styles = {
// 	placeHolderTextArrow: {
// 		marginTop: '.1rem'
// 	},
// 	placeHolderTextArrowReversal: {
// 		transform: 'rotateY(180deg)'
// 	}
// };

export default class SwitchCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeIndex: 0
		};
	}

	carouselChange = (index, total) => {
		this.setState({
			activeIndex: index
		});
	};

	renderPlaceHolderPrev(index) {
		const dataSource = this.props.data;
		if (!dataSource[index - 1]) {
			return null;
		}

		let textArr = dataSource[index - 1].cardLabel.split('').map((text, textIndex) => {
			let textStyle = {
				color: typeConfig[dataSource[index].cardType].colorMain
			};
			if (checkAZ.test(text)) {
				textStyle = {
					...textStyle,
					fontSize: '.28rem',
					lineHeight: '.32rem'
				};
			}
			return (
				<div key={textIndex} className={classNM.placeHolderText} style={textStyle}>
					{text}
				</div>
			);
		});

		let placeHolderStyle = {
			backgroundColor: typeConfig[dataSource[index - 1].cardType].colorMain,
			marginRight: '.2rem',
			borderRadius: 0,
			borderTopRightRadius: '.1rem',
			borderBottomRightRadius: '.1rem'
		};

		return (
			<div
				className={classNM.placeHolderBtn}
				style={placeHolderStyle}
				onClick={() => {
					this.setState({
						activeIndex: this.state.activeIndex - 1
					});
				}}
			>
				{textArr}
				{/* <img
					style={[
						styles.placeHolderTextArrow,
						styles.placeHolderTextArrowReversal,
						{ tintColor: typeConfig[dataSource[index].cardType].colorMain }
					]}
					source={Images.icon.trigon_right_black}
				/> */}
			</div>
		);
	}

	renderPlaceHolderNext(index) {
		const dataSource = this.props.data;
		if (!dataSource[index + 1]) {
			return null;
		}

		let textArr = dataSource[index + 1].cardLabel.split('').map((text, textIndex) => {
			let textStyle = {
				color: typeConfig[dataSource[index].cardType].colorMain
			};
			if (checkAZ.test(text)) {
				textStyle = {
					...textStyle,
					fontSize: '.26rem',
					lineHeight: '.38rem'
				};
			}
			return (
				<div key={textIndex} className={classNM.placeHolderText} style={textStyle}>
					{text}
				</div>
			);
		});

		let placeHolderStyle = {
			backgroundColor: typeConfig[dataSource[index + 1].cardType].colorMain,
			marginLeft: '.2rem',
			borderRadius: 0,
			borderTopLeftRadius: '.1rem',
			borderBottomLeftRadius: '.1rem'
		};

		return (
			<div
				className={classNM.placeHolderBtn}
				style={placeHolderStyle}
				onClick={() => {
					this.setState({
						activeIndex: this.state.activeIndex + 1
					});
				}}
			>
				{textArr}
				{/* <img
					style={[
						styles.placeHolderTextArrow,
						{ tintColor: typeConfig[dataSource[index].cardType].colorMain }
					]}
					source={Images.icon.trigon_right_black}
				/> */}
			</div>
		);
	}

	renderSwitchItem() {
		const { data } = this.props;
		if (!data || !data.length) {
			return null;
		}
		const switchItemArr = data.map((item, index) => {
			let prevPlaceHolder = this.renderPlaceHolderPrev(index);
			let nextPlaceHolder = this.renderPlaceHolderNext(index);
			let itemContainerFinal = {};
			if (!prevPlaceHolder) {
				itemContainerFinal.paddingLeft = '.4rem';
			}
			if (!nextPlaceHolder) {
				itemContainerFinal.paddingRight = '.4rem';
			}
			return (
				<div className={classNM.itemWrap} key={index}>
					{prevPlaceHolder}
					<div className={classNM.itemContainer} style={itemContainerFinal}>
						<SwitchCardItem {...item} />
					</div>
					{nextPlaceHolder}
				</div>
			);
		});
		return switchItemArr;
	}

	render() {
		const { activeIndex } = this.state;
		return (
			<Carousel
				className={classNM.carouselWrap}
				selectedIndex={activeIndex}
				dots={false}
				afterChange={this.carouselChange}
			>
				{this.renderSwitchItem()}
			</Carousel>
		);
	}
}
