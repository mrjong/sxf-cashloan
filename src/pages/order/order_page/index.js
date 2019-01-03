import React, {
	PureComponent
} from "react"
import Cookie from 'js-cookie';
import style from "./index.scss"
import fetch from "sx-fetch"
import { PullToRefresh, List, ListView } from "antd-mobile"
import { store } from 'utils/store';
import { isBugBrowser, isWXOpen } from 'utils';
import SXFButton from 'components/ButtonCustom';
import dayjs from 'dayjs'
let hasNext = true
const Item = List.Item;
const Brief = Item.Brief;
const API = {
	'msgRead': "/my/msgRead",
	'msgCount': "/my/msgCount",
	"billList": '/bill/list'
}

let token = '';
let tokenFromStorage = '';

@fetch.inject()
export default class order_page extends PureComponent {
	constructor(props) {
		super(props)
		// 获取token
		token = Cookie.get('fin-v-card-token');
		if (isBugBrowser()) {
			tokenFromStorage = store.getToken();
		} else {
			tokenFromStorage = store.getTokenSession();
		}
		const dataSource = new ListView.DataSource({
			rowHasChanged: (row1, row2) => row1 !== row2
		})

		this.state = {
			dataSource,
			refreshing: true,
			isLoading: true,
			height: '100%',
			useBodyScroll: false,
			pageIndex: 0,
			Listlength: 0,
			rData: [],
			tabState: false,
			msgReadAllState: false,
			msgType: 0,
			hasMore: true,
			limitRow: 10
		}
	}
	scrollTop = 0
	componentWillMount() {
		// 重新设置HistoryRouter，解决点击两次才能弹出退出框的问题
		if (isWXOpen()) {
			store.setHistoryRouter(window.location.pathname);
		}
		// 处理详情返回之后
		let backDatastr = store.getBackData()
		if (backDatastr && JSON.stringify(backDatastr) !== "{}") {
			let backData = store.getBackData()
			hasNext = backData.hasNext
			this.setState(
				{
					msgType: backData.msgType,
					rData: backData.rData,
					pageIndex: backData.pageIndex,
					hasMore: true,
					Listlength: backData.rData.length
				},
				() => {
					this.setState(
						{
							dataSource: this.state.dataSource.cloneWithRows(backData.rData),
							tabState: true,
							refreshing: false,
							isLoading: false
						}
					)
				}
			)
		} else {
			hasNext = true
			this.getCommonData()
		}
	}
	componentDidMount() {
		// 返回展示数据
		let backData = store.getBackData()
		if (store.getBackData()) {
			setTimeout(() => this.lv.scrollTo(0, backData.scrollTop), 0);
		}
	}
	// 获取每一页数据
	genData = async (pIndex = 0) => {
		if (!hasNext) {
			this.setState({
				isLoading: false,
				pageIndex: this.state.pageIndex - 1
			})
			return []
		}
		if (pIndex === 0) {
			this.props.SXFToast.loading('数据加载中...', 10000);
		}
		let data = await this.props.$fetch.post(API.billList, {
			qryType: 0,
			startRow: pIndex * (this.state.limitRow),
			limitRow: this.state.limitRow
		})
			.then(res => {
				if (pIndex === 0) {
					setTimeout(() => {
						this.props.SXFToast.hide();
					}, 600);
				}
				if (res.msgCode === "PTM0000") {
					if (pIndex === 0) {
						this.setState({
							hasMore: false
						})
					}
					// 判断是否为最后一页
					if (res.data.length < this.state.limitRow) {
						hasNext = false
					}
					let dataArr = []
					// dataArr = res.data.msgList
					// for (let x = 0; x < 10; x++) {
					for (let i = res.data.length - 1; i >= 0; i--) {
						dataArr.push({
							...res.data[i],
							billDt: `${dayjs(res.data[i].billDt).format('YYYY年MM月DD日')}借款`,
						})
						// }
					}
					return dataArr
				} else {
					return []
				}
			}).catch(err => {
				if (pIndex === 0) {
					setTimeout(() => {
						this.setState({
							isLoading: false,
							refreshing: false
						})
						this.props.SXFToast.hide();
					}, 600);
				}
			})
		return data
	}
	// 刷新
	onRefresh = () => {
		setTimeout(() => {
			hasNext = true
			this.setState({ refreshing: true, isLoading: true })
			this.getCommonData()
		}, 600);
	}
	// 公用
	getCommonData = async () => {
		this.setState({
			isLoading: true
		})
		let list = await this.genData(0)
		this.setState({
			rData: list,
			Listlength: list.length,
			dataSource: this.state.dataSource.cloneWithRows(list),
			refreshing: false,
			isLoading: false,
			pageIndex: 0
		}, () => {
			let backData = {
				rData: this.state.rData,
			}
			store.setBackData(backData)
		})

	}
	// 渲染每一页完成之后
	onEndReached = async event => {
		if (this.state.isLoading && !this.state.hasMore) {
			this.setState({
				pageIndex: this.state.pageIndex - 1 ? this.state.pageIndex - 1 : 0
			})
			return
		}
		this.setState({ isLoading: true })
		let list = await this.genData(++this.state.pageIndex)
		if (list.length === 0) {
			this.setState({ isLoading: false })
			return
		}
		this.setState({
			rData: [...list, ...this.state.rData],
			dataSource: this.state.dataSource.cloneWithRows([
				...list,
				...this.state.rData
			]),
			isLoading: false
		}, () => {

		})
	}
	// 滚动高度
	handleScroll = event => {
		this.scrollTop = event.target.scrollTop
	}
	// 查看详情
	gotoDesc = obj => {
		// 账单状态(0：放款成功,1：已逾期,2：还款中,4：已还清;  已撤销状态专用于免手续费时间限制内的全额退款)， -2: 放款中  -1放款失败
		const noDetailsPageArr = ['-2', '-1'];
		if (noDetailsPageArr.includes(obj.billSts)) {
			return
		}
		let backData = {
			scrollTop: this.scrollTop || 0,
			rData: this.state.rData,
			billNo: obj.billNo,
			pageIndex: this.state.pageIndex,
			hasNext: hasNext
		}

		// 0:无，1:URL，2:文本，3:APP"
		store.setBackData(backData)
		store.setBillNo(obj.billNo)
		this.props.history.push(`/order/order_detail_page`)
	}
	// 切换tab
	changeTab = (tab, index) => {
		this.setState(
			{
				msgType: index,
				rData: []
			},
			() => {
				this.getCommonData()
			}
		)
	}
	// 去登陆
	goLogin = () => {
		this.props.history.push('/login');
	}
	render() {
		const separator = (sectionID, rowID) => (
			<div key={`${sectionID}-${rowID}`} />
		)
		let index = this.state.rData && this.state.rData.length - 1
		const row = (rowData, sectionID, rowID) => {
			if (index < 0) {
				index = this.state.rData && this.state.rData.length - 1
			}
			const obj = this.state.rData && this.state.rData[index--]
			return (
				<Item className={'iview' + obj.billNo} onClick={() => { this.gotoDesc(obj) }} extra={<span style={{ color: obj.color, fontWeight: 'bold' }}>{obj.billStsNm}</span>} style={{ color: obj.color }} arrow="empty" arrow={obj.billSts === '-1' || obj.billSts === '-2' ? 'empty' : 'horizontal'} wrap>
					{obj.billAmt}<Brief>{obj.billDt}</Brief>
				</Item>
			)
		}
		const item = () => {
			if (this.state.rData && this.state.rData.length > 0) {
				return (
					<ListView
						initialListSize={this.state.Listlength}
						onScroll={this.handleScroll}
						key={this.state.useBodyScroll ? "0" : "1"}
						ref={el => (this.lv = el)}
						dataSource={this.state.dataSource}
						renderFooter={() => (
							<div className={style.has_more}>
								{this.state.isLoading ? "数据加载中..." : "已无更多账单"}
							</div>
						)}
						renderRow={row}
						direction="down"
						renderSeparator={separator}
						useBodyScroll={this.state.useBodyScroll}
						style={
							this.state.useBodyScroll
								? {}
								: {
									height: this.state.height
								}
						}
						pullToRefresh={
							<PullToRefresh
								damping={60}
								refreshing={this.state.refreshing}
								onRefresh={this.onRefresh}
							/>
						}
						onEndReached={this.onEndReached}
						pageSize={1}
					/>
				)
			} else {
				return (
					<div className={style.no_data}>
						<i />暂无账单
              {isWXOpen() && !tokenFromStorage && !token ?
							<SXFButton className={style.noLogin} onClick={this.goLogin}>去登录</SXFButton> : null
						}
					</div>
				)
			}
		}
		return (
			<div className={style.orderScroll}>
				<div className={style.order_page}>
					{
						item()
					}
				</div>
			</div>
		)
	}
}
