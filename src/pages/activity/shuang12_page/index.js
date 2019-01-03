import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import styles from './index.scss';
import { store } from 'utils/store';
import AwardShowMock from './components/AwardShowMock';
import RuleShow from './components/RuleShow';
import LoginAlert from './components/LoginAlert';
import { setBackGround } from 'utils/setBackGround';
import { isBugBrowser,getNowDate } from 'utils';
import bg from './img/bg.png';
import zp_bg from './img/zp_bg.png';
import zp_btn from './img/zp_btn.png';
import zp_yuan from './img/zp_yuan.png';
import Cookie from 'js-cookie';
import { buriedPointEvent } from 'utils/analytins';
import { activity_shuang12 } from 'utils/analytinsType';
const API = {
	count: '/bigPan/count', // 用户抽奖次数查询
	userDraw: '/bigPan/draw', // 用户抽奖
	awardRecords: '/bigPan/list', // 我的奖品
	queryUsrSCOpenId: '/my/queryUsrSCOpenId' // 用户标识
};
let token = '';
@fetch.inject()
@setBackGround('#260451')
export default class shuang12_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			numdeg: 0,
			time: 0,
			transformType: 'cubic-bezier(.3,.5,.0001,1)',
			awardList: [],
			ruleDesc: '',
			alert_img: '',
			total: '0',
			type: '', // 弹框类型
			userAwardList: [] // 用户中奖列表
		};
	}
	isTurn = false;
	componentWillMount() {
		const query = qs.parse(location.search, { ignoreQueryPrefix: true });
		this.setState({
			query
		});
		const token = Cookie.get('fin-v-card-token');
		if (token) {
			if (isBugBrowser()) {
				store.setToken(token);
			} else {
				store.setTokenSession(token);
			}
			this.getcache();
		} else {
			this.setState({
				total: 3
			});
		}
	}
	componentDidMount() {}
	// 刷新大转盘数据
	refreshPage = () => {
		// this.gettotal();
	};
	// 用户中奖列表
	getAwardList = () => {
		this.props.$fetch.post(API.awardRecords).then((res) => {
			if (res.msgCode === 'PTM0000') {
				this.setState({
					type: 'jiangpin',
					userAwardList: res.data
				});
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};
	// 大转盘活动-用户抽奖剩余次数查询
	gettotal = () => {
		let id = sessionStorage.getItem('QueryUsrSCOpenId');
		this.props.$fetch.post(API.count).then((res) => {
			if (res.msgCode === 'PTM0000') {
				if (res.data && Number(res.data.total) > 0) {
					this.getDraw(res.data.total, id);
				} else {
					localStorage.setItem(`${getNowDate()}${id}total`, 0);
					this.setState({
						total: '0'
					});
					this.setState({
						type: 'no_chance'
					});
				}
			} else if (res.msgCode === 'PTM1000' || res.msgCode === 'PTM0100') {
				Cookie.remove('fin-v-card-token');
				// 打开弹窗按钮
				buriedPointEvent(activity_shuang12.shuang12_login_open);
				this.setState({
					type: 'alert_tel'
				});
				return;
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};
	// 获取我的奖品
	getMyAward = () => {
		token = Cookie.get('fin-v-card-token');
		if (!token) {
			// 打开弹窗按钮
			buriedPointEvent(activity_shuang12.shuang12_login_open);
			this.setState({
				type: 'alert_tel'
			});
			return;
		}
		this.getAwardList();
	};
	getcache = () => {
		if (!sessionStorage.getItem('QueryUsrSCOpenId')) {
			this.props.$fetch.get(API.queryUsrSCOpenId).then((res) => {
				console.log(res);
				if (res.msgCode === 'PTM0000') {
					sa.login(res.data);
					sessionStorage.setItem('QueryUsrSCOpenId', res.data);
					this.getStatus(res.data);
				} else {
					// 错误时处理
					sessionStorage.setItem('QueryUsrSCOpenId', +new Date());
				}
			});
		} else {
			this.getStatus(sessionStorage.getItem('QueryUsrSCOpenId'));
		}
	};
	getStatus = (id) => {
		// 返现上一次刷新的状态
		if (localStorage.getItem(`${getNowDate()}${id}total`)) {
			this.setState({
				total: localStorage.getItem(`${getNowDate()}${id}total`)
			});
		} else {
			this.setState({
				total: 3
			});
		}
	};
	// 用户抽奖
	getDraw = (total, id) => {
		this.props.$fetch.post(API.userDraw).then((res) => {
			if (res.msgCode === 'PTM0000') {
				localStorage.setItem(`${getNowDate()}${id}total`, Number(total) > 0 ? Number(total) - 1 : '0');
				this.setState({
					total: Number(total) > 0 ? Number(total) - 1 : '0'
				});
				this.zhuanpan(res.data);
			} else if (res.msgCode === 'PTM1000' || res.msgCode === 'PTM0100') {
				Cookie.remove('fin-v-card-token');
				// 打开弹窗按钮
				buriedPointEvent(activity_shuang12.shuang12_login_open);
				this.setState({
					type: 'alert_tel'
				});
				return;
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};
	// 转盘开始转
	zhuanpan = (obj) => {
		this.isRotated = true;
		let index = Number(obj.prizeId);
		setTimeout(() => {
			this.setState({
				num: Number(index) + this.state.num //得到本次位置
			});
			let deg = 360 / 8;
			this.setState(
				{
					numdeg: 360 * 4 + this.state.numdeg + (8 - index) * deg + deg / 2 + (360 - this.state.numdeg % 360),
					time: 7.5
				},
				() => {
					console.log(this.state.numdeg);
				}
			);
			setTimeout(() => {
				switch (obj.prizeId) {
					case '7':
						this.setState({
							type: 'alert_15'
						});
						break;
					default:
						this.setState({
							type: 'no_award'
						});
				}
				this.isRotated = false; //旋转改为false说明没有旋转
			}, 7000);
		}, 0);
	};
	// 转盘按钮
	onloadZhuan = async () => {
		this.gettotal();
		// 立即抽奖按钮
		buriedPointEvent(activity_shuang12.shuang12_go_draw);
		token = Cookie.get('fin-v-card-token');
		if (!token) {
			// 打开弹窗按钮
			buriedPointEvent(activity_shuang12.shuang12_login_open);
			this.setState({
				type: 'alert_tel'
			});
			return;
		}
		let id = sessionStorage.getItem('QueryUsrSCOpenId');
		if (id && localStorage.getItem(`${getNowDate()}${id}total`) && Number(localStorage.getItem(`${getNowDate()}${id}total`)) <= 0) {
			this.setState({
				total: '0',
				type: 'no_chance'
			});
			return;
		}
		if (this.isRotated) return; //如果正在旋转退出程序
	};

	setalertType = (type) => {
		this.setState({
			type
		});
	};
	// 立即使用
	goRoute = () => {
		// console.log('立即使用');
		this.props.history.replace('/home/home');
	};
	render() {
		const { time, transformType, type, userAwardList, total, alert_img } = this.state;
		return (
			<div className={styles.dazhuanpan}>
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
						<div className={styles.AwardShowMock_box}>
							<AwardShowMock />
						</div>
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
									<img src={zp_yuan} />
								</div>
							</div>
						</div>
						<div className={styles.btn_box}>
							<div
								className={styles.myRule}
								onClick={() => {
									this.setState({
										type: 'rule_show'
									});
								}}
							>
								<span>活动规则</span>
							</div>
							<div className={styles.myAward} onClick={this.getMyAward}>
								<span>我的奖品</span>
							</div>
						</div>
						{this.state.ruleDesc ? (
							<div className={styles.get_rule_desc}>
								<RuleShow ruleDesc={this.state.ruleDesc} />
							</div>
						) : null}
					</div>
				</div>
			</div>
		);
	}
}
