import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import style from './index.scss';
import { store } from 'utils/store';
import qs from 'qs';
import { buriedPointEvent } from 'utils/analytins';
import { wxTabBar } from 'utils/analytinsType';

const API = {
	queryQYOpenId: '/my/queryUsrQYOpenId' // 七鱼用户标识
};
(function(w, d, n, a, j) {
	w[n] =
		w[n] ||
		function() {
			return (w[n].a = w[n].a || []).push(arguments);
		};
	j = d.createElement('script');
	j.async = true;
	j.src = 'https://qiyukf.com/script/9713a43d3285d8c087a01390094af66a.js?hidden=1';
	d.body.appendChild(j);
})(window, document, 'ysf');
let queryData = {};
@fetch.inject()
export default class qiyu_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		if (queryData.entry === 'wxTabBar') {
			buriedPointEvent(wxTabBar.onlineService);
		}
		if (queryData.apptoken) {
			//如果从APP过来
			store.setToken(queryData.apptoken);
			this.getOpenId();
		} else {
			this.getOpenId();
		}
	}
	getOpenId = () => {
		this.props.$fetch.get(API.queryQYOpenId).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				this.goOnline(result.data);
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};

	goOnline = (QYConfig) => {
		window.ysf('config', {
			uid: QYConfig && QYConfig.uid, // 用户Id
			robotShuntSwitch: 1, // 机器人优先开关
			groupid: QYConfig && QYConfig.groupid, // 客服组id 金融在线（IOS）397748874   金融在线（安卓）397743127   金融在线（微信公众号）397748875
			robotId: QYConfig && QYConfig.robotId, // 机器人ID
			data: JSON.stringify([{ key: 'uid', value: QYConfig && QYConfig.uid, label: '用户ID' }]),
			success: function() {
				// 成功回调
				location.replace(window.ysf('url', { templateId: QYConfig && QYConfig.templateId }));
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
		return <div className={style.textCenter}>正在连接，请稍后...</div>;
	}
}
