import React, { Component } from 'react';
import style from './index.scss';
let timer = '';
export default class Circle extends Component {
	constructor(props) {
		super(props);
		this.state = {
			progressNum: 0
		};
	}
	componentDidMount() {
		this.props.onRef(this);
	}
	startAdd = (percentData) => {
		console.log(percentData);
		timer = setInterval(() => {
			this.setState(
				{
					progressNum: this.state.progressNum + 1
				},
				() => {
					if (percentData === this.state.progressNum) {
						clearInterval(timer);
					}
				}
			);
		}, 50);
	};
	render() {
		let $step = 1; // step of % for created classes
		let $loops = Math.round(100 / $step);
		let $increment = 360 / $loops;
		let $half = Math.round($loops / 2);
		let $bg = '#2f3439';
		let $size = 180;
		let $bdiam = $size / 4 - 10;
		let $barColor = ' #fffde8';
		let backgroundImage = '';
		const { progressNum } = this.state;
		if (progressNum < $half) {
			let $nextdeg = 90 + $increment * progressNum + 'deg';
			backgroundImage = `linear-gradient(90deg, ${$bg} 50%, transparent 50%, transparent),linear-gradient(${$nextdeg}, ${$barColor} 50%, ${$bg} 50%, ${$bg})`;
		} else {
			let $nextdeg = -90 + $increment * (progressNum - $half) + 'deg';
			backgroundImage = `linear-gradient(${$nextdeg}, ${$barColor} 50%, transparent 50%, transparent),linear-gradient(270deg, ${$barColor} 50%, ${$bg} 50%, ${$bg})`;
		}
		let circleTransform = `rotate(${progressNum * 3.6}deg) translate(0, ${(-$size / 2 + $bdiam / 2) / 100}rem)`;
		return (
			<div>
				{/*  */}
				<div style={{ backgroundImage }} className={[ 'progress_radial' ].join(' ')}>
					<span className={style.circle_span} style={{ transform: circleTransform }} />
					<div className={style.text}>{progressNum}</div>
				</div>
			</div>
		);
	}
}
