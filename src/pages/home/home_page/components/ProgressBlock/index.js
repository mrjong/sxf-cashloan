import React from 'react';
import style from './index.scss';
import ZButton from 'components/ButtonCustom';
import SvgCirPro from 'components/CircleProgress/svgCirPro';

export default class DCCard extends React.Component {
	constructor(props) {
		super(props);
	}
	componentWillMount() {}
	render() {
		const iconClass = 'logo_ico';
		return (
			<div className={style.box_container}>
			<div className={style.box}>
					<div className={style.title}>
						<i className={[ 'bank_ico', iconClass, `${style.bankLogo}` ].join(' ')} />
						还到-基础版
					</div>
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
					<ZButton className={style.submitBtn}>继续确认身份信息</ZButton>
				</div>
			</div>
		);
	}
}
