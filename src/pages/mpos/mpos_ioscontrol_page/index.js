import React, { PureComponent } from 'react';
import styles from './index.scss';
import ioscontrol from './img/leadwx_bg.png';
import ioscontrol_activity from './img/ioscontrol_activity.png';
import ioscontrol_coupon_activity from './img/ioscontrol_coupon_activity.png';
import btnBg from './img/copy_btn.png';
import { store } from 'utils/store';
import {CopyToClipboard} from 'react-copy-to-clipboard';

export default class ioscontrol_page extends PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			newuser_activity: '',
			coupon_activity: '',
			copyText: '还到'
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
		// if (this.state.newuser_activity) {
		// 	return <img src={ioscontrol_activity} className={styles.img} />
		// } else if (this.state.coupon_activity) {
		// 	return <img src={ioscontrol_coupon_activity} className={styles.img} />
		// } else {
		return (
			<div className={styles.bgBox}>
				<img src={ioscontrol} className={styles.img} />
				<CopyToClipboard
					text={this.state.copyText}
          			onCopy={() => this.props.toast.info('复制成功！马上打开微信关注“还到”，抢免息吧！')}
				>
				<img src={btnBg} className={styles.copyBtn} />
				</CopyToClipboard>
			</div>
		)
		// }
	}
}
