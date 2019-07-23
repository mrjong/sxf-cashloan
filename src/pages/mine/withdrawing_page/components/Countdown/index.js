import React from 'react';
import style from './index.scss';
import fetch from 'sx-fetch-rjl';

const API = {
	queryOrdSts: '/redAccount/queryOrdSts' // 付款结果查询接口
};
@fetch.inject()
export default class Countdown extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			timerCount: this.props.timerCount || 5, // 为了配合测试，暂时将5改成10s
			counting: false,
			selfEnable: true
		};
	}

	componentWillMount() {
		this.countDownAction();
	}

	// 付款结果查询
	getOrdSts = () => {
		const { cb, applyNo, accountNum } = this.props;
		this.props.$fetch.post(API.queryOrdSts, { applyNo: applyNo }, { hideLoading: true }).then(
			(result) => {
				if (result.msgCode !== 'PTM0000') {
					result.msgInfo && cb.props.toast.info(result.msgInfo);
					return;
				}
				if (result && result.data !== null) {
					switch (
						result.data // 订单状态0：初登记，1：处理中，2：交易成功，3：交易失败，4：撤销
					) {
						case '2': // 交易成功
							cb.props.history.replace({
								pathname: '/mine/withdraw_succ_page',
								state: { withdrawMoney: accountNum }
							});
							break;
						case '3': // 交易失败
							cb.props.history.replace('/mine/withdraw_fail_page');
							break;
						default:
							break;
					}
				}
			},
			(err) => {
				err.msgInfo && cb.props.toast.info(err.msgInfo);
			}
		);
	};

	countDownAction = () => {
		const { cb } = this.props;
		let codeTime = this.state.timerCount;
		this.interval = setInterval(() => {
			this.setState(
				{
					timerCount: codeTime--
				},
				() => {
					this.getOrdSts();
				}
			);
			if (codeTime === -1) {
				/* 倒计时结束*/
				this.interval && clearInterval(this.interval);
				cb.props.history.replace('/mine/withdraw_page');
				if (this.props.timerEnd) {
					this.props.timerEnd();
				}
			}
		}, 1000);
	};

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	render() {
		const { counting, timerCount, selfEnable } = this.state;
		return (
			<div className={style.Countdown_page}>
				<div className={style.CountdownCont}>{timerCount}s</div>
			</div>
		);
	}
}
