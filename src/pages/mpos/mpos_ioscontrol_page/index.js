import React, { PureComponent } from 'react';
import styles from './index.scss';
import ioscontrol from './img/leadwx_bg.png';
import btnBg from './img/copy_btn.png';
import { store } from 'utils/store';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { buriedPointEvent } from 'utils/analytins';
import { mpos_ioscontrol_page } from 'utils/analytinsType';
import { setBackGround } from 'utils/background';
import qs from 'qs'
@setBackGround('linear-gradient(139deg, #ff3749 0%, #feba55 84%)')
export default class ioscontrol_page extends PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			coupon_activity: '',
			copyText: '还到'
		}
	}
	componentDidMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true })
		buriedPointEvent(mpos_ioscontrol_page.iosControlPageView, {
			entryType: queryData.entryType
		});
		const coupon_activity = store.getCouponActivityFlag()
		store.removeCouponActivityFlag()
		this.setState({
			coupon_activity
		})
	}

	copyOperation = () => {
		buriedPointEvent(mpos_ioscontrol_page.copySuccess);
		this.props.toast.info('复制成功！马上打开微信关注“还到”，抢免息吧！');
		setTimeout(() => {
			window.postMessage('复制成功', ' ');
		}, 0)
	}

	render() {
		return (
			<div className={styles.bgBox}>
				<img src={ioscontrol} className={styles.img} />
				<CopyToClipboard
					text={this.state.copyText}
					onCopy={() => this.copyOperation()}
				>
					<img src={btnBg} className={styles.copyBtn} />
				</CopyToClipboard>
			</div>
		)
		// }
	}
}
