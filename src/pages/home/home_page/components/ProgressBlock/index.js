import React from 'react';
import style from './index.scss';
import { Progress } from 'antd-mobile';
import WhiteCard from '../WhiteCard';
import finished_img from './img/finished_ico.png';
import unfinished_img from './img/unfinished_ico.png';
export default class ProgressBlock extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		const { percentData, showData, handleClick } = this.props;
		console.log(percentData);
		return (
			<WhiteCard showData={showData} handleClick={handleClick}>
				<div className={style.circle_box}>
					<img src={finished_img} className={style.left_ico} alt="finished_img" />
					<Progress percent={Number(percentData)} position="normal" barStyle={{borderColor: '#397BE6',borderWidth: '0.02rem'}}  style={{backgroundColor: '#C9CDD5',}} />
					<img src={unfinished_img} className={style.right_ico} alt="unfinished_img" />
				</div>
			</WhiteCard>
		);
	}
}
