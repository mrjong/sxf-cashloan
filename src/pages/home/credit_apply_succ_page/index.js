import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import ExamineComponents from 'components/ExamineComponents';
import { setBackGround } from 'utils/background';
import qs from 'qs';
import { store } from 'utils/store';
import TimeoutPayModal from 'components/TimeoutPayModal';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
let autId = '';
const API = {
	isBankCard: '/my/chkCard', // 是否绑定了银行卡
	chkCredCard: '/my/chkCredCard' // 查询信用卡列表中是否有授权卡
};
@fetch.inject()
@setBackGround('#fff')
export default class credit_apply_succ_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			showTimeoutPayModal: false,
			isAppOpen: false // 是否是app webview打开
		};
	}
	componentWillMount() {
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		autId = query && query.autId;
		const that = this;
		document.addEventListener('message', that.checkAppOpen);
	}
	componentWillUnmount() {
		const that = this;
		document.removeEventListener('message', that.checkAppOpen);
	}
	// 判断是否绑卡
	checkIsBandCard = () => {
		const { isAppOpen } = this.state;
		buriedPointEvent(home.assessingBindCard);
		if (isAppOpen) {
			setTimeout(() => {
				window.postMessage('判断是否绑卡', () => {});
			}, 0);
			return;
		}
		const api = autId ? `${API.chkCredCard}/${autId}` : API.isBankCard;
		this.props.$fetch.get(api).then((result) => {
			// 跳转至储蓄卡
			if (result && result.msgCode === 'PTM2003') {
				store.setCheckCardRouter('checkCardRouter');
				this.props.toast.info(result.msgInfo);
				store.setBackUrl('/home/home');
				setTimeout(() => {
					this.props.history.replace({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
				}, 3000);
			} else if (result && result.msgCode === 'PTM2002') {
				store.setCheckCardRouter('checkCardRouter');
				this.props.toast.info(result.msgInfo);
				store.setBackUrl('/home/home');
				setTimeout(() => {
					this.props.history.replace({
						pathname: '/mine/bind_credit_page',
						search: `?noBankInfo=true&autId=${autId}`
					});
				}, 3000);
			} else {
				this.props.history.push('/home/home');
			}
		});
	};
	// 检查是否是app webview打开
	checkAppOpen = (e) => {
		const that = this;
		const passData = JSON.parse(e.data);
		that.setState({
			isAppOpen: passData && passData.isAppOpen
		});
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
								<i />
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
			</div>
		);
	}
}
