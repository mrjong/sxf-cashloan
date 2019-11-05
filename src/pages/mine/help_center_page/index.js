/*
 * @Author: shawn
 * @LastEditTime: 2019-08-30 15:32:58
 */
import React, { PureComponent } from 'react';
import { buriedPointEvent } from 'utils/analytins';
import { helpCenter, wxTabBar } from 'utils/analytinsType';
import styles from './index.scss';
// import Cookie from 'js-cookie';
import { setBackGround } from 'utils/background';
import ButtonCustom from 'components/ButtonCustom';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import QuestionModal from './components/QuestionModal';
import qs from 'qs';

const API = {
	hotList: '/question/topSeven',
	categoryList: '/question/questionList',
	queryQYOpenId: '/my/queryUsrQYOpenId' // 七鱼用户标识
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
		// // 获取token
		// token = Cookie.get('fin-v-card-token');
		// tokenFromStorage = store.getToken();
		this.state = {
			hotList: [],
			categoryList: [],
			QYConfig: null, // 七鱼的openId
			showQuestionModal: false,
			question: {}
		};
	}

	componentDidMount() {
		queryData = qs.parse(this.props.history.location.search, {
			ignoreQueryPrefix: true
		});
		if (queryData.pageSource === 'wxTabBar') {
			buriedPointEvent(wxTabBar.helpCenterView);
		}
		this.qryHotList();
		this.qryCategoryList();
		this.qiyu();
	}

	qiyu = () => {
		this.props.$fetch.get(API.queryQYOpenId).then((res) => {
			if (res && res.msgCode === 'PTM0000' && res.data !== null) {
				this.setState({
					QYConfig: res.data
				});
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	qryHotList = () => {
		this.props.$fetch.post(API.hotList).then((res) => {
			if (res.msgCode === 'PTM0000' && res.data) {
				let arr = res.data.map((v, i) => {
					return {
						question: `${i + 1}. ${v.question}`,
						answer: v.answer,
						bizId: v.bizId,
						type: v.type,
						status: v.status
					};
				});
				this.setState({
					hotList: arr
				});
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	qryCategoryList = () => {
		this.props.$fetch.post(API.categoryList).then((res) => {
			if (res.msgCode === 'PTM0000' && res.data) {
				let arr = res.data.map((v) => {
					return {
						code: v.code,
						label: v.name,
						value: v.value
					};
				});
				this.setState({
					categoryList: arr
				});
			} else {
				this.props.toast.info(res.msgInfo);
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
		if (queryData.pageSource === 'wxTabBar') {
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
				<span>{v.label}</span>
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
				<span className={styles.question_arrow}></span>
			</div>
		));
	};

	categoryItemClick = (item) => {
		buriedPointEvent(helpCenter.classification, {
			type_name: item.label
		});
		this.props.history.push({
			pathname: '/mine/question_category_page',
			state: {
				pageTitle: item.label,
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
		const { showQuestionModal, question } = this.state;
		return (
			<div className={styles.help_center_page}>
				{queryData.pageSource !== 'wxTabBar' ? (
					store.getToken() ? (
						<div className={styles.top_nav}>{this.renderTopNav()}</div>
					) : null
				) : null}
				{/* {queryData.pageSource === 'wxTabBar' ? (
					<div className={styles.top_nav}>{this.renderTopNav()}</div>
				) : null}
				{queryData.pageSource} */}
				<div className={styles.pannel}>
					<div className={styles.pannel_title}>
						<span>热门问题</span>
						<span className={styles.hot_icon}></span>
					</div>
					<div className={styles.pannel_list}>{this.renderHotList()}</div>
				</div>
				<div className={styles.pannel}>
					<div className={styles.pannel_title}>
						<span>问题分类</span>
					</div>
					<div className={[styles.pannel_list, styles.category_list].join(' ')}>
						{this.renderCategoryList()}
					</div>
				</div>
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
