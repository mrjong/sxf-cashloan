import React from 'react';
import style from './index.scss';
import ZButton from 'components/ButtonCustom';

export default class DCCard extends React.Component {
	constructor(props) {
		super(props);
	}
	componentWillMount() {}
	render() {
		const { showData, children, handleClick, noLogoBtn } = this.props;
		const iconClass = showData && showData.bankNo ? `bank_ico_${showData.bankNo}` : 'logo_ico';
		return (
			<div className={noLogoBtn ? `${style.box_container} ${style.box_container_spe}`: style.box_container}>
				{showData.topTip ? <div className={style.topTip}>{showData.topTip}</div> : null}
				<div className={style.box}>
					{!noLogoBtn &&
						<div className={style.title}>
							<i className={[ 'bank_ico', iconClass, `${style.bankLogo}` ].join(' ')} />
							{showData.title}
							{showData.cardNoHid ? <span class={style.lastCode}> ({showData.cardNoHid})</span> : null}
						</div>
					}
					{children}
					{!noLogoBtn &&
						<ZButton onClick={handleClick} className={style.submitBtn}>
							{showData.btnText}
						</ZButton>
					}
				</div>
			</div>
		);
	}
}
