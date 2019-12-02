/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-02 12:09:05
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import styles from './index.scss';
import activity_bg from './img/activity_bg.png';
import list_img from './img/list_img.png';
import enter_btn from './img/enter_btn.png';
import Cookie from 'js-cookie';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
import { setBackGround } from 'utils/background';

@setBackGround('#499BFE')
@fetch.inject()
export default class anxin_plan_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			queryData: {} // url上的参数
		};
	}

	componentWillMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		this.setState({
			queryData
		});
	}

	componentDidMount() {
		const { queryData } = this.state;
		if (queryData.comeFrom) {
			buriedPointEvent(activity.anXinActivityEntry, {
				entry: queryData.comeFrom,
				regChannel: queryData && queryData.regChannel ? queryData.regChannel : '',
				pageNm: '集合列表页'
			});
		}
		if (queryData.fromApp) {
			if (queryData.activityToken) {
				Cookie.set('fin-v-card-token', queryData.activityToken, { expires: 365 });
			} else {
				Cookie.remove('fin-v-card-token');
			}
		}
	}

	// 进入活动详情落地页
	enterDetail = (path) => {
		const { queryData } = this.state;
		buriedPointEvent(activity.anXinActivityListGoClick, {
			entry: queryData.comeFrom,
			regChannel: queryData && queryData.regChannel ? queryData.regChannel : '',
			pageNm: '集合列表页'
		});
		this.props.history.push({
			pathname: path,
			search: qs.stringify(queryData)
		});
	};

	render() {
		return (
			<div className={styles.new_users_page}>
				<div className={styles.topContainer}>
					<img src={activity_bg} className={styles.activityBg} />
					<div className={styles.listImgContainer}>
						<img src={list_img} className={styles.listImg} />
						<img
							src={enter_btn}
							onClick={() => {
								this.enterDetail('/activity/guosong_page');
							}}
							className={styles.enterBtn}
						/>
						<img
							src={enter_btn}
							onClick={() => {
								this.enterDetail('/activity/dibu_page');
							}}
							className={[styles.enterBtn, styles.enterBtn2].join(' ')}
						/>
						<img
							src={enter_btn}
							onClick={() => {
								this.enterDetail('/activity/manpei_page');
							}}
							className={[styles.enterBtn, styles.enterBtn3].join(' ')}
						/>
						<img
							src={enter_btn}
							onClick={() => {
								this.enterDetail('/activity/yongfan_page');
							}}
							className={[styles.enterBtn, styles.enterBtn4].join(' ')}
						/>
					</div>
				</div>
			</div>
		);
	}
}
