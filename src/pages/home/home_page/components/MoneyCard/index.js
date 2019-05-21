import React from 'react';
import style from './index.scss';
import WhiteCard from '../WhiteCard';

export default class MoneyCard extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		const { showData, handleClick, noLogoBtn, ...restProps } = this.props;
		return (
			<WhiteCard showData={showData} noLogoBtn={noLogoBtn} handleClick={handleClick} {...restProps}>
				<div className={style.box}>
					<div className={style.flex1}>
						<div className={style.subtitle}>
							<i />
							{showData.subtitle}
						</div>
						<div className={style.money} style={{ color: showData.color && showData.color }}>
							{showData.money ? showData.money : '----.--'}
						</div>
					</div>
					{showData.money2 ? (
						<div className={style.flex1}>
							<div className={style.subtitle}>
								<i />
								{showData.subtitle2}
							</div>
							<div
								className={[ style.money, style.small ].join(' ')}
								style={{ color: showData.color && showData.color }}
							>
								{showData.money2}
							</div>
						</div>
					) : null}
				</div>
				<div className={style.desc}>{showData.desc}</div>
			</WhiteCard>
		);
	}
}
