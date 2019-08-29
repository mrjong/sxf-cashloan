import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import { Icon, TextareaItem, ImagePicker, WingBlank, SegmentedControl } from 'antd-mobile';
import Lists from 'components/Lists';
import { buriedPointEvent } from 'utils/analytins';
import { mine } from 'utils/analytinsType';
import styles from './index.scss';
import { setBackGround } from 'utils/background';
const API = {
	VIPCARD: '/my/queryUsrMemSts', // 查询用户会员卡状态
	LOGOUT: '/signup/logout', // 用户退出登陆
	USERSTATUS: '/signup/getUsrSts', // 用户状态获取
	couponRedDot: '/index/couponRedDot', // 优惠券红点
	couponCount: '/index/couponCount' // 优惠券红点
};
const data = [
	{
		url: 'https://zos.alipayobjects.com/rmsportal/PZUUCKTRIHWiZSY.jpeg',
		id: '2121'
	},
	{
		url: 'https://zos.alipayobjects.com/rmsportal/hqQWgTXdrlmVVYi.jpeg',
		id: '2122'
	}
];
@fetch.inject()
@setBackGround('#fff')
export default class mine_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			files: [],
			textareaVal: '我最大的意见就是没意见。'
		};
	}
	onChange = (files, type, index) => {
		console.log(files, type, index);
		this.setState({
			files
		});
	};
	onSegChange = (e) => {
		const index = e.nativeEvent.selectedSegmentIndex;
		this.setState({
			multiple: index === 1
		});
	};
	render() {
		const { files, textareaVal = '' } = this.state;
		return (
			<div className={[styles.mine_page, 'mine_page_global'].join(' ')}>
				<div className={styles.textTitle}>输入您的反馈意见（最少6个字）</div>
				<TextareaItem
					onChange={(v) => {
						this.setState({
							textareaVal: v
						});
					}}
					value={textareaVal}
					className={`${
						textareaVal >= 1 ? [styles.textArea, styles.textAreaMax].join(' ') : styles.textArea
					}`}
					placeholder="我最大的意见就是没意见。"
					rows={5}
					count={180}
				/>
				<div className={[styles.textTitle, styles.topLine].join(' ')}>上传图片能更好的的帮助我们定位问题</div>
				<div className={styles.ImagePicker}>
					<ImagePicker
						files={files}
						onChange={this.onChange}
						onImageClick={(index, fs) => console.log(index, fs)}
						selectable={files.length < 5}
						multiple={true}
						accept="image/jpeg,image/jpg,image/png"
					/>
				</div>
			</div>
		);
	}
}
