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
			activeIndex: 0,
			showLeft: false,
			showRight: true
		};
	}

	carouselChange = (index) => {
		this.setState({
			activeIndex: index
		});
	};
	onClick = false;
	beforeChange = () => {
		if (this.onClick) {
			return;
		}
		setTimeout(() => {
			if (this.state.activeIndex === 0) {
				this.setState({
					showLeft: false,
					showRight: true
				});
			} else if (this.state.activeIndex === 1) {
				this.setState({
					showLeft: true,
					showRight: false
				});
			}
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
					this.onClick = true;
					this.setState(
						{
							showLeft: true,
							showRight: false,
							activeIndex: this.state.activeIndex - 1
						},
						() => {
							this.onClick = false;
							// this.beforeChange();
						}
					);
				}}
			>
				{textArr}
				<span
					className={[classNM.additionArrow, classNM.additionArrowRight].join(' ')}
					style={{ borderRightColor: typeConfig[dataSource[index].cardType].colorMain }}
				></span>
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
					this.onClick = true;
					this.setState(
						{
							showLeft: false,
							showRight: true,
							activeIndex: this.state.activeIndex + 1
						},
						() => {
							this.onClick = false;
							// this.beforeChange();
						}
					);
				}}
			>
				{textArr}
				<span
					className={[classNM.additionArrow, classNM.additionArrowLeft].join(' ')}
					style={{ borderLeftColor: typeConfig[dataSource[index].cardType].colorMain }}
				></span>
			</div>
		);
	}

	renderSwitchItem() {
		const { data } = this.props;
		const { showRight, showLeft } = this.state;
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
					{showLeft ? prevPlaceHolder : null}
					<div className={classNM.itemContainer} style={itemContainerFinal}>
						<SwitchCardItem myIndex={index} activeIndex={this.state.activeIndex} {...item} />
					</div>
					{showRight ? nextPlaceHolder : null}
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
				beforeChange={this.beforeChange}
				afterChange={this.carouselChange}
			>
				{this.renderSwitchItem()}
			</Carousel>
		);
	}
}
