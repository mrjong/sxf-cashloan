import React, { Component } from 'react';
import style from './index.scss';
import SvgCirPro from 'components/CircleProgress/svgCirPro';
let timer = '';
export default class Circle extends Component {
	constructor(props) {
		super(props);
    }
	render() {
		const { percentData, percentSatus } = this.props;

		return (
			<div>
				{/*  */}
				<div className={style.title}>当前申请进度</div>
				<SvgCirPro
					percent={90}
					radius={70}
					borderWidth={10}
					smallradius
					textStyle={{ fontSize: 23, color: '#fa9a22', textAlign: 'center' }}
					color="#61ebff"
				/>
				<div className={style.subtitle}>仅剩 {percentSatus} 步即可获得 50000 元</div>
			</div>
		);
	}
}
