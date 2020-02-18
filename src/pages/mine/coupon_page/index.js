import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import style from './index.scss';
import fetch from 'sx-fetch';
import STabs from 'components/Tab';
import { LoadingView } from 'components';
import qs from 'qs';
import dayjs from 'dayjs';
import { getNextStatus } from 'utils/CommonUtil/getNextStatus';
import { SXFToast } from 'utils/SXFToast';
import CountDown from './component/CountDown/index.js';
import { PullToRefresh, ListView, Toast } from 'antd-mobile';
import { connect } from 'react-redux';
import { setCouponDataAction } from 'reduxes/actions/commonActions';
import { coup_queryUsrCoupBySts, coup_queyUsrLoanUsbCoup, coup_queryUsrRepayUsbCoup } from 'fetch/api';
import Images from 'assets/image';
let totalPage = false;
let receiveData = null;
let nouseFlag = false; //是否有可用优惠券的标识
const noData = {
	img: Images.bg.no_message,
	text: '暂无账单',
	width: '100%',
	height: '100%'
};
const errorData = {
	img: Images.bg.no_network,
	text: '网络错误,点击重试'
};
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
	componentWillUnmount() {}
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
		const { couponData = {} } = this.props;
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
				couponSelected: couponData.coupId || 'null'
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
	genData = async (pIndex = 1) => {
		const { couponData = {} } = this.props;
		if (totalPage && totalPage < pIndex) {
			this.setState({
				isLoading: false,
				pageIndex: totalPage
			});
			return [];
		}
		if (pIndex === 1) {
			SXFToast.loading('数据加载中...', 10000);
		}
		const apiAndSendData = this.getApiAndSendData(pIndex);
		let data = await this.props.$fetch
			.post(apiAndSendData.url, apiAndSendData.sendParams)
			.then((res) => {
				if (pIndex === 1) {
					setTimeout(() => {
						SXFToast.hide();
					}, 600);
				}
				if (res.code === '000000' && res.data) {
					let dataArr = [];
					if (pIndex === 1) {
						totalPage = res.data.totalPage;
						this.setState({
							hasMore: false
						});
					}
					for (let i = res.data.coups.length - 1; i >= 0; i--) {
						if (
							this.state.msgType !== 0 ||
							!receiveData ||
							(!receiveData.billNo && !receiveData.price) ||
							res.data.coups[i].coupId !== couponData.coupId
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
							couponData.coupId &&
							couponData.coupId !== 'null'
						) {
							dataArr.push(couponData);
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

	/**
	 * @description 生成 接口 和上传参数
	 */
	getApiAndSendData = (pIndex) => {
		let sendParams = '';
		let url = '';
		if (receiveData && receiveData.billNo) {
			sendParams = {
				coupSts: `0${this.state.msgType}`,
				startPage: pIndex,
				billNo: receiveData.billNo,
				repayPerd: receiveData.perCont,
				prodType: receiveData.prodType
				// loading: true,
			};
			url = coup_queryUsrRepayUsbCoup;
		} else if (receiveData && receiveData.price && receiveData.prodType && receiveData.prodId) {
			sendParams = {
				coupSts: `0${this.state.msgType}`,
				startPage: pIndex,
				loanAmt: receiveData.price,
				prodId: receiveData.prodId,
				prodType: receiveData.prodType
				// loading: true,
			};
			url = coup_queyUsrLoanUsbCoup;
		} else {
			sendParams = {
				coupSts: `0${this.state.msgType}`,
				startPage: pIndex
				// loading: true,
			};
			url = coup_queryUsrCoupBySts;
		}
		return {
			url,
			sendParams
		};
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
		let list = await this.genData(1, tab).catch(() => {
			this.viewRef && this.viewRef.setEmpty();
		});
		this.viewRef && this.viewRef.showDataView();
		if (tab === 'tabshow') {
			this.setState({
				tabState: true
			});
		}
		this.setState({
			rData: list,
			Listlength: list && list.length ? list.length : 0,
			dataSource:
				list && list.length
					? this.state.dataSource.cloneWithRows(list)
					: this.state.dataSource.cloneWithRows([]),
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
			couponSelected: obj === 'null' ? 'null' : obj.coupId
		});
		const couponData = obj === 'null' ? { coupVal: -1, coupId: 'null' } : obj;
		this.props.setCouponDataAction(couponData);
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

	// 判断使用场景 + 优惠券类型
	renderCouponType = (item) => {
		const { useScene, coupTyp } = item;
		let useSceneStr = '';
		let coupTypStr = '';
		switch (useScene) {
			// 使用场景
			// 00借款 01还款 02不限
			case '00':
				useSceneStr = '借款';
				break;
			case '01':
				useSceneStr = '还款';
				break;
			default:
				break;
		}
		switch (coupTyp) {
			// 优惠券类型:
			// 00-抵息券 01-信用审核费券 02-分期服务费券 03-逾期费券 04-滞纳金券
			case '00':
				coupTypStr = '抵息券';
				break;
			case '01':
				coupTypStr = '信用审\n核费券';
				break;
			case '02':
				coupTypStr = '抵费券';
				break;
			case '03':
				coupTypStr = '逾期费券';
				break;
			case '04':
				coupTypStr = '滞纳金券';
				break;
			default:
				break;
		}
		return useSceneStr + coupTypStr;
	};
	/**
	 * 点击显示隐藏详情
	 * @param  无
	 * @return {void}
	 */
	showDetail = (info) => {
		this.setState({
			[`isShowCouponDesc${this.state.msgType}${info.coupId}`]: !this.state[
				`isShowCouponDesc${this.state.msgType}${info.coupId}`
			]
		});
	};
	render() {
		const separator = (sectionID, rowID) => <div key={`${sectionID}-${rowID}`} />;
		let index = this.state.rData && this.state.rData.length - 1;
		const row = (rowData, sectionID, rowID) => {
			if (index < 0) {
				index = this.state.rData && this.state.rData.length - 1;
			}
			const obj = this.state.rData && this.state.rData[index--];
			const isInvalid = obj.useSts === '02' || obj.useSts === '03';
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
						(obj && obj.useSts === '02') || (obj && obj.useSts === '03')
							? [style.box, style.box_default].join(' ')
							: [style.box, style.box_active].join(' ')
					}
				>
					<div className={style.box_coupon}>
						<div className={[style.box_top, obj.coupDesc ? style.box_top_copy : ''].join(' ')}>
							<div className={style.leftBox}>
								<div className={style.leftBoxLineBox}>
									{obj && obj.coupCategory === '00' ? (
										<div className={style.leftCont}>
											<i className={style.money}>{obj && obj.coupVal}</i>元
											<p className={style.leftDesc}>{this.renderCouponType(obj)}</p>
										</div>
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
											<span className={style.littleFont}>天</span>
										</span>
									) : null}
								</div>
							</div>
							<div className={style.rightBox}>
								{receiveData && receiveData.entryFrom && receiveData.entryFrom === 'mine' ? (
									<button
										className={style.goUse}
										onClick={
											this.state.msgType === 0
												? () => {
														Toast.loading('加载中...');
														getNextStatus({ $props: this.props });
												  }
												: () => {}
										}
									>
										去使用
									</button>
								) : null}

								<div
									className={
										isInvalid
											? `${style.title} ${style.ellipsis} ${style.textGray}`
											: `${style.title} ${style.ellipsis}`
									}
								>
									{obj && obj.coupNm}
								</div>
								<div
									className={
										isInvalid
											? `${style.ellipsis} ${style.textGray} ${style.twoLine}`
											: `${style.ellipsis} ${style.twoLine}`
									}
								>
									{obj && obj.coupUseScene}
								</div>
								<div className={isInvalid ? `${style.textGray}` : ''}>
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
							{receiveData && (receiveData.billNo || receiveData.price) && this.state.msgType === 0 ? (
								<i
									className={
										obj && obj.coupId === this.state.couponSelected
											? [style.icon_select_status, style.icon_select].join(' ')
											: [style.icon_select_status, style.icon_select_not].join(' ')
									}
								/>
							) : null}
						</div>
						{obj && obj.coupDesc ? (
							<div className={style.descBox}>
								<div className={style.desctitle} onClick={() => this.showDetail(obj)}>
									查看详情
									<i
										className={
											this.state[`isShowCouponDesc${this.state.msgType}${obj.coupId}`]
												? style.topArrow
												: style.bottomArrow
										}
									></i>
								</div>
								{this.state[`isShowCouponDesc${this.state.msgType}${obj.coupId}`] ? (
									<div>{obj && obj.coupDesc}</div>
								) : null}
							</div>
						) : null}
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
					<img className={style.noMsgImg} src={Images.bg.no_coupon} alt="" />
					还没有券哦～
				</div>
			);
		};
		return (
			<div className="coupon_page" ref={(el) => (this.messageBox = el)}>
				<LoadingView
					ref={(view) => (this.viewRef = view)}
					nodata={noData}
					errordata={errorData}
					onReloadData={() => {
						this.onRefresh();
					}}
				>
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
								<div key={index2}>{item(`iview${index2}`)}</div>
							))}
						</STabs>
					) : null}
				</LoadingView>
			</div>
		);
	}
}
