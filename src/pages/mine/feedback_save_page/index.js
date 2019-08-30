/*
 * @Author: shawn
 * @LastEditTime: 2019-08-30 15:32:50
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import SXFButton from 'components/ButtonCustom';
import { TextareaItem, ImagePicker } from 'antd-mobile';
import styles from './index.scss';
import { setBackGround } from 'utils/background';
import qs from 'qs';
const API = {
	addOpinion: '/question/addOpinion'
};
let queryData = {};
@fetch.inject()
@setBackGround('#fff')
export default class mine_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			images: [],
			textareaVal: ''
		};
	}
	componentWillMount() {
		queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
	}
	onChange = (images, type, index) => {
		console.log(images, type, index);
		if (type === 'add' && images && images[images.length - 1].file.size > 2 * 1024 * 1024) {
			this.props.toast.info('图片大小不能超过2M');
			return;
		}
		if (type === 'add' && images && !/.(jpg|png)$/.test(images[images.length - 1].file.name)) {
			this.props.toast.info('请上传jpg、png格式的图片');
			return;
		}
		this.setState({
			images
		});
	};
	addOpinion = () => {
		const { textareaVal = '', images = [] } = this.state;
		let imagesStream = new FormData();
		for (let index = 0; index < images.length; index++) {
			imagesStream.append('images', images[index].file);
		}
		if (!textareaVal) {
			this.props.toast.info('请输入您的反馈意见');
			return;
		}
		if (textareaVal && textareaVal.length < 6) {
			this.props.toast.info('反馈意见字数不小于6个');
			return;
		}
		if (!textareaVal) {
			this.props.toast.info('提交成功');
			return;
		}
		imagesStream.append('content', textareaVal);
		imagesStream.append('type', queryData.type);
		this.props.$fetch.post(API.addOpinion, imagesStream).then((res) => {
			if (res.msgCode === 'PTM0000') {
				this.props.toast.info('提交成功', 2, () => {
					this.props.history.push('/mine/mine_page');
				});
			} else {
				res.msgInfo && this.props.toast.info(res.msgInfo);
			}
		});
	};
	render() {
		const { images, textareaVal = '' } = this.state;
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
						textareaVal >= 180 ? [styles.textArea, styles.textAreaMax].join(' ') : styles.textArea
					}`}
					placeholder="请输入你的反馈意见。"
					rows={5}
					count={180}
				/>
				<div className={[styles.textTitle, styles.topLine].join(' ')}>上传图片能更好的的帮助我们定位问题</div>
				<div className={styles.ImagePicker}>
					<ImagePicker
						files={images}
						onChange={this.onChange}
						selectable={images.length < 4}
						multiple={true}
						accept="image/jpg,image/png"
					/>
				</div>
				<div>
					<SXFButton onClick={this.addOpinion} className={styles.submitBtn}>
						提交意见
					</SXFButton>
				</div>
			</div>
		);
	}
}
