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
					<div className={style.bar_top}>
						<span>已提升额度</span>
						<span>自动提现</span>
					</div>
					<div className={style.bar_progress}>
						<img src={finished_img} className={style.left_ico} alt="finished_img" />
						<Progress percent={Number(percentData)} position="normal" barStyle={{borderColor: '#397BE6',borderWidth: '0.02rem'}}  style={{backgroundColor: '#C9CDD5',marginLeft: '0.18rem',marginRight: '0.18rem'}} />
						<img src={unfinished_img} className={style.right_ico} alt="unfinished_img" />
					</div>
					<div className={style.bar_bottom}>
						<span>完善信息</span>
						<span className={style.unfinished_text}>申请成功</span>
					</div>
					<div className={style.percent_text}>
						<span>{Number(percentData)}<i>%</i></span>
						已完成
					</div>
				</div>
			</WhiteCard>
		);
	}
}
