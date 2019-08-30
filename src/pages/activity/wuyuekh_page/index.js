import React, { PureComponent } from 'react';
import styles from './index.scss';
import activity_bg from './img/activity_bg.png';
import new_bg from './img/new_entry.png';
import new_btn from './img/new_btn.png';
import old_bg from './img/old_entry.png';
import old_btn from './img/old_btn.png';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
import { setBackGround } from 'utils/background';

@setBackGround('#FF9C42')
export default class wuyuekh_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			showModal: false
		};
	}

	componentDidMount() {}

	goNew = () => {
		buriedPointEvent(activity.mayReceiveBtn);
		this.props.history.push('/activity/wuyue_new_page');
	};

	goOld = () => {
		buriedPointEvent(activity.mayExtractBtn);
		this.props.history.push('/activity/wuyue_old_page');
	};

	render() {
		return (
			<div className={styles.wuyuekh_page}>
				<img src={activity_bg} className={styles.activity_bg} />
				<div className={styles.new_entry_box}>
					<img src={new_bg} className={styles.entry_bg} />
					<img src={new_btn} onClick={this.goNew} className={styles.btn_style} />
				</div>
				<div className={styles.old_entry_box}>
					<img src={old_bg} className={styles.entry_bg} />
					<img src={old_btn} onClick={this.goOld} className={styles.btn_style} />
				</div>
			</div>
		);
	}
}
