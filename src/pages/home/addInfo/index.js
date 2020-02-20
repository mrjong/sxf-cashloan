/*
 * @Author: shawn
 * @LastEditTime: 2020-02-20 17:44:06
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import { List } from 'antd-mobile';
import { createForm } from 'rc-form';
import { connect } from 'react-redux';
import { getH5Channel } from 'utils/common';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { addinfo } from 'utils/analytinsType';
import { getFirstError } from 'utils';
import { setBackGround } from 'utils/background';
import { domListen } from 'utils/domListen';
import { getNextStatus } from 'utils/CommonUtil/getNextStatus';
import { auth_suppleInfo } from 'fetch/api.js';

import { StepTitle, AsyncCascadePicker, ButtonCustom, FixedHelpCenter, FixedTopTip } from 'components';
import { add_info_submit } from './riskBuryConfig';

import style from './index.scss';
import informationMore from './img/back.png';

let submitButtonLocked = false;

@fetch.inject()
@connect((state) => ({
	nextStepStatus: state.commonState.nextStepStatus
}))
@createForm()
@setBackGround('#fff')
@domListen()
export default class add_info extends PureComponent {
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
			.get(auth_suppleInfo)
			.then((result) => {
				if (result.code === '000000') {
					this.setState({
						suppleInfo: result.data.list
					});
				} else {
					this.props.toast.info(result.message);
				}
			})
			.catch(() => {});
	};

	handleValidate = () => {
		const fieldsValue = this.props.form.getFieldsValue();
		const valid = Object.keys(fieldsValue).every((key) => !!fieldsValue[key]);
		return valid;
	};

	handleSubmit = () => {
		this.sxfMD(add_info_submit.key);
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
				this.props.toast.loading('加载中...', 10);
				this.props.$fetch
					.post(auth_suppleInfo, params)
					.then((result) => {
						submitButtonLocked = false;
						if (result.code === '000000' || result.code === '000030') {
							this.props.toast.info('提交成功');

							getNextStatus({
								RouterType: 'addInfo',
								$props: this.props
							});
						} else {
							this.props.toast.info(result.message);
						}
					})
					.catch(() => {
						this.props.toast.hide();
						submitButtonLocked = false;
					});
			} else {
				this.props.toast.info(getFirstError(err));
			}
		});
	};
	sxfMD = (type) => {
		sxfburiedPointEvent(type);
	};

	render() {
		const { getFieldDecorator } = this.props.form;
		const { suppleInfo } = this.state;
		const { nextStepStatus } = this.props;
		return (
			<div className={[style.nameDiv, 'info_addinfo'].join(' ')}>
				<FixedTopTip />
				<div className={style.pageContent}>
					<FixedHelpCenter history={this.props.history} />
					<StepTitle title="填写基本信息" titleSub="请填写基本信息，有利于您的借款审核" stepNum="03" />
					<div className={style.item_box}>
						{suppleInfo.map((item, index) => {
							return (
								<div
									key={index}
									className={[this.props.form.getFieldValue(item.code) ? 'item_box_has_value' : ''].join(' ')}
								>
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
											onVisibleChange={(bool) => {
												if (bool) {
													this.sxfMD(item.code + 'In');
												} else {
													this.sxfMD(item.code + 'Out');
												}
											}}
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
				<div className={style.sureBtnWrap}>
					<ButtonCustom
						type={suppleInfo && suppleInfo.length && this.handleValidate() ? 'yellow' : 'default'}
						onClick={this.handleSubmit}
						className={[style.sureBtn].join(' ')}
					>
						{nextStepStatus ? '下一步' : '完成'}
					</ButtonCustom>
				</div>
			</div>
		);
	}
}
