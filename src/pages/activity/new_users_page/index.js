/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-10-21 14:09:45
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import activity_bg from './img/activityBg.png';
// import submit_btn1 from './img/btn_bg.png';
import wallet_img1 from './img/wallet_img1.png';
import wallet_img2 from './img/wallet_img2.png';
import wallet_img3 from './img/wallet_img3.png';
// import { buriedPointEvent } from 'utils/analytins';
// import { activity } from 'utils/analytinsType';
// import { setBackGround } from 'utils/background';
// import AwardShow from './components/AwardShow';

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
				{/* <AwardShow /> */}
				<div>
					<img src={activity_bg} className={styles.activityBg} />
				</div>
				<div className={styles.contentBox}>
					<div className={styles.wallet}>
						<img src={wallet_img1} className={[styles.img, styles.img1].join(' ')} />
						<img
							src={wallet_img2}
							className={
								isOpen
									? [styles.img, styles.img2, styles.slideImg].join(' ')
									: [styles.img, styles.img2].join(' ')
							}
						/>
						<img src={wallet_img3} className={[styles.img, styles.img3].join(' ')} />
					</div>
				</div>
				{/* <div className={styles.submitBtn} onClick={this.goTo}>
					<img src={submit_btn1} className={[styles.btn, styles.btn1].join(' ')} />
				</div> */}
			</div>
		);
	}
}
