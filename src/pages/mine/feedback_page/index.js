import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import Lists from 'components/Lists';
import { buriedPointEvent } from 'utils/analytins';
import { mine } from 'utils/analytinsType';
import styles from './index.scss';
import { setBackGround } from 'utils/background';

const API = {
	VIPCARD: '/my/queryUsrMemSts', // 查询用户会员卡状态
	LOGOUT: '/signup/logout', // 用户退出登陆
	USERSTATUS: '/signup/getUsrSts', // 用户状态获取
	couponRedDot: '/index/couponRedDot', // 优惠券红点
	couponCount: '/index/couponCount' // 优惠券红点
};

@fetch.inject()
@setBackGround('#fff')
export default class mine_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	clickhandle = () => {
		this.props.history.push('/mine/feedback_save_page');
	};
	render() {
		// 定义list所需的数据
		const listsArr = [
			{
				label: {
					name: '优惠劵',
					className: styles.coupon_page
				},
				jumpToUrl: '/mine/coupon_page'
			},
			{
				label: {
					name: '我的钱包',
					className: styles.wallet_page
				},
				jumpToUrl: '/mine/wallet_page'
			}
		];
		return (
			<div className={[styles.mine_page, 'mine_page_global'].join(' ')}>
				<div className={styles.textTitle}>我们聆听您的反馈，把更好的体验带给你</div>
				<Lists
					clickCb={this.clickhandle}
					listsInf={listsArr}
					className={[styles.common_margin, styles.mine_list].join(' ')}
				/>
			</div>
		);
	}
}
