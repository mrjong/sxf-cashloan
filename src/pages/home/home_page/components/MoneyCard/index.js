import React from 'react';
import style from './index.scss';
import WhiteCard from '../WhiteCard';

export default class MoneyCard extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		const { showData, handleClick } = this.props;
		return (
			<WhiteCard showData={showData} handleClick={handleClick}>
				<div className={style.subtitle}>
					<i />
					{showData.subtitle}
				</div>
				<div className={style.money} style={{ color: showData.color && showData.color }}>
					{showData.money ? Number(showData.money).toFixed(2) : '0.00'}
				</div>
				<div className={style.desc}>{showData.desc}</div>
			</WhiteCard>
		);
	}
}