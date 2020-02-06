import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import style from './index.scss';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { isWXOpen } from 'utils';
import { FooterBar, LoadingView } from 'components';
import { setBackGround } from 'utils/background';
import Image from 'assets/image';
import { bill_queryBillList } from 'fetch/api';
import SectionList from './components/SectionList';
import utils from 'utils/CommonUtil';
import dayjs from 'dayjs';
let hasNext = true;
const API = {
	msgRead: '/my/msgRead',
	msgCount: '/my/msgCount',
	billList: '/bill/list',
	couponRedDot: '/index/couponRedDot' // 优惠券红点
};

let token = '';
let tokenFromStorage = '';
let uploadData = {};

const noData = {
	img: Image.bg.no_order,
	text: '暂无账单',
	width: '100%',
	height: '100%'
};
const errorData = {
	img: Image.bg.no_network,
	text: '网络错误,点击重试'
};
@fetch.inject()
@setBackGround('#F0F3F9')
export default class order_page extends PureComponent {
	constructor(props) {
		super(props);
		// 获取token
		token = Cookie.get('FIN-HD-AUTH-TOKEN');
		tokenFromStorage = store.getToken();
		this.state = {
			dataSource: [],
			isFinishDone: false,
			isLoadingMore: false,
			refreshing: true,
			isLoading: true,
			pageIndex: 0,
			Listlength: 0,
			rData: [],
			tabState: false,
			msgReadAllState: false,
			msgType: 0,
			hasMore: true,
			limitRow: 10
		};
	}
	scrollTop = 0;

	//当前页面
	currentPage = 1;
	//每页的size
	pageSize = 5;

	componentWillMount() {
		this.props.globalTask(null);
		// 重新设置HistoryRouter，解决点击两次才能弹出退出框的问题
		if (isWXOpen()) {
			store.setHistoryRouter(window.location.pathname);
		}
		// 处理详情返回之后
		let backDatastr = store.getBackData();
		if (backDatastr && JSON.stringify(backDatastr) !== '{}') {
			// let backData = store.getBackData();
			// hasNext = backData && backData.hasNext;
			// this.setState(
			// 	{
			// 		msgType: backData && backData.msgType,
			// 		rData: backData && backData.rData,
			// 		pageIndex: backData && backData.pageIndex,
			// 		hasMore: true,
			// 		Listlength: backData && backData.rData && backData.rData.length
			// 	},
			// 	() => {
			// 		this.setState({
			// 			dataSource: this.state.dataSource.cloneWithRows(backData.rData),
			// 			tabState: true,
			// 			refreshing: false,
			// 			isLoading: false
			// 		});
			// 	}
			// );
		} else {
			hasNext = true;
			// this.couponRedDot();
			this.getLoanList(1);
		}
	}
	componentDidMount() {
		// // 返回展示数据
		// let backData = store.getBackData();
		// if (backData && backData.scrollTop) {
		// 	setTimeout(() => this.lv.scrollTo(0, backData.scrollTop), 0);
		// }
	}
	couponRedDot = () => {
		this.props.$fetch.get(API.couponRedDot).then((result) => {
			if (result && result.data) {
				this.props.globalTask(result.data);
			}
		});
	};

	/**
	 * 获取订单信息
	 */
	getLoanList = (currentPage) => {
		//上传数据
		uploadData = {
			startPage: currentPage,
			pageRow: this.pageSize
		};
		this.setState({
			isLoadingMore: currentPage > 1
		});
		this.props.$fetch
			.post(bill_queryBillList, uploadData, { hideLoading: true })
			.then((res) => {
				if (res.code === '000000') {
					if (res && res.data && res.data.bills && res.data.bills.length > 0) {
						if (currentPage === 1) {
							this.setState({
								dataSource: res.data.bills
							});
							this.viewRef && this.viewRef.showDataView();
						} else {
							this.setState({
								dataSource: this.state.dataSource.concat(res.data.bills)
							});
						}
						this.setState({
							isFinishDone: this.state.dataSource.length < 5
						});
					} else if (currentPage === 1) {
						this.setState({
							dataSource: []
						});
						this.viewRef && this.viewRef.setEmpty();
					} else {
						currentPage--;
						this.setState({
							isFinishDone: true
						});
					}
				} else if (currentPage === 1) {
					this.setState({
						dataSource: []
					});
					this.viewRef && this.viewRef.setEmpty();
				} else {
					currentPage--;
					this.setState({
						isFinishDone: true
					});
				}
			})
			.catch(() => {
				currentPage--;
				this.viewRef && this.viewRef.setEmpty();
			})
			.finally(() => {
				this.setState({
					isLoadingMore: false
				});
			});
	};

	/**
	 * @description 重新加载数据
	 */
	onReloadData = () => {
		this.setState({
			isFinishDone: false
		});
		this.getLoanList(1);
	};

	// 查看详情
	gotoDesc = (obj) => {
		const { billSts } = obj;
		if (billSts !== '0' && billSts !== '2') {
			// let backData = {
			// 	scrollTop: this.scrollTop || 0,
			// 	rData: this.state.rData,
			// 	billNo: obj.billNo,
			// 	pageIndex: this.state.pageIndex,
			// 	hasNext: hasNext
			// };

			// store.setBackData(backData);
			// store.setBillNo(obj.billNo);
			this.props.history.push({
				pathname: `/order/order_detail_page`,
				state: {
					billNo: obj.billNo
				}
			});
		}
	};

	// 去登陆
	goLogin = () => {
		this.props.history.push('/login');
	};

	//加载更多数据
	handleLoadMore = () => {
		this.getLoanList(++this.currentPage);
	};

	/**
	 * @description 生成分组标题组件
	 */
	renderGroupTitle(title) {
		return (
			<div className={style.groupTitleWrap}>
				<span className={style.groupTitle}>{title}年</span>
			</div>
		);
	}

	/**
	 * @description 生成列表 item
	 */
	renderItem(item, index) {
		return (
			<div className={style.listItem} key={index}>
				<div className={style.listItemLeft}>
					<span className={style.itemLabel}>
						借款￥<em>{item.loanAmt && utils.thousandFormatNum(item.loanAmt)}</em>
					</span>
					<div className={style.itemDesc}>
						<em>{dayjs(item.billRegDt).format('YYYY/MM/DD')}</em>
						<span>
							共<span>{item.perdCnt}</span>期
						</span>
					</div>
				</div>
				<div
					className={style.listItemRight}
					style={{ color: item.color }}
					onClick={() => {
						this.gotoDesc(item);
					}}
				>
					<span>{item.billStsNm}</span>
					<img src={Image.icon.trigon_right_black} className={style.trigon_right_black} />
				</div>
			</div>
		);
	}

	/**
	 * @description 生成分组列表数据
	 */
	handleGenerateBillGroupArr() {
		const billGroupObj = this.GenerateBillGroupObj();

		let billGroupArr = [];
		Object.keys(billGroupObj)
			.sort((a, b) => b - a)
			.forEach((item) => {
				billGroupArr.push({
					title: item,
					data: JSON.parse(JSON.stringify(billGroupObj[item]))
				});
			});
		return billGroupArr;
	}

	/**
	 * @description 数据格式化 按日期进行分组
	 */
	GenerateBillGroupObj() {
		const { dataSource = [] } = this.state;
		let billGroupObj = {};
		dataSource.forEach((item) => {
			let years = dayjs(item.billRegDt).format('YYYY');
			if (!billGroupObj[years]) {
				billGroupObj[years] = [];
				billGroupObj[years].push(JSON.parse(JSON.stringify(item)));
			} else {
				billGroupObj[years].push(JSON.parse(JSON.stringify(item)));
			}
		});
		return billGroupObj;
	}

	/**
	 * @description 生成尾部组件 包含公司名
	 */
	renderFooterComponentWrap() {
		return (
			<div>
				{this.renderFooterComponent()}
				{/* {this.state.rData.length > 5 ? <FooterBar /> : null} */}
			</div>
		);
	}

	/**
	 * @description 生成尾部组件
	 */
	renderFooterComponent() {
		if (!this.state.dataSource || this.state.dataSource.length < 5) {
			return null;
		}
		if (this.state.isFinishDone) {
			return (
				<div className={style.listBottomText}>
					<span>没有更多数据了</span>
				</div>
			);
		}
		return (
			<div className={style.listBottomText} onClick={this.handleLoadMore}>
				<span>查看更多</span>
				<img src={Image.icon.trigon_right_black} className={style.trigon_right_black} />
			</div>
		);
	}

	render() {
		return (
			<div className={style.orderPage}>
				<div className={style.orderPageHead}>
					<strong className={style.orderPageHeadTitle}>账单</strong>
					<span className={style.orderPageHeadDesc}>还信用卡用还到，有账单就能还</span>
				</div>
				<div className={style.orderListCard}>
					<LoadingView
						ref={(view) => (this.viewRef = view)}
						nodata={noData}
						errordata={errorData}
						onReloadData={() => {
							this.onReloadData();
						}}
					>
						<SectionList
							renderItem={({ item, index }) => this.renderItem(item, index)}
							renderSectionHeader={({ section: { title } }) => this.renderGroupTitle(title)}
							sections={this.handleGenerateBillGroupArr()}
							// keyExtractor={(item, index) => item + index}
							ListFooterComponent={this.renderFooterComponentWrap()}
						/>
					</LoadingView>
				</div>
				{!this.state.dataSource || !this.state.dataSource.length || this.state.dataSource.length <= 5 ? (
					<FooterBar />
				) : null}
			</div>
		);
	}
}
