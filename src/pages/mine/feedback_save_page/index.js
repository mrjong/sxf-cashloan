/*
 * @Author: shawn
 * @LastEditTime : 2020-02-19 11:42:27
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import { ButtonCustom } from 'components';
import { TextareaItem, ImagePicker } from 'antd-mobile';
import styles from './index.scss';
import { setBackGround } from 'utils/background';
import qs from 'qs';
import { buriedPointEvent } from 'utils/analytins';
import { helpCenter } from 'utils/analytinsType';
import lrz from 'lrz';
import { question_addOpinion } from 'fetch/api.js';

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

	getFileType = (images) => {
		let getFileType = true;
		for (let index = 0; index < images.length; index++) {
			const element = images[index];
			let filepath = element.file.type;
			let fileArr = filepath.split('/');
			let fileend = fileArr[fileArr.length - 1];
			if (
				'jpg' !== fileend.toLowerCase() &&
				'jpeg' !== fileend.toLowerCase() &&
				'png' !== fileend.toLowerCase()
			) {
				getFileType = false;
				break;
			}
		}
		return getFileType;
	};

	getFile = (images = []) => {
		let getFileType = true;
		let fileList = [];
		return new Promise(async (resove) => {
			for (let index = 0; index < images.length; index++) {
				const element = images[index];
				if (!element.origin) {
					let rst = await lrz(element.file, { quality: 0.5 });
					fileList.push({ ...rst, url: rst.base64 });
					if (rst.file.size > 2 * 1024 * 1024) {
						this.props.toast.info('图片大小不能超过2M');
						getFileType = false;
						resove({ getFileType });
					} else if (index === images.length - 1) {
						resove({
							getFileType,
							fileList
						});
					}
				} else {
					fileList.push(element);
					if (index === images.length - 1) {
						resove({
							getFileType,
							fileList
						});
					}
				}
			}
		});
	};

	onChange = (images, type) => {
		console.log(images);

		switch (type) {
			case 'add':
				// 张数
				if (images && this.state.images && images.length > 4) {
					this.props.toast.info('图片上传不能超过4张');
					return;
				}
				if (!this.getFileType(images)) {
					this.props.toast.info('请上传jpg、png格式的图片');
					return;
				}

				this.getFile(images).then(({ getFileType, fileList = [] }) => {
					console.log(fileList, '========');
					if (getFileType) {
						this.setState({
							images: fileList
						});
					} else {
						this.setState({
							images: this.state.images || []
						});
					}
				});
				break;
			case 'remove':
				this.setState({
					images
				});
				break;

			default:
				break;
		}
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
		this.props.toast.loading('加载中...', 10);
		this.props.$fetch
			.post(question_addOpinion, imagesStream)
			.then((res) => {
				isFetching = false;
				if (res.code === '000000') {
					this.props.toast.info('提交成功', 2, () => {
						this.props.history.goBack();
					});
					buriedPointEvent(helpCenter.submit_succ, {
						img_count: images.length,
						type_name: queryData.type
					});
				} else {
					res.message && this.props.toast.info(res.message);
				}
			})
			.catch(() => {
				this.props.toast.hide();
				isFetching = false;
			});
	};
	componentWillUnmount() {
		isFetching = false;
	}
	render() {
		const { images, textareaVal = '' } = this.state;
		const btnDisable = !textareaVal;

		return (
			<div className={[styles.mine_page].join(' ')}>
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
					<ButtonCustom
						className={[styles.submitBtn, btnDisable ? styles.dis : ''].join(' ')}
						onClick={this.addOpinion}
						type={btnDisable ? 'gray' : 'yellow'}
					>
						提交意见
					</ButtonCustom>
				</div>
			</div>
		);
	}
}
