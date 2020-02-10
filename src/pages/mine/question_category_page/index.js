import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import styles from './index.scss';
import fetch from 'sx-fetch';
// import { store } from 'utils/store';
import { SXFToast } from 'utils/SXFToast';
import { PullToRefresh, ListView } from 'antd-mobile';
import { setBackGround } from 'utils/background';
import QuestionModal from '../help_center_page/components/QuestionModal';
import { LoadingView } from 'components';

import { question_questionListByType } from 'fetch/api.js';

import Image from 'assets/image';

let totalPage = false;

const noData = {
	img: Image.bg.no_order,
	text: '暂无内容',
	width: '100%',
	height: '100%'
};
const errorData = {
	img: Image.bg.no_network,
	text: '网络错误,点击重试'
};

@setBackGround('#fff')
@fetch.inject()
export default class coupon_page extends PureComponent {
	constructor(props) {
		super(props);
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
			hasMore: true,
			showQuestionModal: false,
			question: {}
		};
	}
	scrollTop = 0;
	componentWillMount() {
		this.getCommonData();
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
			SXFToast.loading('加载中...', 10000);
		}
		let sendParams = {
			pageSize: 15,
			currentPage: pIndex,
			type: this.props.history.location.state.value
		};

		let startIndex = (pIndex - 1) * 15; //每次分页的起始序号
		let data = await this.props.$fetch
			.post(question_questionListByType, sendParams)
			.then((res) => {
				if (pIndex === 1) {
					setTimeout(() => {
						SXFToast.hide();
					}, 600);
				}
				if (res.code === '000000' && res.data) {
					let dataArr = [];
					if (pIndex === 1) {
						// totalPage = Math.ceil(res.data.totalSize / 10);
						this.setState({
							hasMore: false
						});
					}
					for (let i = res.data.list.length - 1; i >= 0; i--) {
						res.data.list[i].question = `${startIndex + i + 1}. ${res.data.list[i].question}`;
						dataArr.push(res.data.list[i]);
					}
					this.viewRef && this.viewRef.showDataView();
					return dataArr;
				}
				this.viewRef && this.viewRef.setEmpty();
				return [];
			})
			.catch(() => {
				if (pIndex === 1) {
					setTimeout(() => {
						SXFToast.hide();
					}, 600);
				}
				this.viewRef && this.viewRef.setEmpty();
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
	getCommonData = async () => {
		this.setState({
			isLoading: true
		});
		let list = await this.genData(1);
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

	listItemClick = (item) => {
		this.setState({
			showQuestionModal: true,
			question: {
				title: item.question,
				answer: item.answer,
				bizId: item.bizId,
				status: item.status,
				type: item.type
			}
		});
	};

	closeModal = () => {
		this.setState({
			showQuestionModal: false
		});
	};

	render() {
		const { showQuestionModal, question } = this.state;
		let index = this.state.rData && this.state.rData.length - 1;
		const row = (rowID) => {
			if (index < 0) {
				index = this.state.rData && this.state.rData.length - 1;
			}
			const obj = this.state.rData && this.state.rData[index--];
			return (
				<div
					onClick={() => {
						this.listItemClick(obj);
					}}
					key={rowID}
					className={styles.item_wrap}
				>
					<span className={styles.question_title}>{obj.question}</span>
					<span className={styles.question_arrow} />
				</div>
			);
		};
		const item = () => {
			if (this.state.rData && this.state.rData.length > 0) {
				return (
					<ListView
						className={styles.no_header}
						initialListSize={this.state.Listlength}
						onEndReachedThreshold={100}
						onScroll={this.handleScroll}
						key={this.state.useBodyScroll ? '0' : '1'}
						ref={(el) => (this.lv = el)}
						dataSource={this.state.dataSource}
						// renderFooter={() => (
						// 	<div
						// 		style={{ paddingBottom: 30, textAlign: 'center' }}
						// 		className={!this.state.isLoading ? styles.reach_bottom : null}
						// 	>
						// 		{this.state.isLoading ? '加载中...' : <span>已无更多问题</span>}
						// 	</div>
						// )}
						renderRow={row}
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
		};
		return (
			<div className="category_page" ref={(el) => (this.messageBox = el)}>
				<LoadingView
					ref={(view) => (this.viewRef = view)}
					nodata={noData}
					errordata={errorData}
					onReloadData={() => {
						this.onRefresh();
					}}
				>
					{item()}
				</LoadingView>
				<QuestionModal
					visible={showQuestionModal}
					question={question}
					onClose={this.closeModal}
					{...this.props}
				/>
			</div>
		);
	}
}
