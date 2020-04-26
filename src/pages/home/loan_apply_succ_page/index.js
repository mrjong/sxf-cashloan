import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import ExamineComponents from 'components/ExamineComponents';
import ZButton from 'components/ButtonCustom';
import { Modal } from 'antd-mobile';
import qs from 'qs';
import successImg from './img/success.png';
import failImg from './img/fail.png';
import btnImg from './img/btn.png';
import ACTipAlert from 'components/ACTipAlert';
import { buriedPointEvent } from 'utils/analytins';
import { activity, home } from 'utils/analytinsType';
import CouponModal from 'components/CouponModal';
import { isShowCouponModal, closeCouponModal } from './common';
import { FixedBar } from 'components';
let queryData = {};
@setBackGround('#fff')
@fetch.inject()
export default class remit_ing_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			queryData: {},
			ACTipAlertShow: false,
			successModalShow: false,
			failModalShow: false,
			time: 0,
			isAppOpen: false,
			isPlus: false,
			couponModalShow: false
		};
	}
	componentWillMount() {
		isShowCouponModal(this);
		queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData && queryData.prodType && queryData.prodType === '21') {
			this.props.setTitle('快速打款中');
		}
		this.setState({
			queryData
		});
		buriedPointEvent(home.quickLoan);
		const that = this;
		if (queryData && queryData.isPlus) {
			this.setState({
				isAppOpen: true,
				isPlus: queryData.isPlus
			});
		} else {
			document.addEventListener('message', that.checkAppOpen);
		}
	}
	componentWillUnmount() {
		const that = this;
		if (queryData && queryData.isPlus) {
			this.setState({
				isAppOpen: false,
				isPlus: false
			});
		} else {
			document.removeEventListener('message', that.checkAppOpen);
		}
	}
	formatSeconds = (count = 0) => {
		let seconds = count % 60;
		let minutes = Math.floor(count / 60);

		if (seconds < 10) {
			seconds = '0' + seconds;
		}

		if (minutes < 10) {
			minutes = '0' + minutes;
		}

		return `${minutes}:${seconds}`;
	};
	closeBtnFunc = (type) => {
		buriedPointEvent(activity.jd618ResultModalClick, {
			modalType: type
		});
		let queryData2 = this.state.queryData;
		delete queryData2.needAlert;
		this.setState(
			{
				ACTipAlertShow: false,
				successModalShow: false,
				failModalShow: false
			},
			() => {
				this.props.history.replace({
					pathname: '/home/loan_apply_succ_page',
					search: `?${qs.stringify(queryData2)}`
				});
			}
		);
	};

	// 检查是否是app webview打开
	checkAppOpen = (e) => {
		const that = this;
		const passData = JSON.parse(e.data);
		that.setState({
			isAppOpen: passData && passData.isAppOpen,
			isPlus: passData && passData.isPlus
		});
	};

	render() {
		const {
			queryData,
			ACTipAlertShow,
			successModalShow,
			failModalShow,
			time,
			isAppOpen,
			isPlus,
			couponModalShow
		} = this.state;
		return (
			<div className={style.remit_ing_page}>
				<div className={style.topImg}>
					<ExamineComponents />
				</div>
				<div className={style.topBox}>
					<div className={style.title}>{queryData.title}</div>
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
							{queryData && queryData.prodType && queryData.prodType === '21'
								? '借款打入银行卡'
								: '自动放款信用卡'}
						</div>
						<div className={style.line} />
					</div>
				</div>
				<Modal className="loan_apply_succ_alert" visible={successModalShow} transparent>
					<img src={successImg} className={style.successImg} />
					<div className={style.successTitle}>恭喜获得</div>
					<div className={style.successTime}>
						总用时：
						{time}
					</div>
					<img
						src={btnImg}
						onClick={() => {
							this.closeBtnFunc('success');
						}}
						className={style.btnImg}
					/>
				</Modal>
				<Modal className="loan_apply_succ_alert" visible={failModalShow} transparent>
					<img src={failImg} className={style.successImg} />
					<div className={style.failTitle}>很遗憾，您已超时</div>
					<div className={style.failTime}>
						总用时：
						{time}
					</div>
					<img
						src={btnImg}
						onClick={() => {
							this.closeBtnFunc('timeout');
						}}
						className={style.btnImg2}
					/>
				</Modal>

				<ACTipAlert
					ACTipAlertShow={ACTipAlertShow}
					resetProps={{
						title: '温馨提示',
						desc: '由于您的借款不符合获奖规则 故无法获得奖励，再接再厉吧～',
						closeBtnFunc: () => {
							this.closeBtnFunc('fail');
						}
					}}
				/>

				{/* 首贷首期用户-还款券测试 */}
				<CouponModal
					visible={couponModalShow}
					onConfirm={() => {
						closeCouponModal(this);
					}}
					couponData={queryData && queryData.couponInfo}
				/>
				<ZButton
					onClick={() => {
						buriedPointEvent(home.gotIt);
						if (isAppOpen) {
							setTimeout(() => {
								if (isPlus) {
									window.ReactNativeWebView.postMessage('我知道了');
								} else {
									window.postMessage('我知道了', () => {});
								}
							}, 0);
						} else {
							this.props.history.push('/home/home');
						}
					}}
					className={style.submitBtn}
				>
					我知道了
				</ZButton>
				<p className={style.bottom_tip}>关注还到公众号 实时查看审核进度</p>
				{/* 吸底条 */}
				<FixedBar isAppOpen={isAppOpen} isPlus={isPlus} />
			</div>
		);
	}
}
