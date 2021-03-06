import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import styles from './index.scss';
import AwardShow from './components/AwardShowMock';
import LoginAlert from './components/LoginAlert';
import SmsAlert from '../components/SmsAlert';
import { setBackGround } from 'utils/background';
import { Toast, Modal } from 'antd-mobile';
import bg from './img/bg.jpg';
import zp_bg from './img/zp_bg.png';
import over from './img/over.png';
import notstart from './img/notstart.png';
import zp_btn from './img/zp_btn.png';
import config from './config.js';
import Cookie from 'js-cookie';
import { getH5Channel } from 'utils/common';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
const API = {
	activeConfig: '/activeConfig/list', // 活动配置接口
	awardRecords: '/activeConfig/records', // 用户中奖记录展示
	recordForUser: '/activeConfig/recordForUser', // 用户中奖记录展示
	userCount: '/activeConfig/count', // 用户抽奖次数查询
	userDraw: '/activeConfig/draw' // 用户抽奖
};
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
			showRuleModal: false,
			ruleDesc: '',
			alert_img: '',
			codeInfo: '',
			count: '1',
			callBackType: '',
			allUsersAward: [],
			type: '', // 弹框类型
			userAwardList: [], // 用户中奖列表
			channel_value: '', // 那个渠道  mpos VS xdc
			showLoginTip: false,
			smsTokenId: '',
			mblNoHid: ''
		};
	}
	componentWillMount() {
		this.init();
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData.entry) {
			// 根据不同入口来源埋点
			buriedPointEvent(activity.dazhuanpan_316_entry, {
				entry: queryData.entry
			});
		}
	}
	init = () => {
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
		}
		this.setState({
			codeInfo: ''
		});

		// 保存入口
		if (queryData.entry) {
			this.setState({
				channel_value: queryData.entry
			});
		}
		// 默认中奖次数显示
		this.setState({
			count:
				store.getRewardCount() && Number(store.getRewardCount()) > 0
					? store.getRewardCount()
					: !store.getRewardCount()
					? 1
					: 0
		});
		// 初始化大转盘活动
		this.getConfigList();
	};
	// 刷新大转盘数据
	refreshPage = () => {
		this.getCount();
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
								// 展示中奖记录
								// this.getAwardList('00');
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
		this.props.$fetch
			.post(API.userCount, { activeId: config.activeId }, { noLginRouter: true })
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					if (res.data.data.count && Number(res.data.data.count) > 0) {
						this.getDraw(res.data.data.count);
					} else {
						buriedPointEvent(activity.dazhuanpan_316_draw_result, {
							draw_result: '已用尽'
						});
						store.setRewardCount(0);
						this.setState({
							count: '0',
							type: 'no_chance'
						});
					}
				} else {
					if (res.msgCode === 'PTM1000') {
						Cookie.remove('FIN-HD-AUTH-TOKEN');
						this.onloadZhuan();
					} else if (res.msgCode === 'PTM0100') {
						this.onloadZhuan();
						Cookie.remove('FIN-HD-AUTH-TOKEN');
					} else {
						Toast.info(res.msgInfo);
					}
				}
			});
	};
	isAuthFunc = (callBack, type) => {
		const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
		let token = Cookie.get('FIN-HD-AUTH-TOKEN');
		if (
			(token && query.entry && query.entry.indexOf('ismpos') > -1 && store.getMposToken()) ||
			(token && query.entry && query.entry.indexOf('isxdc') > -1)
		) {
			callBack();
			// 根据type 随便去干
		} else {
			if (query.entry && query.entry.indexOf('ismpos') > -1) {
				if (!query.appId || !query.token) {
					this.setState({
						type: 'login_tip'
					});
					buriedPointEvent(activity.dazhuanpan_316_draw_result, {
						draw_result: '请先登录'
					});
					return;
				}
				// 去实名
				this.setState({
					callBackType: type
				});
				Cookie.remove('FIN-HD-AUTH-TOKEN');
				this.child.validateMposRelSts(true);
			} else {
				// 新代偿
				Toast.info('请先登录', 2, () => {
					this.props.history.push('/login');
				});
			}
		}
	};

	// 获取我的奖品
	getMyAward = () => {
		this.isAuthFunc(() => {
			this.getrecordForUser('01');
		}, 'award_list');
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
					type: 'award_list'
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
		const params = {
			activeId: config.activeId,
			channel: getH5Channel() // 用户渠道
		};
		this.props.$fetch.post(API.userDraw, params).then((res) => {
			if (res.msgCode === 'PTM0000') {
				store.setRewardCount(Number(count) > 0 ? Number(count) - 1 : '0');
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
						(360 - (this.state.numdeg % 360)),
					time: 7.5
				},
				() => {
					console.log(this.state.numdeg);
				}
			);
			setTimeout(() => {
				// 00 优惠券  01 积分  02 红包 03 实物   04 谢谢惠顾
				// console.log(this.state.context[index]);
				// 根据不同入口来源埋点
				if (obj.type === '04') {
					buriedPointEvent(activity.dazhuanpan_316_draw_result, {
						draw_result: '未中奖'
					});
					this.setState({
						type: 'no_award',
						alert_img: ''
					});
				} else {
					buriedPointEvent(activity.dazhuanpan_316_draw_result, {
						draw_result: '中奖'
					});
					this.setState({
						type: 'alert_congratulation',
						alert_img: `data:image/png;base64,${obj.imgUrl}`
					});
				}

				this.isRotated = false; //旋转改为false说明没有旋转
			}, 7000);
		}, 0);
	};

	// 转盘按钮
	onloadZhuan = async () => {
		if (store.getRewardCount() && Number(store.getRewardCount()) <= 0) {
			this.setState({
				count: '0',
				type: 'no_chance'
			});
			return;
		}
		if (this.isRotated) return; //如果正在旋转退出程序
		this.isAuthFunc(() => {
			this.getCount();
		}, 'zp_btn');
	};

	setalertType = (type) => {
		this.setState({
			type
		});
	};
	smsSuccess = () => {
		let type = this.state.callBackType;
		switch (type) {
			case 'zp_btn':
				this.onloadZhuan();
				break;
			case 'award_list':
				this.getMyAward();
				break;
			default:
				break;
		}
		this.setState({
			callBackType: ''
		});
	};
	// 立即使用
	goRoute = () => {
		this.setState({
			type: ''
		});
		this.props.history.replace('/home/home');
	};
	// 跳转协议
	go = (url) => {
		this.props.history.push(`/protocol/${url}`);
	};
	onRef = (ref) => {
		this.child = ref;
	};
	render() {
		const { awardList, time, transformType, type, userAwardList, allUsersAward, alert_img } = this.state;
		return (
			<div className={styles.dazhuanpan}>
				<SmsAlert
					onRef={this.onRef}
					smsSuccess={this.smsSuccess}
					goSubmitCb={{
						others: () => {
							buriedPointEvent(activity.dazhuanpan_316_draw_result, {
								draw_result: '暂无资格'
							});
							Toast.info('暂无活动资格');
						}
					}}
					validateMposCb={{
						PTM9000: () => {
							buriedPointEvent(activity.dazhuanpan_316_draw_result, {
								draw_result: '暂无资格'
							});
							Toast.info('暂无活动资格');
						}
					}}
					chkAuthCb={{
						authFlag2: () => {
							buriedPointEvent(activity.dazhuanpan_316_draw_result, {
								draw_result: '暂无资格'
							});
							Toast.info('暂无活动资格');
						}
					}}
					doAuthCb={{
						authSts01: () => {
							buriedPointEvent(activity.dazhuanpan_316_draw_result, {
								draw_result: '短验'
							});
						},
						others: () => {
							buriedPointEvent(activity.dazhuanpan_316_draw_result, {
								draw_result: '暂无资格'
							});
							// 暂无抽奖资格
							Toast.info('暂无活动资格');
						}
					}}
				/>
				{this.state.codeInfo ? (
					<div className={styles.active_img_box}>
						<img src={this.state.codeInfo !== 'PCC-MARKET-0001' ? notstart : over} />{' '}
					</div>
				) : null}
				{!this.state.codeInfo ? (
					<div>
						<Modal
							title="活动规则"
							closable
							visible={this.state.showRuleModal}
							transparent
							onClose={() => {
								this.setState({
									showRuleModal: false
								});
							}}
							className="modal_rule"
						>
							<div>
								<ol>
									<li>1.活动时间：2019年3月16日-3月24日;</li>
									<li>2.活动对象：活动期间注册[还到]的用户</li>
									<li>
										3.活动描述：所有符合条件的用户均有1次抽奖机会，抽中的现金奖品实时下发，您可到随行付还到—我的—我的钱包中查看。
									</li>
								</ol>
							</div>
							<div
								className={styles.closeBtn}
								onClick={() => {
									this.setState({
										showRuleModal: false
									});
								}}
							/>
						</Modal>
						<LoginAlert
							mblNoHid={this.state.mblNoHid}
							smsTokenId={this.state.smsTokenId}
							alert_img={alert_img}
							refreshPageFn={this.refreshPage}
							setalertType={this.setalertType}
							alertType={type}
							goRoute={this.goRoute}
							userAwardList={userAwardList}
						/>

						<div className={styles.bg}>
							<div
								className={styles.rule_btn}
								onClick={() => {
									this.setState({
										showRuleModal: true
									});
								}}
							>
								活动规则
							</div>
							<img className={styles.img} src={bg} />
							<div className={styles.hd_box}>
								{/* {allUsersAward && allUsersAward.length ? ( */}
								<div className={styles.get_award_list}>
									<AwardShow allUsersAward={allUsersAward} />
								</div>
								{/* ) : null} */}
								{/* <div className={styles.message_bottom}>
									今日剩余<span>{count}</span>次抽奖机会
								</div> */}
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
											transform: `scale(0.83) rotate(${this.state.numdeg}deg)`,
											WebkitTransition: `-webkit-transform ${time}s ${transformType}`,
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
								<div className={styles.xieyi_box}>
									<span>参与即同意</span>
									<span
										className={styles.xieyi}
										onClick={() => {
											this.go('register_agreement_page');
										}}
									>
										《随行付金融用户注册协议》
									</span>
									<span
										className={styles.xieyi}
										onClick={() => {
											this.go('user_privacy_page');
										}}
									>
										《用户隐私权政策》
									</span>
								</div>
								{/* <div className={styles.submitBtn} onClick={this.goTo}>
                                    <div className={[ styles.btn, styles.btn1 ].join(' ')}>立赚500元现金</div>
                                    <div className={[ styles.btn, styles.btn2 ].join(' ')}></div>
                                </div> */}
								<div className={styles.submitBtn}>
									活动期间完成首次提现，可享受返现奖励，提现额度越高，返现奖励越大，最高500元，快前往随行付--还到参与吧！
								</div>
							</div>
						</div>
					</div>
				) : null}
			</div>
		);
	}
}
