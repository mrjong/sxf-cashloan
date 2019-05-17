import React from 'react';
import style from './index.scss';
import ZButton from 'components/ButtonCustom';

export default class DCCard extends React.Component {
	constructor(props) {
		super(props);
	}
	componentWillMount() {}
	render() {
		const { showData } = this.props;
		const iconClass = showData.bankNo ? `bank_ico_${bankNo}` : 'logo_ico';
		return (
			<div className={style.box}>
				<div className={style.title}>
					<i className={[ 'bank_ico', iconClass, `${style.bankLogo}` ].join(' ')} />
					{showData.title}
				</div>
				<div className={style.subtitle}>
					<i />
					{showData.subtitle}
				</div>
				<div className={style.money}>{showData.money}</div>
				<div className={style.desc}>{showData.desc}</div>
				<ZButton className={style.submitBtn}>{showData.btnText}</ZButton>
			</div>
		);
	}
}
