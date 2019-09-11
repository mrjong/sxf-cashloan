/*
 * @Author: shawn
 * @LastEditTime: 2019-09-10 20:40:45
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import SXFButton from 'components/ButtonCustom';
import { TextareaItem, ImagePicker } from 'antd-mobile';
import styles from './index.scss';
import { setBackGround } from 'utils/background';
import qs from 'qs';
import { buriedPointEvent } from 'utils/analytins';
import { helpCenter } from 'utils/analytinsType';
import lrz from 'lrz';
const API = {
	addOpinion: '/question/addOpinion'
};
let queryData = {};
let isFetching = false;
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
	onChange = (images, type) => {
		console.log(images);
		if (type === 'add' && images && this.state.images && images.length > 4) {
			this.props.toast.info('图片上传不能超过4张');
			return;
		}
		let imagesCopy = images;
		if (type === 'add' && images && !/.(jpg|png|PNG|JPG)$/.test(images[images.length - 1].file.name)) {
			this.props.toast.info('请上传jpg、png格式的图片');
			return;
		}
		type === 'add' &&
			lrz(images && images[images.length - 1].file, { quality: 0.5 })
				.then((rst) => {
					if (rst.file.size > 2 * 1024 * 1024) {
						this.props.toast.info('图片大小不能超过2M');
						return;
					}
					imagesCopy.pop();
					imagesCopy.push({ ...rst, url: rst.base64 });
					this.setState({
						images: imagesCopy
					});
				})
				.catch((err) => {
					console.log(err);
				});
		type === 'remove' &&
			this.setState({
				images: imagesCopy
			});
	};
	addOpinion = () => {
		if (isFetching) return;
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
		imagesStream.append('content', textareaVal);
		imagesStream.append('type', queryData.type);
		isFetching = true;
		this.props.$fetch
			.post(API.addOpinion, imagesStream)
			.then((res) => {
				isFetching = false;
				if (res.msgCode === 'PTM0000') {
					this.props.toast.info('提交成功', 2, () => {
						this.props.history.push('/mine/mine_page');
					});
					buriedPointEvent(helpCenter.submit_succ, {
						img_count: images.length,
						type_name: queryData.type
					});
				} else {
					res.msgInfo && this.props.toast.info(res.msgInfo);
				}
			})
			.catch(() => {
				isFetching = false;
			});
	};
	componentWillUnmount() {
		isFetching = false;
	}
	render() {
		const { images, textareaVal = '' } = this.state;
		const btnDisable = !textareaVal || (textareaVal && textareaVal.length < 6);

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
					className={styles.textArea}
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
					<SXFButton
						className={[styles.submitBtn, btnDisable ? styles.dis : ''].join(' ')}
						onClick={this.addOpinion}
						disabled={!!btnDisable}
					>
						提交意见
					</SXFButton>
				</div>
			</div>
		);
	}
}
