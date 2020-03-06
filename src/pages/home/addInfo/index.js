/*
 * @Author: shawn
 * @LastEditTime: 2020-03-06 11:59:48
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import { List, Modal } from 'antd-mobile';
import { createForm } from 'rc-form';
import { connect } from 'react-redux';
import { getH5Channel } from 'utils/common';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { addinfo } from 'utils/analytinsType';
import { getFirstError, recordContract } from 'utils';
import { setBackGround } from 'utils/background';
import { domListen } from 'utils/domListen';
import { getNextStatus } from 'utils/CommonUtil/getNextStatus';
import { auth_suppleInfo, index_queryPLPShowSts, auth_userShunt } from 'fetch/api.js';
import dayjs from 'dayjs';
import { queryProtocolPreviewInfo } from 'utils/CommonUtil/commonFunc';
import { setIframeProtocolShow } from 'reduxes/actions/commonActions';
import qs from 'qs';
import LimitTimeJoin from './components/LimitTimeJoin';

import {
	StepTitle,
	AsyncCascadePicker,
	ButtonCustom,
	FixedHelpCenter,
	FixedTopTip,
	CheckRadio,
	AgreementModal
} from 'components';
import { add_info_submit } from './riskBuryConfig';

import style from './index.scss';
import Images from 'assets/image';

let submitButtonLocked = false;
let urlQuery = '';

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
		urlQuery = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		this.state = {
			suppleInfo: [],
			selectFlag: false,
			showAgreement: false, // 显示协议弹窗
			shuntFlag: '' // 用户分流标识,展示哪种方案
		};
	}

	componentWillMount() {
		this.getsuppleInfo();
		urlQuery && urlQuery.jumpToBase && this.getUserShuntInfo();
		// mpos中从授权页进入基本信息，判断是否显示协议
		urlQuery && urlQuery.jumpToBase && this.judgeShowAgree();
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

	// 用户分流
	getUserShuntInfo = () => {
		this.props.$fetch.post(auth_userShunt).then((res) => {
			if (res.code === '000000') {
				this.setState({
					shuntFlag: Number(res.data.result) + 1
				});
			} else {
				this.props.toast.info(res.message);
			}
		});
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
		const { selectFlag, shuntFlag } = this.state;
		this.sxfMD(add_info_submit.key);
		buriedPointEvent(addinfo.DC_ADDINFO_SUBMIT, {
			planNum: shuntFlag
		});
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
						buriedPointEvent(addinfo.DC_ADDINFO_SUBMIT_RESULT, {
							planNum: shuntFlag,
							isSuccess: result.code === '000000' || result.code === '000030' ? '1' : '0'
						});
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
		// const { selectFlag } = this.state;
		// store.setCacheBaseInfo({ selectFlag });
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

	judgeShowAgree = () => {
		this.props.$fetch.get(index_queryPLPShowSts).then(async (res) => {
			if (res && res.code === '000000') {
				// agreementPopupFlag协议弹框是否显示，1为显示，0为隐藏
				this.setState({
					showAgreement: res.data.plpSts === '1'
				});
			} else {
				this.props.toast.info(res.message);
			}
		});
	};

	render() {
		const { getFieldDecorator } = this.props.form;
		const { suppleInfo, selectFlag, showAgreement, shuntFlag } = this.state;
		const { nextStepStatus } = this.props;
		return (
			<div className={[style.nameDiv, 'info_addinfo'].join(' ')}>
				<FixedTopTip />
				{shuntFlag ? (
					<div className={style.activityBox}>
						<LimitTimeJoin shuntNum={shuntFlag} />
					</div>
				) : null}
				<div className={style.pageContent}>
					<FixedHelpCenter history={this.props.history} />
					<StepTitle title="填写补充信息" titleSub="信息加密传输，仅用于申请还到" stepNum="02" />
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
				{/* 隐私协议弹框 */}
				<Modal visible={showAgreement} transparent wrapClassName="agreement_modal_warp" maskClosable={false}>
					<AgreementModal
						visible={showAgreement}
						handleClick={() => {
							this.setState({
								showAgreement: false
							});
							recordContract({
								contractType: '02'
							});
						}}
					/>
				</Modal>
			</div>
		);
	}
}
