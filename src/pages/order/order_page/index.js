import React, {
    PureComponent
} from "react"
import style from "./index.scss"
import fetch from "sx-fetch"
import { PullToRefresh, List, Tabs, Badge, ListView } from "antd-mobile"
import sessionStorageMap from 'utils/sessionStorageMap'
let hasNext = true
const Item = List.Item;
const Brief = Item.Brief;
const API = {
    'msgRead': "/my/msgRead",
    'msgCount': "/my/msgCount",
    "billList": '/bill/list'
}

@fetch.inject()
export default class message_page extends PureComponent {
    constructor(props) {
        super(props)
        const dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2
        })

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
            msgReadAllState: false,
            msgType: 0,
            hasMore: true,
            limitRow: 10
        }
    }
    scrollTop = 0
    componentWillMount() {
        var _body = document.getElementsByTagName("body")[0]
        // _body.style.backgroundColor = "#efeff4"
        // 处理详情返回之后
        let backDatastr = sessionStorage.getItem("backData")
        if (backDatastr && backDatastr !== "{}") {
            let backData = JSON.parse(sessionStorage.getItem("backData"))
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
                    // this.msgCount()
                    // scrollTop = backData.scrollTop
                    this.setState(
                        {
                            dataSource: this.state.dataSource.cloneWithRows(backData.rData),
                            tabState: true,
                            refreshing: false,
                            isLoading: false
                        },
                        () => {
                            document
                                .getElementsByClassName("iview" + backData.msgType)[0].scrollTop = backData.scrollTop
                            // .scrollTo(0, backData.scrollTop)
                        }
                    )
                    sessionStorage.removeItem("backData")
                }
            )
        } else {
            this.getCommonData()
            // 获取消息条数
            // this.msgCount()
        }
    }
    componentDidUpdate() {
        if (this.state.useBodyScroll) {
            document.body.style.overflow = "auto"
        } else {
            document.body.style.overflow = "hidden"
        }
    }
    componentWillUnmount() {
        var _body = document.getElementsByTagName("body")[0]
        document.body.style.overflow = "auto"
    }

    getDesc = obj => {
        let rData = this.state.rData
        rData.forEach((item, index) => {
            if (item.uuid === obj.uuid) {
                rData[index].sts = 1
            }
        })
        let backData = {
            scrollTop: this.scrollTop || 0,
            rData,
            msgType: this.state.msgType,
            pageIndex: this.state.pageIndex,
            hasNext: hasNext
        }
        console.log(obj)
        // 0:无，1:URL，2:文本，3:APP"
        sessionStorage.setItem("backData", JSON.stringify(backData))
        sessionStorage.setItem("msgObj", JSON.stringify(obj))
        switch (obj.detailType) {
            case "0":
                this.props.history.push("/home/message_detail_page")
                break
            case "1":
                if (sessionStorage.getItem("h5Channel") && sessionStorage.getItem("h5Channel").indexOf("MPOS") < 0) {
                    window.open(obj.detail)
                } else {
                    location.href = obj.detail
                }
                break
            case "2":
                this.props.history.push("/home/message_detail_page")
                break
            case "3":
                // app页面
                break

            default:
                break
        }
    }
    // 获取每一页数据
    genData = async (pIndex = 1) => {
        if (!hasNext) {
            this.setState({
                isLoading: false,
                pageIndex: this.state.pageIndex - 1
            })
            return []
        }
        if (pIndex === 1) {
            this.props.toast.loading('数据加载中...', 10000);
        }
        let data = await this.props.$fetch.post(API.billList, {
            qryType: '0',
            startRow: pIndex,
            limitRow: this.state.limitRow
        })
            .then(res => {
                if (pIndex === 1) {
                    setTimeout(() => {
                        this.props.toast.hide();
                    }, 600);
                }
                if (res.msgCode === "PTM0000") {
                    if (pIndex === 1) {
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
                    for (let i = res.data.length - 1; i >= 0; i--) {
                        dataArr.push({
                            ...res.data[i]
                        })
                    }
                    return dataArr
                } else {
                    return []
                }
            }).catch(err => {
                if (pIndex === 1) {
                    setTimeout(() => {
                        this.props.toast.hide();
                    }, 600);
                }
            })
        return data
    }
    // 刷新
    onRefresh = () => {
        hasNext = true
        this.setState({ refreshing: true, isLoading: true })
        this.getCommonData()
    }
    // 公用
    getCommonData = async () => {
        this.setState({
            isLoading: true
        })
        let list = await this.genData(1)
        console.log(list)
        this.setState({
            rData: list,
            Listlength: list.length,
            dataSource: this.state.dataSource.cloneWithRows(list),
            refreshing: false,
            isLoading: false,
            pageIndex: 1
        })
    }
    // 渲染每一页完成之后
    onEndReached = async event => {
        if (this.state.isLoading && !this.state.hasMore) {
            this.setState({
                pageIndex: this.state.pageIndex - 1 ? this.state.pageIndex - 1 : 1
            })
            return
        }
        this.setState({ isLoading: true })
        let list = await this.genData(++this.state.pageIndex)
        if (list.length === 0) {
            return
        }
        this.setState({
            rData: [...this.state.rData, ...list],
            dataSource: this.state.dataSource.cloneWithRows([
                ...this.state.rData,
                ...list
            ]),
            isLoading: false
        })
    }
    // 滚动高度
    handleScroll = event => {
        this.scrollTop = event.target.scrollTop
    }
    // 查看详情
    gotoDesc = obj => {
        // 账单状态(0：初登记,1：待还款,2：处理中,3：已撤销,4：已还清;已撤销状态专用于免手续费时间限制内的全额退款)
        if (obj.billSts === '2' || obj.billSts === '3') {
            return
        }
        sessionStorage.setItem(sessionStorageMap.bill.billNo, JSON.stringify(obj.billNo))
        this.props.history.push('/order/order_detail_page')
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
            console.log(obj)
            return (
                <List className="my-list">
                    <Item onClick={() => { this.gotoDesc(obj) }} extra={<span style={{ color: obj.color }}>{obj.billStsNm}</span>} style={{ color: obj.color }} arrow="empty" arrow={obj.billSts === '2' || obj.billSts === '3' ? 'empty' : 'horizontal'} className="spe" wrap>
                        {obj.billAmt}<Brief>{obj.billDt}</Brief>
                    </Item>
                </List>
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
                            <div style={{ padding: 30, textAlign: "center" }}>
                                {this.state.isLoading ? "数据加载中..." : "已无更多账单"}
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
                        pullToRefresh={
                            <PullToRefresh
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
            </div>
                )
            }
        }
        return (
            <div className={style.order_page}>
                {
                    item()
                }
            </div>
        )
    }
}
