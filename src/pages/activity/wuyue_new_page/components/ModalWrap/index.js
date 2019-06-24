import React, { Component } from 'react';
import { Modal } from 'antd-mobile';
import style from './index.scss';
import LoginAlert from '../LoginAlert';
import TipsComponent from '../TipsComponent';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';

export default class ModalWrap extends Component {
	constructor(props) {
		super(props);
		this.state = {
			modalShow: true
		};
	}

	render() {
		let componentsDisplay = null;
		const { modalShow } = this.state;
		const { history, contType, loginCb, closeCb, hasLoginCb, recordActCb } = this.props;
		switch (contType) {
			case 'login_alert': // 登陆弹框
				componentsDisplay = <LoginAlert history={history} hasLoginCb={hasLoginCb} loginCb={loginCb} />;
				break;
			case 'new_sorry_tips': // 老用户参加新用户活动提示弹框
				componentsDisplay = (
					<TipsComponent
						history={history}
						tipsTit="抱歉"
						tipsCont="本活动仅针对新用户哦～"
						btnText="马上抽50000元老用户专享大奖"
						clickCb={() => {
							buriedPointEvent(activity.mayNewToOldBtn);
							this.props.history.replace('/activity/wuyue_old_page');
						}}
					/>
				);
				break;
			case 'old_sorry_tips': // 新用户参加老用户活动提示弹框
				componentsDisplay = (
					<TipsComponent
						history={history}
						tipsTit="抱歉"
						tipsCont="本活动仅针对已注册用户哦～"
						btnText="注册并马上领取新用户专享奖励"
						clickCb={() => {
							buriedPointEvent(activity.mayOldToNewBtn);
							this.props.history.replace('/activity/wuyue_new_page');
						}}
					/>
				);
				break;
			case 'no_chance_tips': // 抽奖机会已用完提示弹框
				componentsDisplay = (
					<TipsComponent
						history={history}
						tipsTit="温馨提示"
						tipsCont="您的抽奖机会已用完，不要贪心哦～"
						btnText="知道了"
						clickCb={() => {
							buriedPointEvent(activity.mayOldNoChanceBtn);
							this.props.history.push('/home/home');
						}}
					/>
				);
				break;
			case 'no_award_tips': // 奖励发放完毕提示弹框
				componentsDisplay = (
					<TipsComponent
						history={history}
						tipsTit="温馨提示"
						tipsCont="今日活动奖励已经发放完毕，<br />奖品有限，先到先得，请明日再来"
						btnText="知道了"
						clickCb={() => {
							buriedPointEvent(activity.mayOldNoPrizeBtn);
							this.props.history.push('/home/home');
						}}
					/>
				);
				break;
			case 'no_qualified_tips': // 需要填写认证资料提示弹框
				componentsDisplay = (
					<TipsComponent
						history={history}
						tipsTit="温馨提示"
						tipsCont="您需要先认证并授信成功后，<br />才能参加活动哦～"
						btnText="填写认证资料"
						clickCb={() => {
							recordActCb && recordActCb();
							buriedPointEvent(activity.mayOldAuthTipsBtn);
							this.props.history.push('/home/home');
						}}
					/>
				);
				break;
			default:
				break;
		}
		return (
			<Modal
				className="alert_wrap_modal"
				visible={modalShow}
				transparent
				// onClose={this.onClose('modalShow')}
			>
				<div className={style.modal_wrap_style}>
					<i
						onClick={() => {
							closeCb();
						}}
						className={style.close_icon}
					/>
					{componentsDisplay}
				</div>
			</Modal>
		);
	}
}
