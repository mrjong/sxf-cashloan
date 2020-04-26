/*
 * @Author: sunjiankun
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-03-23 11:29:39
 */
import React from 'react';
import ClockS from 'components/TimeDown/ClockS';
import { thousandFormatNum } from 'utils/common';
import { buriedPointEvent } from 'utils/analytins';
import { addinfo } from 'utils/analytinsType';

import left_bg from './img/left_bg.png';

import classNM from './index.scss';

let timedown = null;

export default class LimitTimeJoin extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			count: 0,
			status: 'stopped',
			millisecond: 0
		};
	}

	componentDidMount() {
		const { shuntNum } = this.props;
		buriedPointEvent(addinfo.DC_ADDINFO_LOAD_YELLOW_CARD, {
			planNum: shuntNum
		});
		if (shuntNum !== 1) {
			this.handleSetCountDown(60 * 60);
			this.getMillisecond();
			this.startTimer();
		}
	}

	componentWillUnmount() {
		timedown && clearInterval(timedown);
		this.timer && clearInterval(this.timer);
	}

	handleSetCountDown = (totalSeconds) => {
		this.setState({
			count: totalSeconds,
			status: 'started'
		});
	};

	getMillisecond = () => {
		setTimeout(() => {
			timedown = setInterval(() => {
				if (Number(this.state.millisecond) > 8) {
					this.setState({
						millisecond: 0
					});
				} else {
					this.setState({
						millisecond: this.state.millisecond + 1
					});
				}
			}, 100);
		}, 0);
	};

	startTimer() {
		this.timer = setInterval(() => {
			const newCount = this.state.count - 1;
			this.setState({
				count: newCount >= 0 ? newCount : 0
			});
			if (newCount === 0) {
				this.setState({
					status: 'stopped'
				});
			}
		}, 1000);
	}

	renderTip = () => {
		const { shuntNum } = this.props;
		let tipText = null;
		switch (shuntNum) {
			case 14:
				tipText = '有账单的信用卡即可借款';
				break;
			default:
				tipText = '30秒审批，秒到账';
				break;
		}
		return tipText;
	};

	renderTitle = () => {
		const { shuntNum } = this.props;
		let titleDom = null;
		switch (shuntNum) {
			case 12:
				titleDom = (
					<div className={classNM.loan_cont2}>
						<p className={classNM.card_loan_text2}>按时还款提额快</p>
						<p className={classNM.card_loan_text2}>提前还款有部分优惠</p>
					</div>
				);
				break;
			case 13:
				titleDom = (
					<div className={classNM.loan_cont2}>
						<p className={classNM.card_loan_text2}>凭有账单的信用卡</p>
						<p className={classNM.card_loan_text2}>即可借款</p>
					</div>
				);
				break;
			case 14:
				titleDom = (
					<div className={classNM.loan_cont}>
						<p className={classNM.card_loan_text}>借款高至(元)</p>
						<p className={classNM.card_loan_amout}>{thousandFormatNum(50000)}</p>
					</div>
				);
				break;
			default:
				titleDom = (
					<div className={classNM.loan_cont}>
						<p className={classNM.card_loan_text}>借款高至(元)</p>
						<p className={classNM.card_loan_amout}>{thousandFormatNum(50000)}</p>
					</div>
				);
				break;
		}
		return titleDom;
	};

	renderSubTit = () => {
		return (
			<div className={classNM.text}>
				限时参与 成功率高&nbsp;
				<ClockS count={this.state.count} />
				<span className="jg">:</span>
				{this.state.millisecond < 9 ? <span className="mins">0</span> : <span className="mins">1</span>}
				<span className="mins">{this.state.millisecond}</span>
			</div>
		);
	};

	renderDesc = () => {
		const { shuntNum } = this.props;
		return (
			<div className={classNM.descWrap}>
				敏感数据加密传输，且资金流转安全可靠
				<i className={shuntNum > 9 ? classNM.doubleNum : null}>{shuntNum}</i>
			</div>
		);
	};

	render() {
		return (
			<div className={classNM.limit_time_join_wrap}>
				<div className={classNM.cardWrap}>
					<div className={classNM.card_tip_box}>
						<img src={left_bg} alt="ico" className={classNM.leftPartStyle} />
						<span className={classNM.card_tip}>{this.renderTip()}</span>
					</div>
					{this.renderTitle()}
					{this.renderSubTit()}
				</div>
				{this.renderDesc()}
			</div>
		);
	}
}
