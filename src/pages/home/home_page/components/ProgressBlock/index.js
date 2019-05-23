import React from 'react';
import style from './index.scss';
import ZButton from 'components/ButtonCustom';
import SvgCirPro from 'components/CircleProgress/svgCirPro';
import WhiteCard from '../WhiteCard';
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
					<SvgCirPro
						percent={Number(percentData)}
						radius={45}
						borderWidth={5}
						smallradius
						textStyle={{ fontSize: 12, color: '#fa9a22', textAlign: 'center' }}
						color="#61ebff"
					/>
					<div className={style.desc}>当前借款进度</div>
				</div>
			</WhiteCard>
		);
	}
}
