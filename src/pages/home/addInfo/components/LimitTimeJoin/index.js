/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2020-03-06 11:56:12
 */
import React from 'react';
import ClockS from 'components/TimeDown/ClockS';
import { thousandFormatNum } from 'utils/common';
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
			case 3:
				tipText = '借款直接还到信用卡，秒到账';
				break;
			case 4:
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
			case 8:
				titleDom = (
					<div className={classNM.loan_cont}>
						<p className={classNM.card_loan_text}>最高可借金额（元）</p>
						<p className={classNM.card_loan_amout}>{thousandFormatNum(100000)}</p>
					</div>
				);
				break;
			case 9:
				titleDom = (
					<div className={classNM.loan_cont2}>
						<p className={classNM.card_loan_text2}>信用卡账单多少</p>
						<p className={classNM.card_loan_text2}>申请借款就帮你还多少</p>
					</div>
				);
				break;
			case 10:
				titleDom = (
					<div className={classNM.loan_cont2}>
						<p className={classNM.card_loan_text2}>额度低没关系</p>
						<p className={classNM.card_loan_text2}>按时还款提额快</p>
					</div>
				);
				break;
			case 11:
				titleDom = (
					<div className={classNM.loan_cont3}>
						<p className={classNM.card_loan_text3}>好信用=高额度+低利率</p>
					</div>
				);
				break;
			default:
				titleDom = (
					<div className={classNM.loan_cont}>
						<p className={classNM.card_loan_text}>最高可借金额（元）</p>
						<p className={classNM.card_loan_amout}>{thousandFormatNum(50000)}</p>
					</div>
				);
				break;
		}
		return titleDom;
	};

	renderSubTit = () => {
		const { shuntNum } = this.props;
		let subTitleDom = null;
		switch (shuntNum) {
			case 1:
				subTitleDom = (
					<div className={classNM.text}>
						<p className={classNM.textCont}>您被选为VIP用户，立即参与成功率高</p>
					</div>
				);
				break;
			default:
				subTitleDom = (
					<div className={classNM.text}>
						限时参与 成功率高&nbsp;
						<ClockS count={this.state.count} />
						<span className="jg">:</span>
						{this.state.millisecond < 9 ? <span className="mins">0</span> : <span className="mins">1</span>}
						<span className="mins">{this.state.millisecond}</span>
					</div>
				);
				break;
		}
		return subTitleDom;
	};

	renderDesc = () => {
		const { shuntNum } = this.props;
		let descDom = null;
		switch (shuntNum) {
			case 5:
				descDom = (
					<div className={classNM.descWrap}>
						敏感数据加密传输，且资金流转安全可靠
						<i>{shuntNum}</i>
					</div>
				);
				break;
			case 6:
				descDom = (
					<div className={classNM.descWrap}>
						随行付金融旗下借款还信用卡服务
						<i>{shuntNum}</i>
					</div>
				);
				break;
			case 7:
				descDom = (
					<div className={classNM.descWrap}>
						手头紧，分期慢慢还 &nbsp;&nbsp;&nbsp;&nbsp;手头宽，提前还款有部分优惠
						<i>{shuntNum}</i>
					</div>
				);
				break;
			default:
				descDom = (
					<div className={classNM.descWrap}>
						随行付金融，正规持牌机构，专业帮你还信用卡账单
						<i className={shuntNum > 9 ? classNM.doubleNum : null}>{shuntNum}</i>
					</div>
				);
				break;
		}
		return descDom;
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
