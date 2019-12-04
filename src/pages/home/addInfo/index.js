/*
 * @Author: shawn
 * @LastEditTime: 2019-12-03 21:49:36
 */
import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { List } from 'antd-mobile';
import informationMore from './img/back.png';
import AsyncCascadePicker from 'components/AsyncCascadePicker';
import ButtonCustom from 'components/ButtonCustom';
import fetch from 'sx-fetch';
import { getH5Channel } from 'utils/common';
import { buriedPointEvent } from 'utils/analytins';
import { addinfo } from 'utils/analytinsType';

import { getFirstError, getNextStr } from 'utils';
import style from './index.scss';
// import { home } from 'utils/analytinsType';
// import { buryingPoints } from 'utils/buryPointMethods';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import { domListen } from 'utils/domListen';

let submitButtonLocked = false;
const API = {
	auth_suppleInfo: '/auth/suppleInfo'
};

@fetch.inject()
@createForm()
@setBackGround('#F7F8FA')
@domListen()
export default class essential_information_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			suppleInfo: []
		};
	}

	componentWillMount() {
		this.getsuppleInfo();
	}

	getsuppleInfo = () => {
		this.props.$fetch
			.get(`${API.auth_suppleInfo}`)
			.then((result) => {
				if (result.msgCode === 'PTM0000') {
					this.setState({
						suppleInfo: result.data
					});
				} else {
					this.props.toast.info(result.msgInfo);
				}
			})
			.catch(() => {});
	};
	handleSubmit = () => {
		buriedPointEvent(addinfo.DC_ADDINFO_SUBMIT);
		if (submitButtonLocked) return;
		submitButtonLocked = true;
		let timer = setTimeout(() => {
			submitButtonLocked = false;
			clearTimeout(timer);
		}, 3000);
		// 调基本信息接口
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let params = {
					osType: getH5Channel(),
					usrBusCnl: ''
				};
				for (const key in values) {
					params[key] = values[key][0];
				}
				this.props.$fetch
					.post(API.auth_suppleInfo, params)
					.then((result) => {
						submitButtonLocked = false;
						if (result.msgCode === 'PTM0000') {
							this.props.toast.info('提交成功');
							setTimeout(() => {
								getNextStr({
									RouterType: 'add_info',
									$props: this.props
								});
							}, 2000);
						}
						if (result.msgCode === 'PCC-PRC-9994') {
							this.props.toast.info('提交成功');
							setTimeout(() => {
								getNextStr({
									RouterType: 'add_info',
									$props: this.props
								});
							}, 2000);
						} else {
							this.props.toast.info(result.msgInfo);
						}
					})
					.catch(() => {
						submitButtonLocked = false;
					});
			} else {
				this.props.toast.info(getFirstError(err));
			}
		});
	};

	render() {
		const { getFieldDecorator } = this.props.form;
		const { suppleInfo } = this.state;
		const needNextUrl = store.getNeedNextUrl();
		return (
			<div className={[style.nameDiv, 'info_addinfo'].join(' ')}>
				<div className={style.warning_tip}>还到不向学生借款</div>
				<div>
					<div className={style.item_box}>
						{suppleInfo.map((item, index) => {
							console.log('1');
							return (
								<div key={index} className={style.labelDiv}>
									{getFieldDecorator(item.code, {
										initialValue: this.state.relatValue,
										rules: [{ required: true, message: `请选择${item.name}` }]
									})(
										<AsyncCascadePicker
											className="hasborder"
											title={`${item.name}`}
											loadData={[
												() => {
													return new Promise((resolve) => {
														const value = item.value.map((item2) => ({
															value: item2.code,
															label: item2.name
														}));
														resolve(value);
													});
												}
											]}
											cols={1}
										>
											<List.Item className="hasborder">{item.name}</List.Item>
										</AsyncCascadePicker>
									)}
									<img className={style.informationMore} src={informationMore} />
								</div>
							);
						})}
					</div>
				</div>
				<ButtonCustom onClick={this.handleSubmit} className={[style.sureBtn].join(' ')}>
					{needNextUrl ? '下一步' : '完成'}
				</ButtonCustom>
			</div>
		);
	}
}
