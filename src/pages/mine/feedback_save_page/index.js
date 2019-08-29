import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import SXFButton from 'components/ButtonCustom';
import { Icon, TextareaItem, ImagePicker, WingBlank, SegmentedControl } from 'antd-mobile';
import Lists from 'components/Lists';
import { buriedPointEvent } from 'utils/analytins';
import { mine } from 'utils/analytinsType';
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
			textareaVal: '我最大的意见就是没意见。'
		};
	}
	componentWillMount() {
		queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
	}
	onChange = (images) => {
		this.setState({
			images
		});
	};

	addOpinion = () => {
		const { textareaVal = '', images = [] } = this.state;
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
		this.props.$fetch
			.post(API.addOpinion, {
				content: textareaVal,
				images,
				type: queryData.type
			})
			.then((res) => {
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
						textareaVal >= 1 ? [styles.textArea, styles.textAreaMax].join(' ') : styles.textArea
					}`}
					placeholder="我最大的意见就是没意见。"
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
						accept="image/jpeg,image/jpg,image/png"
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
