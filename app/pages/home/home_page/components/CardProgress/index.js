import React from 'react';
import style from './index.scss';
import WhiteCard from '../WhiteCard';

export default class MoneyCard extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		const { showData, handleClick, cardStatus } = this.props;
		let statusText = null;
		let colorStyle = null;
		switch (
			cardStatus // ，01：爬取中，02：爬取成功，03：爬取失败
		) {
			case '00':
			case '01':
				statusText = '导入中...';
				colorStyle = {
					color: '#397BE6'
				};
				break;
			case '02':
				statusText = '已成功';
				colorStyle = {
					color: '#66C879'
				};
				break;
			case '03':
				statusText = '导入失败';
				colorStyle = {
					color: '#FF6666'
				};
				break;
			default:
				break;
		}
		return (
			<WhiteCard showData={showData} handleClick={handleClick}>
				<div className={style.desc}>
					信息收集<span>需要还款信用卡</span>
				</div>
				<div className={style.status} style={colorStyle}>
					{statusText}
				</div>
			</WhiteCard>
		);
	}
}
