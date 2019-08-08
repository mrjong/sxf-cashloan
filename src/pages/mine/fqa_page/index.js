import React, { PureComponent } from 'react';
import { headerIgnore } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { mine } from 'utils/analytinsType';
import styles from './index.scss';
import ButtonCustom from 'components/ButtonCustom';
import fetch from 'sx-fetch';

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
		const { QYConfig } = this.state;
		window.ysf('config', {
			uid: QYConfig && QYConfig.uid, // 用户Id
			robotShuntSwitch: 1, // 机器人优先开关
			groupid: QYConfig && QYConfig.groupid, // 客服组id 金融在线（IOS）397748874   金融在线（安卓）397743127   金融在线（微信公众号）397748875
			robotId: QYConfig && QYConfig.robotId, // 机器人ID
			success: function() {
				// 成功回调
				location.href = window.ysf('url', { templateId: QYConfig && QYConfig.templateId });
				// ysf('open', {
				//   templateId: 10317938
				// });
			},
			error: function() {
				// 错误回调
				console.log('出错了');
				// handle error
			}
		});
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
				<div className={styles.service_box}>
					<ButtonCustom onClick={this.goOnline} className={styles.online_btn}>
						<i />
						在线咨询
					</ButtonCustom>
				</div>
			</div>
		);
	}
}
