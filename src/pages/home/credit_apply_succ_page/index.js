import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import ExamineComponents from 'components/ExamineComponents';
import { setBackGround } from 'utils/background';
import qs from 'qs';
import TimeoutPayModal from 'components/TimeoutPayModal';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import { NoticeBar } from 'antd-mobile';
import { bank_card_check_func } from 'utils/CommonUtil/getNextStatus';
import Image from 'assets/image';
let query = {};

@fetch.inject()
@setBackGround('#fff')
export default class credit_apply_succ_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			showTimeoutPayModal: false,
			isAppOpen: false, // 是否是app webview打开
			isPlus: false
		};
	}
	componentWillMount() {
		query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		const that = this;
		if (query && query.isPlus) {
			this.setState({
				isAppOpen: true,
				isPlus: query.isPlus
			});
		} else {
			document.addEventListener('message', that.checkAppOpen);
		}
	}
	componentWillUnmount() {
		const that = this;
		if (query && query.isPlus) {
			this.setState({
				isAppOpen: false,
				isPlus: false
			});
		} else {
			document.removeEventListener('message', that.checkAppOpen);
		}
	}
	// 判断是否绑卡
	checkIsBandCard = () => {
		const { isAppOpen } = this.state;
		buriedPointEvent(home.assessingBindCard);
		if (isAppOpen) {
			setTimeout(() => {
				window.ReactNativeWebView.postMessage('判断是否绑卡');
			}, 0);
			return;
		}
		// const api = autId ? `${API.chkCredCard}/${autId}` : API.isBankCard;
		let query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		let autId = query && query.autId;
		bank_card_check_func({ $props: this.props, autId, hideToast: true }).then((res) => {
			if (res === '1') {
				this.props.history.push('/home/home');
			}
		});
	};
	// 检查是否是app webview打开
	checkAppOpen = (e) => {
		const passData = JSON.parse(e.data);
		if (passData && passData.errorMsg) {
			this.props.toast.info(passData.errorMsg);
		} else {
			this.setState({
				isAppOpen: passData && passData.isAppOpen
			});
		}
	};
	render() {
		return (
			<div className={style.remit_ing_page}>
				<div className={style.topImg}>
					<ExamineComponents />
				</div>
				<div className={style.topBox}>
					<div className={style.title}>预计最快90秒完成审核</div>
					<div className={style.subtitle}>高峰期可能5分钟左右</div>
				</div>
				<div className={style.step_box_new}>
					<div className={[style.step_item, style.active].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							快速评估中
						</div>
						<div className={style.line} />
					</div>
					<div className={[style.step_item].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							绑定还款储蓄卡
							<a
								onClick={() => {
									this.checkIsBandCard();
								}}
							>
								先去绑卡
							</a>
						</div>
						<div className={style.line} />
					</div>
					<div className={[style.step_item].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							获得额度签约借款
						</div>
						{/* <div className={style.line} /> */}
						<div className={style.dash_line} />
					</div>
					<div className={[style.step_item].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							审核超时即得免息券
							<span
								className={style.wenhao}
								onClick={() => {
									this.setState({
										showTimeoutPayModal: true
									});
								}}
							>
								<img src={Image.icon.icon_question} alt="" />
							</span>
						</div>
					</div>
				</div>
				<TimeoutPayModal
					visible={this.state.showTimeoutPayModal}
					closeModal={() => {
						this.setState({
							showTimeoutPayModal: false
						});
					}}
				/>
				<div className={style.fix_bottom}>
					<p className={style.fix_bottom_tip}>关注“还到”公众号查看授信进度</p>
					<NoticeBar
						marqueeProps={{
							loop: true,
							leading: 1000,
							trailing: 1000,
							style: { color: '#B69254', fontSize: '0.22rem' }
						}}
						icon={null}
					>
						长时间没有评估结果可联系客服，最长不超过3天
					</NoticeBar>
				</div>
			</div>
		);
	}
}
