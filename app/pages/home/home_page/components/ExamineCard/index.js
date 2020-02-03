/*
 * @Author: shawn
 * @LastEditTime: 2019-10-29 10:35:41
 */
import React from 'react';
import style from './index.scss';
import WhiteCard from '../WhiteCard';

export default class ExamineCard extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		const { showData, handleClick } = this.props;
		return (
			<WhiteCard showData={showData} handleClick={handleClick}>
				<div
					className={
						showData.type !== 'LN0004' && showData.type !== 'LN0005' && showData.type !== 'LN0012'
							? style.titleBox
							: style.titleBox2
					}
				>
					<div className={style.title}>{showData.subtitle}</div>
					{showData.tel ? <div className={style.tel}></div> : null}
					{showData.desc ? <div className={style.desc}>{showData.desc}</div> : null}
					{showData.highlightText ? (
						<div className={style.desc}>
							您可在<em className={style.highlightText}>{showData.highlightText}</em>再次申请
						</div>
					) : null}
				</div>
				{showData.type !== 'LN0004' && showData.type !== 'LN0005' && showData.type !== 'LN0012' ? (
					<div className={style.bg}>
						<div className={style.line} />
						<div className={style.item}>
							<div className={style.money}>{showData.money}</div>
							<div className={style.dw}>申请借款金额(元) </div>
						</div>
						<div className={style.item}>
							<div className={style.money}>
								{showData.date}
								<span>期</span>
							</div>
							<div className={style.dw}>申请期限</div>
						</div>
					</div>
				) : null}
			</WhiteCard>
		);
	}
}
