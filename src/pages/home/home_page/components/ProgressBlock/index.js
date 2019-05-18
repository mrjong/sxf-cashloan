import React from 'react';
import style from './index.scss';
import ZButton from 'components/ButtonCustom';
import SvgCirPro from 'components/CircleProgress/svgCirPro';
import DCBox from '../DCBox';
const showData = {
	title: '还到-基础版',
	btxText: '888'
};
export default class ProgressBlock extends React.Component {
	constructor(props) {
		super(props);
	}
	componentWillMount() {}
	render() {
		return (
			<DCBox showData={showData}>
				<div className={style.circle_box}>
					<SvgCirPro
						percent={90}
						radius={50}
						borderWidth={5}
						smallradius
						textStyle={{ fontSize: 12, color: '#fa9a22', textAlign: 'center' }}
						color="#61ebff"
					/>
					<div className={style.desc}>当前借款进度</div>
				</div>
			</DCBox>
		);
	}
}
