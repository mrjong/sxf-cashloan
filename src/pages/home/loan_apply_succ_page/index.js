import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import ExamineComponents from 'components/ExamineComponents';
import ZButton from 'components/ButtonCustom';
import { Modal } from 'antd-mobile';
import qs from 'qs';
import { checkEngaged, checkIsEngagedUser } from 'utils';
import successImg from './img/success.png';
import failImg from './img/fail.png';
import btnImg from './img/btn.png';
import ACTipAlert from 'components/ACTipAlert';
import message from './img/message.png';
import { buriedPointEvent } from 'utils/analytins';
import { activity, home } from 'utils/analytinsType';

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
			time: 0
		};
	}
	componentWillMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		this.setState(
			{
				queryData
			},
			() => {
				this.getAC618(queryData);
			}
		);
		buriedPointEvent(home.quickLoan);
	}
	getAC618 = async (queryData) => {
		if (queryData.needAlert) {
			let ischeckEngaged = await checkEngaged({
				$props: this.props,
				AcCode: 'AC20190618_618'
			});
			if (ischeckEngaged.msgCode === 'PTM0000') {
				let ischeckIsEngagedUser = await checkIsEngagedUser({
					$props: this.props,
					AcCode: 'AC20190618_618'
				});
				if (
					ischeckIsEngagedUser.msgCode === 'PTM0000' &&
					ischeckIsEngagedUser.data &&
					ischeckIsEngagedUser.data.isEngagedUser === '0'
				) {
					if (
						ischeckIsEngagedUser.data.joinActivityTm <= 10 * 60 &&
						queryData.perdCnt &&
						Number(queryData.perdCnt) >= 3 &&
						queryData.cardBillAmt &&
						Number(queryData.cardBillAmt) >= 3000
					) {
						this.setState({
							successModalShow: true,
							time: this.formatSeconds(ischeckIsEngagedUser.data.joinActivityTm)
						});
					} else if (ischeckIsEngagedUser.data.joinActivityTm <= 10 * 60) {
						this.setState({
							ACTipAlertShow: true
						});
					} else if (ischeckIsEngagedUser.data.joinActivityTm <= 15 * 60) {
						this.setState({
							failModalShow: true,
							time: this.formatSeconds(ischeckIsEngagedUser.data.joinActivityTm)
						});
					}
				}
			}
		}
	};
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

	render() {
		const { queryData, ACTipAlertShow, successModalShow, failModalShow, time } = this.state;
		return (
			<div className={style.remit_ing_page}>
				<div className={style.topImg}>
					<ExamineComponents />
				</div>
				<div className={style.topBox}>
					<div className={style.title}>{queryData.title}</div>
					<div className={style.subtitle}>
						{queryData.desc}
						<a href="tel:400-088-7626">联系客服</a>
					</div>
				</div>
				<div className={style.step_box_new}>
					<div className={[ style.step_item, style.active ].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							借款申请提交成功
						</div>
						<div className={style.line} />
					</div>
					<div className={[ style.step_item ].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							借款打入信用卡
						</div>
						<div className={style.line} />
					</div>
				</div>
				<Modal className="loan_apply_succ_alert" visible={successModalShow} transparent>
					<img src={successImg} className={style.successImg} />
					<div className={style.successTitle}>恭喜获得</div>
					<div className={style.successTime}>总用时：{time}</div>
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
					<div className={style.failTime}>总用时：{time}</div>
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

				<ZButton
					onClick={() => {
						buriedPointEvent(home.gotIt);
						this.props.history.push('/home/home');
					}}
					className={style.submitBtn}
				>
					我知道了
				</ZButton>
			</div>
		);
	}
}
