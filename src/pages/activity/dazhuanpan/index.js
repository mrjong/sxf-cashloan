import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import styles from './index.scss';
import AwardShow from './components/AwardShow';
import RuleShow from './components/RuleShow';
import LoginAlert from './components/LoginAlert';
import { setBackGround } from 'utils/setBackGround';
import { getDeviceType } from 'utils/common';
import { Toast } from 'antd-mobile';
import bg from './img/bg.png';
import zp_bg from './img/zp_bg.png';
import zp_btn from './img/zp_btn.png';
import item1 from './img/item1.png';
import config from './config.js';
import Cookie from 'js-cookie';
const API = {
	activeConfig: '/activeConfig/list', // 活动配置接口
	awardRecords: '/activeConfig/records', // 用户中奖记录展示
	userCount: '/activeConfig/count', // 用户抽奖次数查询
	userDraw: '/activeConfig/draw' // 用户抽奖
};
let token = '';
@fetch.inject()
@setBackGround('#260451')
export default class dazhuanpan_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			numdeg: 0,
			time: 0,
			realDeg: 45,
			transformType: 'linear',
			awardList: [
				{
					prizeId: 1,
					name: '一等奖',
					imgUrl: item1,
					type: '红包',
					valType: '个',
					valDes: '5'
				},
				{
					prizeId: 2,
					name: '二等奖',
					imgUrl: item1,
					type: '优惠券',
					valType: '折',
					valDes: '1'
				},
				{
					prizeId: 2,
					name: '二等奖',
					imgUrl: item1,
					type: '优惠券',
					valType: '折',
					valDes: '1'
				},
				{
					prizeId: 2,
					name: '二等奖',
					imgUrl: item1,
					type: '优惠券',
					valType: '折',
					valDes: '1'
				},
				{
					prizeId: 2,
					name: '二等奖',
					imgUrl: item1,
					type: '优惠券',
					valType: '折',
					valDes: '1'
				},
				{
					prizeId: 2,
					name: '二等奖',
					imgUrl: item1,
					type: '优惠券',
					valType: '折',
					valDes: '1'
				},
				{
					prizeId: 2,
					name: '二等奖',
					imgUrl: item1,
					type: '优惠券',
					valType: '折',
					valDes: '1'
				},
				{
					prizeId: 2,
					name: '二等奖',
					imgUrl: item1,
					type: '优惠券',
					valType: '折',
					valDes: '1'
				}
			],
			total: '1',
			allUsersAward: [],
			type: '', // 弹框类型
			userAwardList: [], // 用户中奖列表
		};
	}
	isTurn = false;
	componentWillMount() {
		token = Cookie.get('fin-v-card-token');
		// if (token) {
		// 	this.getCount();
		// }
		this.setState({
			total:
				sessionStorage.getItem('total') && Number(sessionStorage.getItem('total')) > 0
					? sessionStorage.getItem('total')
					: !sessionStorage.getItem('total') ? 1 : 0
		});
		this.getConfigList();
	}
	// start = () => {
	// 	if (this.isTurn) {
	// 		return;
	// 	}
	// 	this.setState({
	// 		numdeg: 360 * 1,
	// 		time: 10,
	// 		transformType: 'ease-in'
	// 	});
	// 	let demotime = parseInt(Math.random() * 10) * 1000;
	// 	console.log(demotime);
	// 	setTimeout(() => {
	// 		this.setState(
	// 			{
	// 				numdeg: this.state.realDeg - 25,
	// 				time: 3,
	// 				transformType: 'ease-out'
	// 			},
	// 			() => {
	// 				console.log(this.state.time);
	// 			}
	// 		);
	// 	}, demotime);
	// };

	// 刷新大转盘数据
	refreshPage = () => {
		this.getCount();
	}

	// 获取活动配置list
	getConfigList = () => {
		this.props.$fetch.post(API.activeConfig, { activeId: config.activeId }).then((res) => {
			if (res.msgCode === 'PTM0000' && res.data && res.data.type === '04') { // type 拆红包00, 砸金蛋01, 刮刮乐02, 老虎机03,大转盘04
				if(res.data.recordShow === '01'){ // 是否展示其他用户抽奖记录  01是 00 否
					this.getAwardList('00');
				}
				this.setState({
					awardList: res.data.prizeList
				});
			} else {
				Toast.info(res.msgInfo);
			}
		});
	};

	// 大转盘活动-用户抽奖剩余次数查询
	getCount = () => {
		this.props.$fetch.post(API.userCount, { activeId: config.activeId }).then((res) => {
			if (res.msgCode === 'PTM0000') {
				if (res.data.total && Number(res.data.total) > 0) {
					this.getDraw(res.data.total);
				} else {
					sessionStorage.setItem('total', 0);
					this.setState({
						total: '0'
					});
					this.showAlertFunc({
						type: 'alert',
						title: '抱歉，没有抽奖机会',
						content: '今日机会已用完，请您明日再来'
					});
				}
			} else {
				Toast.info(res.msgInfo);
			}
		});
	};
	// 获取我的奖品
	getMyAward = () => {
		this.getAwardList('01');
	};
	// 用户中奖列表
	getAwardList = (type) => {
		const params = {
			activeId: config.activeId,
			type // 01 当前用户 00 所有用户
		};
		this.props.$fetch.post(API.awardRecords, params).then((res) => {
			if (res.msgCode === 'PTM0000') {
				if (type === '01') {
					this.setState({
						userAwardList: res.data,
						type: 'jiangpin'
					});
				} else if (type === '00') {
					this.setState({
						allUsersAward: res.data,
					});
				}
			} else {
				Toast.info(res.msgInfo);
			}
		});
	};
	// 用户抽奖
	getDraw = (total) => {
		const osType = getDeviceType();
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		const params = {
			activeId: config.activeId,
			channel: queryData && queryData.h5Channel ? queryData.h5Channel : localStorage.getItem('h5Channel') || 'h5', // 用户渠道
			osType: osType
		};
		this.props.$fetch.post(API.userDraw, params).then((res) => {
			if (res.msgCode === 'PTM0000') {
				sessionStorage.setItem('total', Number(total) > 0 ? Number(total) - 1 : '0');
				this.setState({
					total: Number(total) > 0 ? Number(total) - 1 : '0'
				});
				this.zhuanpan(res.data);
			} else {
				Toast.info(res.msgInfo);
			}
		});
	};
	// 转盘开始转
	zhuanpan = (obj) => {
		this.isRotated = true;
		var index = Number(obj.prizeId);
		setTimeout(() => {
			this.setState({
				num: index + this.state.num //得到本次位置
			});
			this.setState(
				{
					numdeg:
						360 * 8 +
						this.state.numdeg +
						(8 - index) * this.state.deg +
						this.state.deg / 2 +
						(360 - this.state.numdeg % 360)
				},
				() => {
					// console.log(this.state.numdeg);
				}
			);
			setTimeout(() => {
				// console.log(this.state.context[index]);
				switch (index) {
					case 2: // 杜蕾斯
						this.setState({
							type: 'alert_dls'
						});
						break;
					case 7: // 20减息券
						this.setState({
							showAlert1: true,
							type: 'alert_10'
						});
						break;

					default:
						this.showAlertFunc({
							type: 'alert',
							title: '抱歉，未抽中奖品',
							content: '谢谢参与～'
						});
				}
				this.isRotated = false; //旋转改为false说明没有旋转
			}, 6000);
		}, 0);
	};

	// 转盘按钮
	onloadZhuan = async () => {
		if (!token) {
			this.setState({
				type: 'alert_tel',
			});
			return;
		}
		if (sessionStorage.getItem('total') && Number(sessionStorage.getItem('total')) <= 0) {
			this.setState({
				total: '0',
				type: 'no_chance',
			});
			return;
		}
		if (this.isRotated) return; //如果正在旋转退出程序
		this.getCount();
	};

	render() {
		const { awardList, time, transformType, type, userAwardList, allUsersAward, total } = this.state;
		return (
			<div className={styles.dazhuanpan}>
				<div>{type ? <LoginAlert refreshPageFn={this.refreshPage} alertType={type} userAwardList={userAwardList} /> : null}</div>
				<div className={styles.bg}>
					<img className={styles.img} src={bg} />
					<div className={styles.hd_box}>
						{
							allUsersAward && allUsersAward.length ?
							<div className={styles.get_award_list}>
								<AwardShow allUsersAward={allUsersAward} />
							</div>
							:
							null
						}
						<div className={styles.message_bottom}>
							今日剩余<span>{total}</span>次抽奖机会
						</div>
						<div className={styles.zp_bg_box}>
							{/* 转盘灯 */}
							<img className={styles.zp_bg} src={zp_bg} />
							{/* 按钮 */}
							<img className={styles.zp_btn} src={zp_btn} onClick={this.onloadZhuan} />
							{/* 转盘 */}
							<div
								className={styles.zp_box}
								style={{
									transform: `scale(0.85) rotate(${this.state.numdeg}deg)`,
									WebkitTransition: `-webkit-transform ${time}s ${transformType}`,
									transition: `-webkit-transform ${time}s ${transformType}`,
									transition: `transform ${time}s ${transformType}`,
									transition: `transform ${time}s ${transformType}`
								}}
							>
								{/* 奖品 */}
								<div className={styles.zp_img_box}>
									{awardList.map((item, index) => {
										return (
											<img
												key={index}
												className={styles.img1}
												src={item.imgUrl}
												style={{
													transform: `rotate(${index * (360 / awardList.length)}deg)`
												}}
											/>
										);
									})}
								</div>
							</div>
						</div>
						<div className={styles.myAward} onClick={this.getMyAward}>
							<span>我的奖品</span>
						</div>
						<div className={styles.get_rule_desc}>
							<RuleShow />
						</div>
					</div>
				</div>
			</div>
		);
	}
}
