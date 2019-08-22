import React, { PureComponent } from 'react';
import { headerIgnore } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { mine } from 'utils/analytinsType';
import styles from './index.scss';
import ButtonCustom from 'components/ButtonCustom';
import fetch from 'sx-fetch';
import { store } from 'utils/store';

const API = {
	queryQYOpenId: '/my/queryUsrQYOpenId' // 七鱼用户标识
};

@fetch.inject()
export default class fqa_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			QYConfig: null // 七鱼的openId
		};
	}

	componentWillMount() {
		this.props.$fetch.get(API.queryQYOpenId).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				this.setState({
					QYConfig: result.data
				});
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	}
	componentDidMount() {
		buriedPointEvent(mine.faq);
	}

	goOnline = () => {
		this.props.history.push('/mine/qiyu_page');
	};

	render() {
		return (
			<div className={styles.fqa_page}>
				<iframe
					className={headerIgnore() ? styles.container2 : styles.container}
					src="/disting/#/fqa_page"
					name="fqa_page"
					id="fqa_page"
					width="100%"
					height="100%"
					frameBorder="0"
				/>
				{store.getToken() ? (
					<div className={styles.service_box}>
						<ButtonCustom onClick={this.goOnline} className={styles.online_btn}>
							<i />
							在线咨询
						</ButtonCustom>
					</div>
				) : null}
			</div>
		);
	}
}
