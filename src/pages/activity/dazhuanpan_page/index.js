import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import styles from './index.scss';
import AwardShow from './components/AwardShow';
import RuleShow from './components/RuleShow';
import LoginAlert from './components/LoginAlert';
import { setBackGround } from 'utils/setBackGround';
import { Toast } from 'antd-mobile';
import bg from './img/bg.png';
import zp_bg from './img/zp_bg.png';
import over from './img/over.png';
import notstart from './img/notstart.png';
import zp_btn from './img/zp_btn.png';
import item1 from './img/item1.png';
import config from './config.js';
import Cookie from 'js-cookie';
const API = {
	activeConfig: '/activeConfig/list', // 活动配置接口
	awardRecords: '/activeConfig/records', // 用户中奖记录展示
	recordForUser: '/activeConfig/recordForUser', // 用户中奖记录展示
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
			transformType: 'cubic-bezier(.3,.25,.0001,1)',
			awardList: [],
			ruleDesc: '',
			alert_img: '',
			codeInfo: '',
			count: '1',
			allUsersAward: [],
			type: '', // 弹框类型
			userAwardList: [] // 用户中奖列表
		};
	}
	isTurn = false;
	componentWillMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData.activeId) {
			config.activeId = queryData.activeId;
		}
		if (!queryData.activeId) {
			this.setState({
				codeInfo: 'PCC-MARKET-0002'
			});
			Toast.info('活动id不能为空');
			return;
		} else {
			this.setState({
				codeInfo: ''
			});
		}
		token = Cookie.get('fin-v-card-token');
		this.setState({
			count:
				sessionStorage.getItem('count') && Number(sessionStorage.getItem('count')) > 0
					? sessionStorage.getItem('count')
					: !sessionStorage.getItem('count') ? 1 : 0
		});
		this.getConfigList();
	}
	// 刷新大转盘数据
	refreshPage = () => {
		// this.getCount();
	};

	// 获取活动配置list
	getConfigList = () => {
		this.props.$fetch.post(API.activeConfig, { activeId: config.activeId }).then((res) => {
			if (res.msgCode === 'PTM0000') {
				if (res.data.data) {
					switch (res.data.data.type) {
						case '00':
							Toast.info(res.msgInfo);
							break;
						case '01':
							Toast.info(res.msgInfo);
							break;
						case '02':
							Toast.info(res.msgInfo);
							break;
						case '03':
							Toast.info(res.msgInfo);
							break;
						case '大转盘':
							// 是否展示其他用户抽奖记录  01是 00 否
							if (res.data && res.data.data && res.data.data.recordShow !== '00') {
								this.getAwardList('00');
							}
							this.setState({
								codeInfo: '',
								awardList: res.data.data.prizeList,
								ruleDesc: res.data.data.ruleDesc
							});
							break;

						default:
							break;
					}
				} else if (res.data.code === 'PCC-MARKET-0001' || res.data.code === 'PCC-MARKET-0002') {
					// Toast.info(res.data.msg);
					this.setState({
						codeInfo: res.data.code
					});
				}
			} else {
				Toast.info(res.msgInfo);
			}
		});
	};

	// 大转盘活动-用户抽奖剩余次数查询
	getCount = () => {
		this.props.$fetch.post(API.userCount, { activeId: config.activeId }, { noLginRouter: true }).then((res) => {
			if (res.msgCode === 'PTM0000') {
				if (res.data.data.count && Number(res.data.data.count) > 0) {
					this.getDraw(res.data.data.count);
				} else {
					sessionStorage.setItem('count', 0);
					this.setState({
						count: '0'
					});
					this.setState({
						type: 'no_chance'
					});
				}
			} else {
				if (res.msgCode === 'PTM1000') {
                    Cookie.remove('fin-v-card-token');
                    this.onloadZhuan()
				} else if (res.msgCode === 'PTM0100') {
                    this.onloadZhuan()
					Cookie.remove('fin-v-card-token');
				} else {
					Toast.info(res.msgInfo);
				}
			}
		});
	};
	// 获取我的奖品
	getMyAward = () => {
		token = Cookie.get('fin-v-card-token');
		if (!token) {
			this.setState({
				type: 'alert_tel'
			});
			return;
		}
		this.getrecordForUser('01');
	};
	// 用户中奖列表
	getrecordForUser = (type) => {
		const params = {
			activeId: config.activeId,
			type // 01 当前用户 00 所有用户
		};
		this.props.$fetch.post(API.recordForUser, params).then((res) => {
			if (res.msgCode === 'PTM0000') {
				this.setState({
					userAwardList: res.data.data,
					type: 'jiangpin'
				});
			} else {
				Toast.info(res.msgInfo);
			}
		});
	};
	// 用户中奖列表
	getAwardList = (type) => {
		const params = {
			activeId: config.activeId,
			type // 01 当前用户 00 所有用户
		};
		this.props.$fetch.post(API.awardRecords, params).then((res) => {
			if (res.msgCode === 'PTM0000') {
				this.setState({
					allUsersAward: (res.data && res.data.data) || []
				});
			} else {
				Toast.info(res.msgInfo);
			}
		});
	};
	// 用户抽奖
	getDraw = (count) => {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		const params = {
			activeId: config.activeId,
			channel:
				queryData && queryData.h5Channel
					? queryData.h5Channel
					: sessionStorage.getItem('h5Channel') || localStorage.getItem('h5Channel') || 'h5' // 用户渠道
		};
		this.props.$fetch.post(API.userDraw, params).then((res) => {
			if (res.msgCode === 'PTM0000') {
				sessionStorage.setItem('count', Number(count) > 0 ? Number(count) - 1 : '0');
				this.setState({
					count: Number(count) > 0 ? Number(count) - 1 : '0'
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
		let index = '';
		this.state.awardList.forEach((item, index2) => {
			if (obj.prizeId === item.prizeId) {
				index = index2 + 1;
			}
		});
		if (!index) {
			return;
		}
		setTimeout(() => {
			this.setState({
				num: Number(index) + this.state.num //得到本次位置
			});
			let deg = 360 / this.state.awardList.length;
			this.setState(
				{
					numdeg:
						360 * 4 +
						this.state.numdeg +
						(this.state.awardList.length - index) * deg +
						deg / 2 +
						(360 - this.state.numdeg % 360),
					time: 7.5
				},
				() => {
					console.log(this.state.numdeg);
				}
			);
			setTimeout(() => {
				// 00 优惠券  01 积分  02 红包 03 实物   04 谢谢惠顾
				// console.log(this.state.context[index]);
				this.setState({
					type: 'alert_img',
					alert_img: `data:image/png;base64,${obj.imgUrl}`
				});
				this.isRotated = false; //旋转改为false说明没有旋转
			}, 7000);
		}, 0);
	};

	// 转盘按钮
	onloadZhuan = async () => {
		token = Cookie.get('fin-v-card-token');
		if (!token) {
			this.setState({
				type: 'alert_tel'
			});
			return;
		}
		if (sessionStorage.getItem('count') && Number(sessionStorage.getItem('count')) <= 0) {
			this.setState({
				count: '0',
				type: 'no_chance'
			});
			return;
		}
		if (this.isRotated) return; //如果正在旋转退出程序
		this.getCount();
	};

	setalertType = (type) => {
		this.setState({
			type
		});
	};
	// 立即使用
	goRoute = () => {
		this.setState({
			type: ''
		});
		this.props.history.replace('/home');
	};
	render() {
		const { awardList, time, transformType, type, userAwardList, allUsersAward, count, alert_img } = this.state;
		return (
			<div className={styles.dazhuanpan}>
				{this.state.codeInfo ? (
					<div className={styles.active_img_box}>
						<img src={this.state.codeInfo !== 'PCC-MARKET-0001' ? notstart : over} />{' '}
					</div>
				) : null}
				{!this.state.codeInfo ? (
					<div>
						<LoginAlert
							alert_img={alert_img}
							refreshPageFn={this.refreshPage}
							setalertType={this.setalertType}
							alertType={type}
							goRoute={this.goRoute}
							userAwardList={userAwardList}
						/>
						<div className={styles.bg}>
							<img className={styles.img} src={bg} />
							<div className={styles.hd_box}>
								{allUsersAward && allUsersAward.length ? (
									<div className={styles.get_award_list}>
										<AwardShow allUsersAward={allUsersAward} />
									</div>
								) : null}
								<div className={styles.message_bottom}>
									今日剩余<span>{count}</span>次抽奖机会
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
											overflow: 'hidden',
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
														src={`data:image/png;base64,${item.imgUrl}`}
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
								{this.state.ruleDesc ? (
									<div className={styles.get_rule_desc}>
										<RuleShow ruleDesc={this.state.ruleDesc} />
									</div>
								) : null}
							</div>
						</div>
					</div>
				) : null}
			</div>
		);
	}
}
