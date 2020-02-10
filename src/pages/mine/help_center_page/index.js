/*
 * @Author: shawn
 * @LastEditTime : 2020-02-07 14:51:23
 */
import React, { PureComponent } from 'react';
import { buriedPointEvent } from 'utils/analytins';
import { helpCenter, wxTabBar } from 'utils/analytinsType';
import styles from './index.scss';
// import Cookie from 'js-cookie';
import { setBackGround } from 'utils/background';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { ButtonCustom, LoadingView } from 'components';
import QuestionModal from './components/QuestionModal';
import Image from 'assets/image';

import qs from 'qs';

import { question_questionInfo } from 'fetch/api';

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

const topNavList = [
	{
		img: require('./img/msg_icon.png'),
		label: '意见反馈',
		url: '/mine/feedback_page'
	}
];

// let token = '';
// let tokenFromStorage = '';
let queryData = {};
@setBackGround('#fff')
@fetch.inject()
export default class help_center_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			hotList: [],
			categoryList: [],
			QYConfig: null, // 七鱼的openId
			showQuestionModal: false,
			question: {}
		};
	}

	componentWillMount() {
		queryData = qs.parse(this.props.history.location.search, {
			ignoreQueryPrefix: true
		});
	}

	componentDidMount() {
		if (queryData.entry === 'wxTabBar') {
			buriedPointEvent(wxTabBar.helpCenterView);
		}
		this.qryHotListAdnTypes();
	}

	/**
	 * 请求 热门问题 和 问题分类
	 * @memberof HelpCenter
	 */
	qryHotListAdnTypes = () => {
		this.props.$fetch.post(question_questionInfo).then((res) => {
			if (res.code === '000000' && res.data) {
				if (res.data.questions && res.data.questions.list && res.data.questions.list.length) {
					this.setState({
						hotList: res.data.questions.list
					});
				}
				if (res.data.types && res.data.types.list && res.data.types.list.length) {
					this.setState({
						categoryList: res.data.types.list
					});
				}
				if (
					(res.data.questions && res.data.questions.list && res.data.questions.list.length) ||
					(res.data.types && res.data.types.list && res.data.types.list.length)
				) {
					this.viewRef && this.viewRef.showDataView();
				} else {
					this.viewRef && this.viewRef.setEmpty();
				}
			} else {
				this.props.toast.info(res.message);
				this.viewRef && this.viewRef.setEmpty();
			}
		});
	};

	gotoPage = (item) => {
		buriedPointEvent(helpCenter.fast_entry, {
			entry_name: item.label
		});
		this.props.history.push(item.url);
	};

	goOnline = () => {
		buriedPointEvent(helpCenter.goOnline);
		if (queryData.entry === 'wxTabBar') {
			buriedPointEvent(wxTabBar.onlineBtnClick);
		}
		this.props.history.push('/mine/qiyu_page');
	};

	renderTopNav = () => {
		return topNavList.map((v, i) => (
			<div
				className={styles.top_nav_item}
				key={i}
				onClick={() => {
					this.gotoPage(v);
				}}
			>
				<img src={v.img} alt="" className={styles.top_nav_img} />
				<span className={styles.top_nav_label}>{v.label}</span>
			</div>
		));
	};

	renderCategoryList = () => {
		const { categoryList } = this.state;
		return categoryList.map((v, i) => (
			<div
				key={i}
				className={styles.category_item}
				onClick={() => {
					this.categoryItemClick(v);
				}}
			>
				<img src={require(`./img/category_icon${i + 1}@3x.png`)} className={styles.category_item_icon} />
				<span>{v.name}</span>
			</div>
		));
	};

	renderHotList = () => {
		const { hotList } = this.state;
		return hotList.map((v, i) => (
			<div
				key={i}
				className={styles.hotlist_item}
				onClick={() => {
					this.hotListClick(v);
				}}
			>
				<span className={styles.question_title}>{v.question}</span>
				<span className={styles.question_arrow} />
			</div>
		));
	};

	categoryItemClick = (item) => {
		buriedPointEvent(helpCenter.classification, {
			type_name: item.name
		});
		this.props.history.push({
			pathname: '/mine/question_category_page',
			state: {
				pageTitle: item.name,
				value: item.value
			}
		});
	};

	hotListClick = (item) => {
		buriedPointEvent(helpCenter.hot_issue, {
			q_title: item.question
		});
		this.setState({
			showQuestionModal: true,
			question: {
				title: item.question,
				answer: item.answer,
				bizId: item.bizId,
				type: item.type,
				status: item.status
			}
		});
	};

	closeModal = () => {
		this.setState({
			showQuestionModal: false
		});
	};

	render() {
		const { showQuestionModal, question, hotList, categoryList } = this.state;
		return (
			<div className={styles.help_center_page}>
				{queryData.entry !== 'wxTabBar' ? (
					store.getToken() ? (
						<div className={styles.top_nav}>{this.renderTopNav()}</div>
					) : null
				) : null}
				<LoadingView
					ref={(view) => (this.viewRef = view)}
					nodata={noData}
					errordata={errorData}
					onReloadData={() => {
						this.qryHotListAdnTypes();
					}}
				>
					<div>
						<div className={styles.pannel}>
							<div className={styles.pannel_title}>
								{hotList && hotList.length > 0 ? (
									<div>
										<span>热门问题</span>
										<span className={styles.hot_icon}>TOP{hotList.length}</span>
									</div>
								) : null}
							</div>
							<div className={styles.pannel_list}>{this.renderHotList()}</div>
						</div>
						<div className={styles.pannel}>
							{categoryList && categoryList.length > 0 ? (
								<div>
									<div className={styles.pannel_title}>
										<span>问题分类</span>
									</div>
									<div className={[styles.pannel_list, styles.category_list].join(' ')}>
										{this.renderCategoryList()}
									</div>
								</div>
							) : null}
						</div>
					</div>
				</LoadingView>
				{store.getToken() ? (
					<div className={styles.service_box}>
						<ButtonCustom onClick={this.goOnline} className={styles.online_btn}>
							<i />
							在线咨询
						</ButtonCustom>
					</div>
				) : null}

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
