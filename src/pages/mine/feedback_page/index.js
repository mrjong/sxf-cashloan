/*
 * @Author: shawn
 * @LastEditTime : 2020-02-07 14:36:00
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import styles from './index.scss';
import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
import { helpCenter } from 'utils/analytinsType';
import { question_opinionList } from 'fetch/api';
import { Lists, ButtonCustom, LoadingView } from 'components';
import Image from 'assets/image';

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

@fetch.inject()
@setBackGround('#fff')
export default class mine_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			listsArr: [],
			isnoData: false
		};
	}
	componentWillMount() {
		this.getOpinionList();
	}

	getOpinionList = () => {
		this.props.$fetch
			.post(question_opinionList)
			.then((res) => {
				if (res.code === '000000') {
					const listsArr = res.data.list.map((item) => {
						return {
							label: {
								name: item.name
							},
							type: item.value
						};
					});
					this.setState({
						listsArr,
						isnoData: false
					});
					this.viewRef && this.viewRef.showDataView();
				} else {
					this.setState({
						isnoData: true
					});
					res.message && this.props.toast.info(res.message);
					this.viewRef && this.viewRef.setEmpty();
				}
			})
			.catch(() => {
				this.setState({
					isnoData: true
				});
				this.viewRef && this.viewRef.setEmpty();
			});
	};
	clickhandle = (item) => {
		buriedPointEvent(helpCenter.select_class, {
			type_name: item.label.name
		});
		this.props.history.push('/mine/feedback_save_page?type=' + item.type);
	};
	render() {
		const { listsArr = [] } = this.state;
		console.log(listsArr, 'listsArr');
		return (
			<div className={[styles.mine_page].join(' ')}>
				<div className={styles.textTitle}>我们聆听您的反馈，把更好的体验带给你</div>

				<LoadingView
					ref={(view) => (this.viewRef = view)}
					nodata={noData}
					errordata={errorData}
					onReloadData={() => {
						this.getOpinionList();
					}}
				>
					<Lists
						clickCb={this.clickhandle}
						listsInf={listsArr}
						className={[styles.common_margin, styles.mine_list].join(' ')}
					/>
				</LoadingView>

				{this.state.isnoData ? (
					<div>
						<div className={styles.err_page}>
							<i className={styles.err_img} />
							<ButtonCustom onClick={this.getOpinionList} className={styles.reload_btn}>
								刷新
							</ButtonCustom>
						</div>
					</div>
				) : (
					<div>
						<div className={styles.topLine} />
					</div>
				)}
			</div>
		);
	}
}
