import React, { PureComponent } from 'react';
import styles from './index.scss';
import ioscontrol from './img/ioscontrol.png';
import ioscontrol_activity from './img/ioscontrol_activity.png';
import ioscontrol_coupon_activity from './img/ioscontrol_coupon_activity.png'
import { setBackGround } from 'utils/background';
import { store } from 'utils/store'

@setBackGround('#cf2a2a')
export default class ioscontrol_page extends PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			newuser_activity: '',
			coupon_activity: ''
		}
	}
	componentDidMount() {
		const newuser_activity = store.getNewUserActivityFlag()
		const coupon_activity = store.getCouponActivityFlag()
		store.removeNewUserActivityFlag()
		store.removeCouponActivityFlag()
		this.setState({
			newuser_activity,
			coupon_activity
		})
	}
	render() {
		if (this.state.newuser_activity) {
			return <img src={ioscontrol_activity} className={styles.img} />
		} else if (this.state.coupon_activity) {
			return <img src={ioscontrol_coupon_activity} className={styles.img} />
		} else {
			return <img src={ioscontrol} className={styles.img} />
		}
	}
}
