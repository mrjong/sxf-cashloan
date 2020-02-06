/*
 * @Author: shawn
 * @LastEditTime: 2019-08-30 15:33:08
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import Lists from 'components/Lists';
import ButtonCustom from 'components/ButtonCustom';
import styles from './index.scss';
import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
import { helpCenter } from 'utils/analytinsType';

import { question_opinionList } from 'fetch/api.js';

const API = {
	opinionList: '/question/opinionList' // 意见类型列表接口
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
				} else {
					this.setState({
						isnoData: true
					});
					res.message && this.props.toast.info(res.message);
				}
			})
			.catch(() => {
				this.setState({
					isnoData: true
				});
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
						<div className={styles.textTitle}>我们聆听您的反馈，把更好的体验带给你</div>
						<Lists
							clickCb={this.clickhandle}
							listsInf={listsArr}
							className={[styles.common_margin, styles.mine_list].join(' ')}
						/>

						<div className={styles.topLine} />
					</div>
				)}
			</div>
		);
	}
}
