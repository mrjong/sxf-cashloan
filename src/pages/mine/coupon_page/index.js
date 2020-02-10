import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import style from './index.scss';
import fetch from 'sx-fetch';
import STabs from 'components/Tab';
import qs from 'qs';
import dayjs from 'dayjs';
import { store } from 'utils/store';
import { SXFToast } from 'utils/SXFToast';
import CountDown from './component/CountDown/index.js';
import { PullToRefresh, ListView } from 'antd-mobile';
// import { getNextStatus } from 'utils/CommonUtil/commonFunc';
import { connect } from 'react-redux';
import { setCouponDataAction } from 'reduxes/actions/commonActions';
import {
	coup_queryUsrCoupBySts
	// coup_queyUsrLoanUsbCoup, coup_queryUsrRepayUsbCoup
} from 'fetch/api';
let totalPage = false;
let receiveData = null;
let nouseFlag = false; //是否有可用优惠券的标识
let saveBankData = null; // 还款详情页带过来的银行信息
@connect(
	(state) => ({
		couponData: state.commonState.couponData
	}),
	{
		setCouponDataAction
	}
)
@fetch.inject()
export default class coupon_page extends PureComponent {
	constructor(props) {
		super(props);
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		receiveData = queryData;
		if (this.props.history.location.state && this.props.history.location.state.cardData) {
			saveBankData = this.props.history.location.state.cardData;
		}
		if (this.props.history.location.state && this.props.history.location.state.nouseCoupon) {
			nouseFlag = true;
		} else {
			nouseFlag = false;
		}
		const dataSource = new ListView.DataSource({
			rowHasChanged: (row1, row2) => row1 !== row2
		});

		this.state = {
			dataSource,
			refreshing: true,
			isLoading: true,
			height: document.documentElement.clientHeight,
			useBodyScroll: false,
			pageIndex: 1,
			Listlength: 0,
			rData: [],
			tabState: false,
			msgType: 0,
			hasMore: true,
			tabs: [],
			couponSelected: '',
			HomeBtnShow: false
		};
	}
	scrollTop = 0;
	componentWillMount() {
		this.getTab();
	}
	componentWillUnmount() {
		this.HomeBtnStatus = false;
		// 从不可使用的优惠劵点进来，显示弹框
		if (nouseFlag) {
			if (saveBankData) {
				store.setCardData(saveBankData);
			}
		}
	}
	componentDidMount() {
		this.calcHeight();
	}
	calcHeight() {
		const HeaderHeight = ReactDOM.findDOMNode(this.messageBox).offsetTop;
		setTimeout(() => {
			const tabBarHeight = ReactDOM.findDOMNode(this.messageTabBox).getElementsByClassName(
				'am-tabs-tab-bar-wrap'
			)[0].offsetHeight;
			const hei = document.documentElement.clientHeight - tabBarHeight - HeaderHeight;
			this.setState({
				height: hei
			});
		}, 600);
	}
	// 消息 tab
	getTab = () => {
		if (receiveData && (receiveData.billNo || receiveData.price)) {
			this.setState({
				tabs: [
					{
						title: '可使用',
						value: 0
					},
					{
						title: '不可使用',
						value: 1
					}
				],
				couponSelected: store.getCouponData() && store.getCouponData().usrCoupNo
			});
		} else {
			this.setState({
				tabs: [
					{
						title: '未使用',
						value: 0
					},
					{
						title: '已使用',
						value: 1
					},
					{
						title: '已失效',
						value: 2
					}
				]
			});
		}
		this.getCommonData('tabshow');
	};
	// 获取每一页数据
	genData = async (pIndex = 1, tab) => {
		if (totalPage && totalPage < pIndex) {
			this.setState({
				isLoading: false,
				pageIndex: totalPage
			});
			return [];
		}
		if (pIndex === 1) {
			SXFToast.loading('加载中...', 10000);
		}
		let sendParams = '';
		if (receiveData && receiveData.billNo) {
			sendParams = {
				coupSts: `0${this.state.msgType}`,
				startPage: pIndex,
				billNo: receiveData.billNo
				// loading: true,
			};
		} else if (receiveData && receiveData.price && receiveData.perCont && receiveData.prodId) {
			sendParams = {
				coupSts: `0${this.state.msgType}`,
				startPage: pIndex,
				price: receiveData.price,
				perCont: receiveData.perCont,
				prodId: receiveData.prodId
				// loading: true,
			};
		} else {
			sendParams = {
				coupSts: `0${this.state.msgType}`,
				startPage: pIndex
				// loading: true,
			};
		}
		if (receiveData.transactionType) {
			Object.assign(sendParams, { prodType: receiveData.transactionType === 'fenqi' ? '11' : '01' });
		}
		let data = await this.props.$fetch
			.post(coup_queryUsrCoupBySts, sendParams)
			.then((res) => {
				if (pIndex === 1) {
					setTimeout(() => {
						SXFToast.hide();
					}, 600);
				}
				if (res.code === '000000' && res.data) {
					let dataArr = [];
					if (pIndex === 1) {
						totalPage = Math.ceil(res.data.totalSize / 10);
						this.setState({
							hasMore: false
						});
					}
					for (let i = res.data.coups.length - 1; i >= 0; i--) {
						// 是否出现去使用
						if (
							this.state.msgType === 0 &&
							+new Date(this.getTime(res.data.coups[i].validEndTm)) > +new Date() &&
							!this.HomeBtnStatus &&
							tab === 'tabshow' &&
							pIndex === 1 &&
							receiveData &&
							receiveData.entryFrom &&
							receiveData.entryFrom === 'mine'
						) {
							this.HomeBtnStatus = true;
							this['HomeBtn'].fetchData();
						}
						if (
							this.state.msgType !== 0 ||
							!receiveData ||
							(!receiveData.billNo && !receiveData.price) ||
							res.data.coups[i].usrCoupNo !== store.getCouponData().usrCoupNo
						) {
							dataArr.push(res.data.coups[i]);
						}
					}
					// 倒叙插入
					if (pIndex === 1) {
						if (
							receiveData &&
							(receiveData.billNo || receiveData.price) &&
							this.state.msgType === 0 &&
							store.getCouponData() &&
							store.getCouponData().usrCoupNo !== 'null'
						) {
							dataArr.push(store.getCouponData());
						}
					}
					return dataArr;
				}
				return [];
			})
			.catch(() => {
				if (pIndex === 1) {
					setTimeout(() => {
						SXFToast.hide();
					}, 600);
				}
			});
		return data;
	};

	// 刷新
	onRefresh = () => {
		totalPage = false;
		this.setState({ refreshing: true, isLoading: true });
		this.getCommonData();
	};

	// 公用
	getCommonData = async (tab) => {
		this.setState({
			isLoading: true
		});
		let list = await this.genData(1, tab);
		if (tab === 'tabshow') {
			this.setState({
				tabState: true
			});
		}
		this.setState({
			rData: list,
			Listlength: list.length,
			dataSource: this.state.dataSource.cloneWithRows(list),
			refreshing: false,
			isLoading: false,
			pageIndex: 1
		});
	};
	// 渲染每一页完成之后
	onEndReached = async () => {
		if (this.state.isLoading && !this.state.hasMore) {
			return;
		}
		this.setState({ isLoading: true });
		let list = await this.genData(++this.state.pageIndex);
		if (list.length === 0) {
			return;
		}
		this.setState({
			rData: [...this.state.rData, ...list],
			dataSource: this.state.dataSource.cloneWithRows([...this.state.rData, ...list]),
			isLoading: false
		});
	};
	// 滚动高度
	handleScroll = (event) => {
		this.scrollTop = event.target.scrollTop;
	};
	// 选择优惠劵
	selectCoupon = (obj) => {
		if (this.state.msgType === 1) {
			return;
		}
		this.setState({
			couponSelected: obj === 'null' ? 'null' : obj.usrCoupNo
		});
		const couponData = obj === 'null' ? { coupVal: -1, usrCoupNo: 'null' } : obj;
		store.setCouponData(couponData);
		if (saveBankData) {
			store.setCardData(saveBankData);
		}
		// 跳转回详情页
		this.props.history.goBack();
	};
	// 切换tab
	changeTab = (tab) => {
		this.setState(
			{
				msgType: tab.value,
				rData: []
			},
			() => {
				this.getCommonData();
			}
		);
	};
	getTime = (time) => {
		if (!time) {
			return '';
		}
		const y = time.substring(0, 4);
		const m = time.substring(4, 6);
		const d = time.substring(6, 8);
		const h = time.substring(8, 10);
		const m1 = time.substring(10, 12);
		const s = time.substring(12, 14);
		return `${y}/${m}/${d} ${h}:${m1}:${s}`;
	};
	render() {
		const separator = (sectionID, rowID) => <div key={`${sectionID}-${rowID}`} />;
		let index = this.state.rData && this.state.rData.length - 1;
		const row = (rowData, sectionID, rowID) => {
			if (index < 0) {
				index = this.state.rData && this.state.rData.length - 1;
			}
			const obj = this.state.rData && this.state.rData[index--];
			return (
				// "useSts","该优惠券状态 ,默认'00'-未使用，00未使用 01已锁定 02已使用 03已作废 99全部"
				<div
					onClick={
						receiveData && (receiveData.billNo || receiveData.price)
							? () => {
									this.selectCoupon(obj);
							  }
							: null
					}
					key={rowID}
					className={
						(obj && obj.useSts === '00') || (obj && obj.useSts === '01')
							? [style.box, style.box_active].join(' ')
							: [style.box, style.box_default].join(' ')
					}
				>
					<div className={style.box_coupon}>
						<div>
							<div className={style.leftBox}>
								<div className={style.leftBoxLineBox}>
									{obj && obj.coupCategory === '00' ? (
										<span>
											<i className={style.money}>{obj && obj.coupVal}</i>元
										</span>
									) : obj && obj.coupCategory === '03' ? (
										<span className={style.couponType2}>免息</span>
									) : obj && obj.coupCategory === '01' ? (
										<span className={style.couponType3}>
											<i>{obj && obj.coupVal}</i>折
										</span>
									) : obj && obj.coupCategory === '02' ? (
										<span className={style.couponType4}>
											<i>免</i>
											<i className={style.dayNum}>{obj && obj.coupVal}</i>
											<br />
											<span className={style.littleFont}>天息费</span>
										</span>
									) : null}
								</div>
							</div>
							<div
								className={
									receiveData && (receiveData.billNo || receiveData.price) && this.state.msgType === 0
										? `${style.rightBox} ${style.rightLittleBox}`
										: style.rightBox
								}
							>
								{receiveData && (receiveData.billNo || receiveData.price) && this.state.msgType === 0 ? (
									<i
										className={
											obj && obj.usrCoupNo === this.state.couponSelected
												? [style.icon_select_status, style.icon_select].join(' ')
												: [style.icon_select_status, style.icon_select_not].join(' ')
										}
									/>
								) : receiveData &&
								  (receiveData.billNo || receiveData.price) &&
								  this.state.msgType === 1 ? null : (
									<i
										className={
											obj && obj.useSts === '00'
												? ''
												: obj && obj.useSts === '01'
												? [style.icon_status, style.icon_useing].join(' ')
												: obj && obj.useSts === '02'
												? [style.icon_status, style.icon_used].join(' ')
												: [style.icon_status, style.icon_use_over].join(' ')
										}
									/>
								)}
								<button
									className={style.goUse}
									onClick={() => {
										this['HomeBtn'].getData();
									}}
								>
									去使用
								</button>
								<div
									className={
										obj.useSts === '02' || obj.useSts === '03'
											? `${style.title} ${style.ellipsis} ${style.textGray}`
											: `${style.title} ${style.ellipsis}`
									}
								>
									{obj && obj.coupNm}
								</div>
								<div
									className={
										obj.useSts === '02' || obj.useSts === '03'
											? `${style.ellipsis} ${style.textGray}`
											: style.ellipsis
									}
								>
									{(obj && obj.coupDesc) || <div className={style.none}>_</div>}
								</div>
								<div className={obj.useSts === '02' || obj.useSts === '03' ? `${style.textGray}` : ''}>
									{this.state.msgType === 0 &&
									receiveData &&
									receiveData.entryFrom &&
									receiveData.entryFrom === 'mine' ? (
										<span>
											有效期还剩{' '}
											{obj && obj.validEndTm && (
												<CountDown
													endTime={this.getTime(obj.validEndTm)}
													timeOver={() => {
														let now = +new Date();
														let thisTime = +new Date(this.getTime(obj.validEndTm));
														if (now > thisTime) {
															return;
														}
														this.onRefresh();
													}}
													type="day"
												/>
											)}
										</span>
									) : (
										<span>
											有效期至：{' '}
											{obj &&
												obj.validEndTm &&
												obj.validEndTm.length &&
												dayjs(obj.validEndTm.substring(0, obj.validEndTm.length - 4)).format('YYYY-MM-DD')}
										</span>
									)}
								</div>
							</div>
						</div>
						<div>
							<div>
								查看详情<i></i>
							</div>
							<div>
								本券发放于新手免洗活动，自动领取成功后，有效期7天本券发放于免息活动，自领取本券成功后。
							</div>
						</div>
					</div>
				</div>
			);
		};
		const item = (classN) => {
			if (this.state.rData && this.state.rData.length > 0) {
				return (
					<ListView
						className={`${classN} ${style.no_header}`}
						initialListSize={this.state.Listlength}
						onEndReachedThreshold={100}
						onScroll={this.handleScroll}
						key={this.state.useBodyScroll ? '0' : '1'}
						ref={(el) => (this.lv = el)}
						dataSource={this.state.dataSource}
						renderHeader={() => {
							return receiveData &&
								(receiveData.billNo || receiveData.price) &&
								classN === 'iview0' &&
								!nouseFlag ? (
								<h3
									onClick={() => {
										this.selectCoupon('null');
									}}
									className={style.no_use_coupon}
								>
									<span>不使用优惠券</span>
									<i
										className={
											'null' === this.state.couponSelected
												? [style.icon_select_status, style.icon_select].join(' ')
												: [style.icon_select_status, style.icon_select_not].join(' ')
										}
									/>
								</h3>
							) : null;
						}}
						renderFooter={() => (
							<div
								style={{ paddingBottom: 30, textAlign: 'center' }}
								className={!this.state.isLoading ? style.reach_bottom : null}
							>
								{this.state.isLoading ? '加载中...' : <span>已无更多优惠劵</span>}
							</div>
						)}
						renderRow={row}
						renderSeparator={separator}
						useBodyScroll={this.state.useBodyScroll}
						style={
							this.state.useBodyScroll
								? {}
								: {
										height: this.state.height
								  }
						}
						pullToRefresh={<PullToRefresh refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}
						onEndReached={this.onEndReached}
						pageSize={1}
					/>
				);
			}
			return (
				<div className={style.noMsg}>
					<i />
					还没有券哦～
				</div>
			);
		};
		return (
			<div className="coupon_page" ref={(el) => (this.messageBox = el)}>
				{this.state.tabState ? (
					<STabs
						tabTit={this.state.tabs}
						initialPage={this.state.msgType}
						onChange={(tab, index) => {
							this.changeTab(tab, index);
						}}
						swipeable={false}
						ref={(el) => (this.messageTabBox = el)}
					>
						{this.state.tabs.map((item2, index2) => (
              <
							// <div key={index2}>{item(`iview${index2}`)}</div>
						))}
					</STabs>
				) : null}
			</div>
		);
	}
}
