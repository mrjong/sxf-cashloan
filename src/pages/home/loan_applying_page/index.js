/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2020-04-26 18:33:57
 */
import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import ExamineComponents from 'components/ExamineComponents';
import ZButton from 'components/ButtonCustom';
import { Progress } from 'antd-mobile';
import qs from 'qs';
import { FixedBar } from 'components';
import Images from 'assets/image';
import { connect } from 'react-redux';
import { setCredictInfoAction } from 'reduxes/actions/commonActions';
import { loan_queryLoanAdvanceSts } from 'fetch/api';

let queryData = {};
let timer = null;

@setBackGround('#fff')
@fetch.inject()
@connect(
	(state) => ({
		userInfo: state.staticState.userInfo,
		authId: state.staticState.authId
	}),
	{
		setCredictInfoAction
	}
)
export default class loan_applying_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			queryData: {},
			isAppOpen: false,
			isPlus: false,
			percent: 0,
			status: 'waiting',
			retryNum: 0
		};
	}
	componentWillMount() {
		queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		const that = this;
		if (queryData && queryData.isPlus) {
			this.setState({
				isAppOpen: true,
				isPlus: queryData.isPlus
			});
		} else {
			document.addEventListener('message', that.checkAppOpen);
		}
		if (queryData && queryData.showType === 'timeout') {
			this.clearCountDown();
			this.setState({
				status: 'timeout'
			});
		} else {
			this.startStep(150);
		}
	}
	componentWillUnmount() {
		const that = this;
		this.clearCountDown();
		if (queryData && queryData.isPlus) {
			this.setState({
				isAppOpen: false,
				isPlus: false
			});
		} else {
			document.removeEventListener('message', that.checkAppOpen);
		}
	}

	// 检查是否是app webview打开
	checkAppOpen = (e) => {
		const that = this;
		const passData = JSON.parse(e.data);
		that.setState({
			isAppOpen: passData && passData.isAppOpen,
			isPlus: passData && passData.isPlus
		});
	};

	// 查询进度
	checkStatus = () => {
		const { isAppOpen } = this.state;
		this.props.$fetch
			.post(loan_queryLoanAdvanceSts, {
				loanAdvanceNo: (queryData && queryData.advanceNum) || ''
			})
			.then((res) => {
				if (res && res.code === '000000' && res.data !== null) {
					// 00：处理中；01：处理成功；02：处理失败
					if (res.data && res.data.res === '01') {
						this.clearCountDown();
						// 返回结果
						this.setState(
							{
								status: 'success'
							},
							() => {
								// 注意测试与app交互
								if (isAppOpen) {
									this.sendMsgToApp(res.data);
								} else {
									setTimeout(() => {
										this.jumpResultPage(res.data);
									}, 2000);
								}
							}
						);
					}
				} else {
					this.props.toast.info(res.message);
				}
			});
	};

	// 查看结果
	checkResult = () => {
		let retryNum = this.state.retryNum;
		this.setState(
			{
				percent: 0,
				status: 'waiting',
				retryNum: (retryNum += 1)
			},
			() => {
				this.startStep(150);
			}
		);
	};

	// 与app交互
	sendMsgToApp = (msg) => {
		const { isPlus } = this.state;
		setTimeout(() => {
			if (isPlus) {
				window.ReactNativeWebView.postMessage(
					JSON.stringify({
						resMsg: msg,
						resDesc: 'resultPage'
					})
				);
			} else {
				window.postMessage(
					JSON.stringify({
						resMsg: msg,
						resDesc: 'resultPage'
					}),
					() => {}
				);
			}
		}, 0);
	};

	// 跳转到对应状态页面
	jumpResultPage = (res) => {
		switch (res.code) {
			case '00':
				// 正常放款中
				this.props.history.push({
					pathname: '/home/loan_apply_succ_page',
					search: `?title=预计60秒完成放款`
				});
				break;
			case '01':
				// 人审
				this.props.history.push({
					pathname: '/home/loan_person_succ_page',
					search: `?creadNo=${res.credNo}`
				});
				break;
			case '02':
				// 机审
				this.props.history.push({
					pathname: '/home/loan_robot_succ_page',
					search: `?telNo=${res.telNo}`
				});
				break;
			case '03':
				// 被拒
				this.props.history.push('/home/home');
				break;
			case '04':
				// 额度不满足
				this.props.setCredictInfoAction(res);
				this.props.history.push({
					pathname: '/home/lend_confirm_page'
				});
				break;
			default:
				break;
		}
	};

	// 走进度条
	startStep = (num) => {
		const { retryNum } = this.state;
		this.clearCountDown();
		let percent = this.state.percent;
		timer = setInterval(() => {
			this.setState(
				{
					percent: (percent += 1)
				},
				() => {
					// todo 掉用接口查询
					if (percent % 20 === 0) {
						// this.checkStatus();
					}
					if (percent > 100) {
						this.clearCountDown();
						this.setState({
							status: retryNum >= 2 ? 'timeout' : 'fail'
						});
					}
				}
			);
		}, num);
	};

	clearCountDown = () => {
		clearInterval(timer);
	};

	render() {
		const { isAppOpen, isPlus, percent, status } = this.state;
		return (
			<div className={style.loan_applying_page}>
				{status === 'waiting' && (
					<div>
						<div className={style.topImg}>
							<ExamineComponents />
						</div>
						<div className="loan_applying_progress">
							<Progress
								barStyle={{ borderColor: '#56BC44' }}
								style={{ backgroundColor: '#F0F1F5' }}
								percent={percent}
								position="normal"
							/>
							{/* 6.1为进度条的长度610px */}
							<span
								className={style.percentNum}
								style={{ transform: `translateX(calc(${(percent / 100) * 6.1}rem - 0.28rem))` }}
							>
								{percent}%
							</span>
							<span className={style.percentDesc}>预计5到15秒</span>
						</div>
					</div>
				)}

				{/* 结果状态显示 */}
				{status === 'fail' && (
					<div className={style.result_wrap}>
						<div className={style.contentWrap}>
							<img src={Images.adorn.waiting_ico} className={style.statusIco} />
							<p className={style.statusDesc}>提交中…</p>
						</div>
						<div className="loan_applying_progress">
							<Progress
								barStyle={{ borderColor: '#56BC44' }}
								style={{ backgroundColor: '#F0F1F5' }}
								percent={100}
								position="normal"
							/>
							<span className={style.successDesc}>已完成100%</span>
						</div>
						<ZButton onClick={this.checkResult} className={style.submitBtn}>
							查看结果
						</ZButton>
					</div>
				)}

				{status === 'success' && (
					<div className={style.result_wrap}>
						<div className={style.contentWrap}>
							<img src={Images.adorn.success} className={style.statusIco} />
							<p className={style.statusDesc}>提交成功</p>
						</div>
						<div className="loan_applying_progress">
							<Progress
								barStyle={{ borderColor: '#56BC44' }}
								style={{ backgroundColor: '#F0F1F5' }}
								percent={100}
								position="normal"
							/>
							<span className={style.successDesc}>已完成100%</span>
						</div>
					</div>
				)}

				{status === 'timeout' && (
					<div className={style.result_wrap}>
						<div className={style.contentWrap}>
							<img src={Images.adorn.waiting_ico} className={style.statusIco} />
							<p className={[style.statusDesc, style.statusDesc2].join(' ')}>等待审核…</p>
						</div>
						<div className={style.step_box_new}>
							<div className={[style.step_item, style.active].join(' ')}>
								<div className={style.title}>
									<div className={style.step_circle} />
									借款申请提交成功
								</div>
								<div className={style.line} />
							</div>
							<div className={[style.step_item].join(' ')}>
								<div className={style.title}>
									<div className={style.step_circle} />
									等待放款审核
								</div>
								<div className={style.line} />
							</div>
						</div>
					</div>
				)}

				{/* 吸底条 */}
				<FixedBar isAppOpen={isAppOpen} isPlus={isPlus} />
			</div>
		);
	}
}
