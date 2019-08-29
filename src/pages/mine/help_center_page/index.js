import React, { PureComponent } from 'react';
import { headerIgnore } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { mine } from 'utils/analytinsType';
import styles from './index.scss';
import ButtonCustom from 'components/ButtonCustom';
import fetch from 'sx-fetch';
import Lists from 'components/Lists';
import { store } from 'utils/store';

const API = {
	queryQYOpenId: '/my/queryUsrQYOpenId' // 七鱼用户标识
};

const topNavList = [
	{
		img: '图片',
		label: '修改手机号',
		url: '/mine/mine_page'
	},
	{
		img: '图片',
		label: '修改密码',
		url: '/mine/mine_page'
	},
	{
		img: '图片',
		label: '意见反馈',
		url: '/mine/mine_page'
	}
];

@fetch.inject()
export default class help_center_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			hotList: [
				{
					label: {
						name: '1.如何使用还到借款？',
						className: ''
					}
				},
				{
					label: {
						name: '1.如何使用还到借款？',
						className: ''
					}
				},
				{
					label: {
						name: '1.如何使用还到借款？',
						className: ''
					}
				},
				{
					label: {
						name: '1.如何使用还到借款？',
						className: ''
					}
				},
				{
					label: {
						name: '1.如何使用还到借款？',
						className: ''
					}
				},
				{
					label: {
						name: '1.如何使用还到借款？',
						className: ''
					}
				},
				{
					label: {
						name: '1.如何使用还到借款？',
						className: ''
					}
				}
			],
			categoryList: [
				{
					img: '',
					label: '实名认证'
				},
				{
					img: '',
					label: '实名认证'
				},
				{
					img: '',
					label: '实名认证'
				},
				{
					img: '',
					label: '实名认证'
				},
				{
					img: '',
					label: '实名认证'
				},
				{
					img: '',
					label: '实名认证'
				},
				{
					img: '',
					label: '实名认证'
				},
				{
					img: '',
					label: '实名认证'
				}
			]
		};
	}

	gotoPage = (url) => {
		this.props.history.push(url);
	};

	renderTopNav = () => {
		return topNavList.map((v, i) => (
			<div
				className={styles.top_nav_item}
				key={i}
				onClick={() => {
					this.gotoPage(v.url);
				}}
			>
				<span className={styles.top_nav_img}></span>
				<span className={styles.top_nav_label}>{v.label}</span>
			</div>
		));
	};

	renderCategoryList = () => {
		const { categoryList } = this.state;
		return categoryList.map((v, i) => (
			<div key={i} className={styles.category_item}>
				<img src="" alt="" />
				<span>{v.label}</span>
			</div>
		));
	};

	hotListClick = (item) => {
		console.log(item);
	};

	render() {
		const { hotList } = this.state;
		return (
			<div className={styles.help_center_page}>
				<div className={styles.top_nav}>{this.renderTopNav()}</div>
				<div className={styles.pannel}>
					<div className={styles.pannel_title}>
						<span>热门问题</span>
						<span className={styles.hot_icon}></span>
					</div>
					<Lists className={styles.pannel_list} clickCb={this.hotListClick} listsInf={hotList} />
				</div>
				<div className={styles.pannel}>
					<div className={styles.pannel_title}>
						<span>问题分类</span>
					</div>
					<div className={styles.pannel_list}>{this.renderCategoryList()}</div>
				</div>
			</div>
		);
	}
}
