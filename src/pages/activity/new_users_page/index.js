/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-10-21 17:18:47
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import activity_bg from './img/activityBg.png';
import submit_btn1 from './img/btn_bg.png';
import wallet_img1 from './img/wallet_img1.png';
import wallet_img2 from './img/wallet_img2.png';
import wallet_img3 from './img/wallet_img3.png';
import shadow_img from './img/shadow_img.png';
import rules_bg from './img/rules_bg.png';
// import { buriedPointEvent } from 'utils/analytins';
// import { activity } from 'utils/analytinsType';
// import { setBackGround } from 'utils/background';
import AwardShow from './components/AwardShow';

// @setBackGround('#F64C46')
export default class new_users_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false
		};
	}

	componentWillMount() {
		// buriedPointEvent(activity.mayReceiveBtn);
	}

	componentDidMount() {
		// buriedPointEvent(activity.mayReceiveBtn);
	}

	goTo = () => {
		this.setState({
			isOpen: true
		});
	};

	render() {
		const { isOpen } = this.state;
		return (
			<div className={styles.new_users_page}>
				<div>
					<img src={activity_bg} className={styles.activityBg} />
				</div>
				<div className={styles.contentBox}>
					<div className={styles.wallet}>
						<img src={wallet_img1} className={styles.img1} />
						<img
							src={wallet_img2}
							className={isOpen ? [styles.img2, styles.slideImg].join(' ') : styles.img2}
						/>
						<img src={wallet_img3} className={styles.img3} />
					</div>
					{/* 特殊阴影 */}
					<img src={shadow_img} className={styles.shadowImg} />
				</div>
				<div onClick={this.goTo}>
					<img src={submit_btn1} className={styles.submitBtn} />
				</div>
				{/* 奖品列表 */}
				<div className={styles.awardListCont}>
					<AwardShow className={styles.awardList} />
				</div>
				{/* 活动规则 */}
				<div className={styles.rulesCont}>
					<img src={rules_bg} className={styles.rulesBg} />
					<div className={styles.rulesContent}>
						<p>1.活动期间，新注册用户可获得10天新手免息券，有效期4天；</p>
						<p>2.同一ID在活动期间仅限领取一次;</p>
						<p>3.免息券过期失效视为放弃，不可重复领取；</p>
						<p>4.仅在借款时使用，可减免首期利息。</p>
					</div>
				</div>
			</div>
		);
	}
}
