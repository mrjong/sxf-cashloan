import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import style from './index.scss';
import fetch from 'sx-fetch';
import { List, ListView } from 'antd-mobile';
import { store } from 'utils/store';
import { isWXOpen } from 'utils';
// import SXFButton from 'components/ButtonCustom';
import { FooterBar } from 'components';
import { setBackGround } from 'utils/background';
import Image from 'assets/image';

import SectionList from './components/SectionList';
import utils from 'utils/CommonUtil';
import dayjs from 'dayjs';
let hasNext = true;
const Item = List.Item;
// const Brief = Item.Brief;
const API = {
	msgRead: '/my/msgRead',
	msgCount: '/my/msgCount',
	billList: '/bill/list',
	couponRedDot: '/index/couponRedDot' // 优惠券红点
};

// let token = '';
// let tokenFromStorage = '';
@fetch.inject()
@setBackGround('#F0F3F9')
export default class order_page extends PureComponent {
	constructor(props) {
		super(props);
		// 获取token
		token = Cookie.get('FIN-HD-AUTH-TOKEN');
		tokenFromStorage = store.getToken();
		const dataSource = new ListView.DataSource({
			rowHasChanged: (row1, row2) => row1 !== row2
		});

		this.state = {
			dataSource,
			refreshing: true,
			isLoading: true,
			useBodyScroll: false,
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
	componentWillMount() {
		this.props.globalTask(null);
		// 重新设置HistoryRouter，解决点击两次才能弹出退出框的问题
		if (isWXOpen()) {
			store.setHistoryRouter(window.location.pathname);
		}
		// 处理详情返回之后
		let backDatastr = store.getBackData();
		if (backDatastr && JSON.stringify(backDatastr) !== '{}') {
			let backData = store.getBackData();
			hasNext = backData && backData.hasNext;
			this.setState(
				{
					msgType: backData && backData.msgType,
					rData: backData && backData.rData,
					pageIndex: backData && backData.pageIndex,
					hasMore: true,
					Listlength: backData && backData.rData && backData.rData.length
				},
				() => {
					this.setState({
						dataSource: this.state.dataSource.cloneWithRows(backData.rData),
						tabState: true,
						refreshing: false,
						isLoading: false
					});
				}
			);
		} else {
			hasNext = true;
			this.couponRedDot();
			this.getCommonData();
		}
	}
	componentDidMount() {
		// 返回展示数据
		let backData = store.getBackData();
		if (backData && backData.scrollTop) {
			setTimeout(() => this.lv.scrollTo(0, backData.scrollTop), 0);
		}
	}
	couponRedDot = () => {
		this.props.$fetch.get(API.couponRedDot).then((result) => {
			if (result && result.data) {
				this.props.globalTask(result.data);
			}
		});
	};
	// 获取每一页数据
	genData = async (pIndex = 0) => {
		if (!hasNext) {
			this.setState({
				isLoading: false,
				pageIndex: this.state.pageIndex - 1
			});
			return [];
		}
		if (pIndex === 0) {
			this.props.SXFToast.loading('数据加载中...', 10000);
		}
		let data = await this.props.$fetch
			.post(API.billList, {
				qryType: 0,
				startRow: pIndex * this.state.limitRow,
				limitRow: this.state.limitRow
			})
			.then((res) => {
				if (pIndex === 0) {
					setTimeout(() => {
						this.props.SXFToast.hide();
					}, 600);
				}
				if (res.msgCode === 'PTM0000') {
					if (pIndex === 0) {
						this.setState({
							hasMore: false
						});
					}
					// 判断是否为最后一页
					if (res.data.length < this.state.limitRow) {
						hasNext = false;
					}
					let dataArr = [];
					// dataArr = res.data.msgList
					// for (let x = 0; x < 10; x++) {
					for (let i = res.data.length - 1; i >= 0; i--) {
						dataArr.push({
							...res.data[i],
							billDt: `${dayjs(res.data[i].billDt).format('YYYY年MM月DD日')}借款`
						});
						// }
					}
					return dataArr;
				}
				return [];
			})
			.catch(() => {
				if (pIndex === 0) {
					setTimeout(() => {
						this.setState({
							isLoading: false,
							refreshing: false
						});
						this.props.SXFToast.hide();
					}, 600);
				}
			});
		return data;
	};
	// 刷新
	onRefresh = () => {
		setTimeout(() => {
			hasNext = true;
			this.setState({ refreshing: true, isLoading: true });
			this.getCommonData();
		}, 600);
	};
	// 公用
	getCommonData = async () => {
		this.setState({
			isLoading: true
		});
		let list = await this.genData(0);
		this.setState(
			{
				rData: list,
				Listlength: list.length,
				dataSource: this.state.dataSource.cloneWithRows(list),
				refreshing: false,
				isLoading: false,
				pageIndex: 0
			},
			() => {
				let backData = {
					rData: this.state.rData
				};
				store.setBackData(backData);
			}
		);
	};
	// 渲染每一页完成之后
	onEndReached = async () => {
		if (this.state.isLoading && !this.state.hasMore) {
			this.setState({
				pageIndex: this.state.pageIndex - 1 ? this.state.pageIndex - 1 : 0
			});
			return;
		}
		this.setState({ isLoading: true });
		let list = await this.genData(++this.state.pageIndex);
		if (list.length === 0) {
			this.setState({ isLoading: false });
			return;
		}
		this.setState(
			{
				rData: [...list, ...this.state.rData],
				dataSource: this.state.dataSource.cloneWithRows([...list, ...this.state.rData]),
				isLoading: false
			},
			() => {}
		);
	};
	// 滚动高度
	handleScroll = (event) => {
		this.scrollTop = event.target.scrollTop;
	};
	// 查看详情
	gotoDesc = (obj) => {
		// 账单状态(0：放款成功,1：已逾期,2：还款中,4：已还清;  已撤销状态专用于免手续费时间限制内的全额退款)， -2: 放款中  -1放款失败
		const noDetailsPageArr = ['-2', '-1'];
		if (noDetailsPageArr.includes(obj.billSts)) {
			return;
		}
		let backData = {
			scrollTop: this.scrollTop || 0,
			rData: this.state.rData,
			billNo: obj.billNo,
			pageIndex: this.state.pageIndex,
			hasNext: hasNext
		};

		// 0:无，1:URL，2:文本，3:APP"
		store.setBackData(backData);
		store.setBillNo(obj.billNo);
		this.props.history.push(`/order/order_detail_page`);
	};
	// 切换tab
	changeTab = (tab, index) => {
		this.setState(
			{
				msgType: index,
				rData: []
			},
			() => {
				this.getCommonData();
			}
		);
	};
	// 去登陆
	goLogin = () => {
		this.props.history.push('/login');
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
						借款￥<em>{item.billAmt && utils.thousandFormatNum(item.billAmt)}</em>
					</span>
					<div className={style.itemDesc}>
						<em>{item.billDt}</em>
						<span>共12期</span>
					</div>
				</div>
				<div className={style.listItemRight} style={{ color: item.color }}>
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
		const { rData: dataSource } = this.state;
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
				{this.state.rData.length > 4 ? <FooterBar /> : null}
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
			return <span className={style.nodataText}>没有更多数据了</span>;
		}
		return (
			<span>查看更多</span>
			// <Button
			// 	containerStyle={{
			// 		paddingVertical: px(30),
			// 		borderBottomLeftRadius: px(10),
			// 		borderBottomRightRadius: px(10)
			// 	}}
			// 	backgroundColor="#fff"
			// 	size="md"
			// 	shape="rect"
			// 	label="查看更多"
			// 	iconOnRight
			// 	iconSource={Images.icon.trigon_right_black}
			// 	onPress={this.handleLoadMore}
			// 	loading={this.state.isLoadingMore}
			// />
		);
	}

	render() {
		// const separator = (sectionID, rowID) => <div key={`${sectionID}-${rowID}`} />;
		// let index = this.state.rData && this.state.rData.length - 1;
		// const row = () => {
		// 	if (index < 0) {
		// 		index = this.state.rData && this.state.rData.length - 1;
		// 	}
		// 	const obj = this.state.rData && this.state.rData[index--];
		// 	return (
		// 		<Item
		// 			className={'iview' + obj.billNo}
		// 			onClick={() => {
		// 				this.gotoDesc(obj);
		// 			}}
		// 			extra={<span style={{ color: obj.color, fontWeight: 'bold' }}>{obj.billStsNm}</span>}
		// 			style={{ color: obj.color }}
		// 			arrow={obj.billSts === '-1' || obj.billSts === '-2' ? 'empty' : 'horizontal'}
		// 			wrap
		// 		>
		// 			{obj.billAmt}
		// 			<Brief>{obj.billDt}</Brief>
		// 		</Item>
		// 	);
		// };
		// const item = () => {
		// 	if (this.state.rData && this.state.rData.length > 0) {
		// 		return (
		// 			<ListView
		// 				initialListSize={this.state.Listlength}
		// 				onScroll={this.handleScroll}
		// 				key={this.state.useBodyScroll ? '0' : '1'}
		// 				ref={(el) => (this.lv = el)}
		// 				dataSource={this.state.dataSource}
		// 				renderFooter={() => (
		// 					<div className={style.has_more}>{this.state.isLoading ? '数据加载中...' : '已无更多账单'}</div>
		// 				)}
		// 				renderRow={row}
		// 				direction="down"
		// 				renderSeparator={separator}
		// 				useBodyScroll={this.state.useBodyScroll}
		// 				className={!this.state.useBodyScroll ? 'heightBody1' : ''}
		// 				pullToRefresh={
		// 					<PullToRefresh damping={60} refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
		// 				}
		// 				onEndReached={this.onEndReached}
		// 				pageSize={1}
		// 			/>
		// 		);
		// 	}
		// 	return (
		// 		<div className={style.no_data}>
		// 			<i />
		// 			暂无账单
		// 			{isWXOpen() && !tokenFromStorage && !token ? (
		// 				<SXFButton className={style.noLogin} onClick={this.goLogin}>
		// 					去登录
		// 				</SXFButton>
		// 			) : null}
		// 		</div>
		// 	);
		// };
		return (
			<div className={style.orderPage}>
				<div className={style.orderPageHead}>
					<strong className={style.orderPageHeadTitle}>账单</strong>
					<span className={style.orderPageHeadDesc}>还信用卡用还到，有账单就能还</span>
				</div>
				<div className={style.orderListCard}>
					<div className={style.order_page}>
						{/* {item()} */}
						<SectionList
							renderItem={({ item, index }) => this.renderItem(item, index)}
							renderSectionHeader={({ section: { title } }) => this.renderGroupTitle(title)}
							sections={this.handleGenerateBillGroupArr()}
							// keyExtractor={(item, index) => item + index}
							// style={styles.listBox}
							ListFooterComponent={this.renderFooterComponentWrap()}
						/>
					</div>
				</div>
			</div>
		);
	}
}
