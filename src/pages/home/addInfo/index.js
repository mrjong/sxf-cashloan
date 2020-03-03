/*
 * @Author: shawn
 * @LastEditTime: 2020-03-03 17:55:19
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
import dayjs from 'dayjs';
import { queryProtocolPreviewInfo } from 'utils/CommonUtil/commonFunc';
import { setIframeProtocolShow } from 'reduxes/actions/commonActions';

import {
	StepTitle,
	AsyncCascadePicker,
	ButtonCustom,
	FixedHelpCenter,
	FixedTopTip,
	CheckRadio
} from 'components';
import { add_info_submit } from './riskBuryConfig';

import style from './index.scss';
import Images from 'assets/image';

let submitButtonLocked = false;

@fetch.inject()
@connect(
	(state) => ({
		nextStepStatus: state.commonState.nextStepStatus
	}),
	{
		setIframeProtocolShow
	}
)
@createForm()
@setBackGround('#fff')
@domListen()
export default class add_info extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			suppleInfo: [],
			selectFlag: false
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
		const { selectFlag } = this.state;
		const fieldsValue = this.props.form.getFieldsValue();
		let valid = Object.keys(fieldsValue).every((key) => !!fieldsValue[key]);
		if (!selectFlag) {
			valid = false;
		}
		return valid;
	};

	handleSubmit = () => {
		const { selectFlag } = this.state;
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
				if (!selectFlag) {
					this.props.toast.info('请先阅读并勾选相关协议');
					return;
				}
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

	// 跳转个人信息授权书
	readContract = async (jumpUrl) => {
		const { selectFlag } = this.state;
		store.setCacheBaseInfo({ selectFlag });
		let protocolPreviewInfo = await queryProtocolPreviewInfo({ $props: this.props });
		if (protocolPreviewInfo) {
			const pageData = {
				name: protocolPreviewInfo.name,
				idNo: protocolPreviewInfo.idNo,
				dateTime: dayjs(new Date()).format('YYYY年MM月DD日')
			};
			this.props.setIframeProtocolShow({
				url: jumpUrl,
				contractInf: pageData
			});
		}
	};

	selectProtocol = () => {
		this.setState({
			selectFlag: !this.state.selectFlag
		});
	};

	render() {
		const { getFieldDecorator } = this.props.form;
		const { suppleInfo, selectFlag } = this.state;
		const { nextStepStatus } = this.props;
		return (
			<div className={[style.nameDiv, 'info_addinfo'].join(' ')}>
				<FixedTopTip />
				<div className={style.pageContent}>
					<FixedHelpCenter history={this.props.history} />
					<StepTitle title="填写补充信息" titleSub="信息加密传输，仅用于申请还到" stepNum="03" />
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
									<img className={style.informationMore} src={Images.icon.icon_arrow_right} />
								</div>
							);
						})}
					</div>
					<div className={style.protocolBox} onClick={this.selectProtocol}>
						<CheckRadio isSelect={selectFlag} />
						点击按钮即视为同意
						<em
							onClick={(e) => {
								e.stopPropagation();
								this.readContract('personal_auth_page');
							}}
							className={style.link}
						>
							《个人信息授权书》
						</em>
						<em
							onClick={(e) => {
								e.stopPropagation();
								this.readContract('user_privacy_page');
							}}
							className={style.link}
						>
							《用户隐私权政策》
						</em>
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
