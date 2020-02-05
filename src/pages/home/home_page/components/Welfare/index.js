/*
 * @Author: shawn
 * @LastEditTime : 2020-02-05 14:18:06
 */
import React from 'react';
import { store } from 'utils/store';
import Cookie from 'js-cookie';
import classNM from './index.scss';

// const API = {
// 	MSG_COUNT: '/my/msgCount' // h5-查询未读消息总数
// };
let token = '';
let tokenFromStorage = '';

export default class Welfare extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			welfareList: []
		};
	}

	componentWillMount() {
		token = Cookie.get('fin-v-card-token');
		tokenFromStorage = store.getToken();
		if (token && tokenFromStorage) {
			this.requestWelfareList();
		}
	}

	requestWelfareList = () => {
		this.setState({
			welfareList: [
				{
					link: 'https://www.baidu.com',
					name: '玩赚绿洲玩赚绿洲',
					cornerContent: '集砖石 分现金集砖石 分现金',
					img:
						'https://oss-test.suixingpay.com/0/2/32MDJhYjIyYWZwVXg2ajJheDIwMTlfMTFfMTFfMTdfMjJfZjc1NjI2NzRiOTM3NGJjZTgxYjM1ZDc3N2Y3OWMzYzAyYWd0ZXN0XzEyYWIx.png'
				},
				{
					name: '玩赚绿洲',
					cornerContent: '集砖石 分现金',
					img:
						'https://oss-test.suixingpay.com/0/2/32MDJhYjIyYWZwVXg2ajJheDIwMTlfMTFfMTFfMTdfMjJfZjc1NjI2NzRiOTM3NGJjZTgxYjM1ZDc3N2Y3OWMzYzAyYWd0ZXN0XzEyYWIx.png'
				},
				{
					name: '玩赚绿洲玩赚绿洲',
					cornerContent: '集砖石 分现金集砖石 分现金'
				}
			]
		});
		return;
		// this.props.$fetch.post(API.MSG_COUNT, null, { hideLoading: true }).then((result) => {
		// 	if (result && result.msgCode === 'PTM0000' && result.data !== null) {
		// 		this.setState({
		// 			welfareList: result.data.count
		// 		});
		// 	} else {
		// 		this.props.toast.info(result.msgInfo);
		// 	}
		// });
	};

	goActivity = (item) => {
		if (item.link) {
			window.location.href = encodeURI(item.link);
		}
	};

	render() {
		const { welfareList } = this.state;
		return welfareList && welfareList.length ? (
			<div className={classNM.welfareWrap}>
				<p className={classNM.welfareTitle}>福利专区</p>
				<div className={classNM.welfareBox}>
					{welfareList.map((item, index) => (
						<div
							key={index}
							className={classNM.welfareItem}
							onClick={() => {
								this.goActivity(item);
							}}
						>
							{item.img ? <img src={item.img} className={classNM.welfareImg} /> : null}
							<div className={classNM.welfareNameWrap}>
								<p className={classNM.welfareName}>{item.name}</p>
								<p className={classNM.welfareNameSub}>{item.cornerContent}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		) : null;
	}
}
