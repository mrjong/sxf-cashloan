import React, { Component } from 'react';
import style from './index.scss';
export default class RuleShow extends Component {
	componentWillMount() {}
	render() {
		let { ruleDesc } = this.props;
		ruleDesc = ruleDesc.replace(/\r\n/g, '<br/>');
		ruleDesc = ruleDesc.replace(/\n/, '"</br>');
		return (
			// <div className={style.rule}>
			// 	<div className={style.title}>活动规则</div>
			//     <div className={style.content}>1.活动时间： 2018年11月8日-11月12日； 2.活动仅限新用户参与，活动期间，每位 新用户每种优惠券有一次抢券机会，
			//     1.活动时间： 2018年11月8日-11月12日； 2.活动仅限新用户参与，活动期间，每位 新用户每种优惠券有一次抢券机会，
			//     1.活动时间： 2018年11月8日-11月12日； 2.活动仅限新用户参与，活动期间，每位 新用户每种优惠券有一次抢券机会，1.活动时间： 2018年11月8日-11月12日； 2.活动仅限新用户参与，活动期间，每位 新用户每种优惠券有一次抢券机会，1.活动时间： 2018年11月8日-11月12日； 2.活动仅限新用户参与，活动期间，每位 新用户每种优惠券有一次抢券机会，1.活动时间： 2018年11月8日-11月12日； 2.活动仅限新用户参与，活动期间，每位 新用户每种优惠券有一次抢券机会，1.活动时间： 2018年11月8日-11月12日； 2.活动仅限新用户参与，活动期间，每位 新用户每种优惠券有一次抢券机会，1.活动时间： 2018年11月8日-11月12日； 2.活动仅限新用户参与，活动期间，每位 新用户每种优惠券有一次抢券机会，1.活动时间： 2018年11月8日-11月12日； 2.活动仅限新用户参与，活动期间，每位 新用户每种优惠券有一次抢券机会，1.活动时间： 2018年11月8日-11月12日； 2.活动仅限新用户参与，活动期间，每位 新用户每种优惠券有一次抢券机会，1.活动时间： 2018年11月8日-11月12日； 2.活动仅限新用户参与，活动期间，每位 新用户每种优惠券有一次抢券机会，1.活动时间： 2018年11月8日-11月12日； 2.活动仅限新用户参与，活动期间，每位 新用户每种优惠券有一次抢券机会，</div>
			// </div>
			<div className={style.rule}>
				<div className={style.title}>活动规则</div>
				<div className={style.content}>
					<div dangerouslySetInnerHTML={{ __html: ruleDesc }} />
					{/* {this.props.ruleDesc} */}
				</div>
			</div>
		);
	}
}
