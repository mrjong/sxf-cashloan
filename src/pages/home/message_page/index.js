import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import style from './index.scss';
import fetch from 'sx-fetch';
import { SXFToast } from 'utils/SXFToast';
import STabs from 'components/Tab';
import { store } from 'utils/store';

import { PullToRefresh, Badge, ListView } from 'antd-mobile';
let totalPage = false;
const API = {
	msgRead: '/my/msgRead',
	msgCount: '/my/msgCount',
	defTable: '/my/defTable',
	msgInfo: '/my/msgInfo',
	msgReadAll: '/my/msgReadAll'
};
@fetch.inject()
export default class message_page extends PureComponent {
	constructor(props) {
		super(props);
		const dataSource = new ListView.DataSource({
			rowHasChanged: (row1, row2) => row1 !== row2
		});

		this.state = {
			dataSource,
			refreshing: true,
			showDot: true,
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
			tabs: [{ title: <Badge>活动通知</Badge> }, { title: <Badge>系统通知</Badge> }, { title: <Badge>公告通知</Badge> }]
		};
	}
	scrollTop = 0;
	componentWillMount() {
		var _body = document.getElementsByTagName('body')[0];
		// 处理详情返回之后
		let backData = store.getMsgBackData();
		if (backData && JSON.stringify(backData) !== '{}') {
			totalPage = backData.totalPage;

			this.setState(
				{
					msgType: backData.msgType,
					rData: backData.rData,
					pageIndex: backData.pageIndex,
					hasMore: true,
					Listlength: backData.rData.length
				},
				() => {
					this.msgCount();
					this.setState(
						{
							dataSource: this.state.dataSource.cloneWithRows(backData.rData),
							tabState: true,
							refreshing: false,
							isLoading: false
						},
						() => {
							document.getElementsByClassName('iview' + backData.msgType)[0].scrollTop =
								backData.scrollTop;
						}
					);
					store.removeMsgBackData();
				}
			);
		} else {
			// 获取消息tab
			this.getTab();
			// 获取消息条数
			this.msgCount();
		}
	}
	componentDidUpdate() {
		if (this.state.tabState) {
			this.calcHeight();
		}
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
		this.props.$fetch.post(API.defTable).then((res) => {
			if (res.msgCode === 'PTM0000') {
				this.setState(
					{
						msgType: Number(res.data.type) - 1
					},
					() => {
						this.getCommonData('tabshow');
					}
				);
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};
	// 单个请求读取
	msgOneRead = (obj) => {
		if (obj.sts === '0') {
			this.props.$fetch.post(API.msgRead, { uuid: obj.uuid }).then((res) => {
				if (res.msgCode === 'PTM0000') {
					//   this.msgCount(obj)
					this.getDesc(obj);
				} else {
					this.props.toast.info(res.msgInfo);
				}
			});
		} else {
			this.getDesc(obj);
		}
	};

	// 去详情
	getDesc = (obj) => {
		let rData = this.state.rData;
		rData.forEach((item, index) => {
			if (item.uuid === obj.uuid) {
				rData[index].sts = 1;
			}
		});
		let backData = {
			scrollTop: this.scrollTop || 0,
			rData,
			msgType: this.state.msgType,
			pageIndex: this.state.pageIndex,
			totalPage: totalPage
		};
		// 0:无，1:URL，2:文本，3:APP"
		store.setMsgBackData(backData);
		store.setMsgObj(obj);
		switch (obj.detailType) {
			case '0':
				this.props.history.push('/home/message_detail_page');
				break;
			case '1':
				if (store.getH5Channel() && store.getH5Channel().indexOf('MPOS') < 0) {
					window.open(obj.detail);
				} else {
					location.href = obj.detail;
				}
				break;
			case '2':
				this.props.history.push('/home/message_detail_page');
				break;
			case '3':
				// app页面
				break;

			default:
				break;
		}
	};
	// 获取每一页数据
	genData = async (pIndex = 1) => {
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
		let data = await this.props.$fetch
			.post(API.msgInfo, {
				type: this.state.msgType + 1,
				curPage: pIndex,
				loading: true
			})
			.then((res) => {
				if (pIndex === 1) {
					setTimeout(() => {
						SXFToast.hide();
					}, 600);
				}
				if (res.msgCode === 'PTM0000') {
					if (pIndex === 1) {
						totalPage = res.data.totalPage;
						this.setState({
							hasMore: false
						});
					}
					let dataArr = [];
					// dataArr = res.data.msgList
					for (let i = res.data.msgList.length - 1; i >= 0; i--) {
						dataArr.push({
							...res.data.msgList[i]
						});
					}
					return dataArr;
				} else {
					return [];
				}
			})
			.catch((err) => {
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
		let list = await this.genData(1);
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
	onEndReached = async (event) => {
		if (this.state.isLoading && !this.state.hasMore) {
			this.setState({
				pageIndex: totalPage ? totalPage : 1
			});
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
	// 获取消息条数
	msgCount = (obj) => {
		this.props.$fetch.post(API.msgCount).then((res) => {
			if (res.msgCode === 'PTM0000') {
				if (res.data && res.data.count && res.data.count > 0) {
					this.setState({
						msgReadAllState: true
					});
				} else {
					this.setState({
						msgReadAllState: false
					});
				}
				if (obj && JSON.stringify(obj) !== '{}') {
					this[`ids${obj.uuid}`].style.display = 'none';
				}
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};
	// 一键读取
	msgReadAll = () => {
		this.props.$fetch.post(API.msgReadAll).then((res) => {
			if (res.msgCode === 'PTM0000') {
				this.setState(
					{
						msgReadAllState: false
					},
					() => {
						this.setState({
							showDot: false
						});
						this.props.toast.info('已全部读取');
					}
				);
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};
	// 滚动高度
	handleScroll = (event) => {
		this.scrollTop = event.target.scrollTop;
	};
	// 查看详情
	gotoDesc = (obj) => {
		this.msgOneRead(obj);
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
	render() {
		const separator = (sectionID, rowID) => <div key={`${sectionID}-${rowID}`} />;
		let index = this.state.rData && this.state.rData.length - 1;
		const row = (rowData, sectionID, rowID) => {
			if (index < 0) {
				index = this.state.rData && this.state.rData.length - 1;
			}
			const obj = this.state.rData && this.state.rData[index--];
			return (
				<div className={style.msgItem} key={rowID}>
					<div className={style.time}>{obj.sendTm}</div>
					<div
						onClick={() => {
							this.gotoDesc(obj);
						}}
						className={style.msgContainer}
					>
						{obj.title ? (
							<div className={style.title}>
								{obj.sts === '0' ? (
									<i
										className={!this.state.showDot ? style.displayDot : ''}
										data-id={'ids' + obj.uuid}
										ref={(el) => (this[`ids${obj.uuid}`] = el)}
									/>
								) : null}
								{obj.title}
							</div>
						) : null}
						{obj.illustration ? (
							<img className={style.img} src={`data:image/png;base64,${obj.illustration}`} />
						) : null}
						<div className={style.desc}>{obj.dec}</div>
						<div className={style.handle}>
							查看详情<i />
						</div>
					</div>
				</div>
			);
		};
		const item = (classN) => {
			if (this.state.rData && this.state.rData.length > 0) {
				return (
					<ListView
						className={classN}
						initialListSize={this.state.Listlength}
						onScroll={this.handleScroll}
						key={this.state.useBodyScroll ? '0' : '1'}
						ref={(el) => (this.lv = el)}
						dataSource={this.state.dataSource}
						renderFooter={() => (
							<div style={{ padding: 30, textAlign: 'center' }}>
								{this.state.isLoading ? '加载中...' : '已无更多消息'}
							</div>
						)}
						renderRow={row}
						renderSeparator={separator}
						useBodyScroll={this.state.useBodyScroll}
						style={
							this.state.useBodyScroll ? (
								{}
							) : (
									{
										height: this.state.height
									}
								)
						}
						pullToRefresh={<PullToRefresh refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}
						onEndReached={this.onEndReached}
						pageSize={1}
					/>
				);
			} else {
				return (
					<div className={style.noMsg}>
						<i />暂无消息
					</div>
				);
			}
		};
		return (
			<div className={style.message_page} ref={(el) => (this.messageBox = el)}>
				{this.state.msgReadAllState ? (
					<div onClick={this.msgReadAll} className={style.allRead}>
						<i className={style.allReadIcon}></i>一键读取
          </div>
				) : null}
				{this.state.tabState ? (
					<STabs
						tabTit={this.state.tabs}
						initialPage={this.state.msgType}
						onChange={(tab, index) => {
							this.changeTab(tab, index);
						}}
						ref={(el) => (this.messageTabBox = el)}
					>
						{this.state.tabs.map((item2, index2) => <div key={index2}>{item('iview' + index2)}</div>)}
					</STabs>
				) : null}
			</div>
		);
	}
}
