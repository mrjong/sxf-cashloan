/*
 * @Author: shawn
 * @LastEditTime: 2020-03-05 11:32:52
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import { connect } from 'react-redux';
import { createForm } from 'rc-form';
import { InputItem, List, Toast } from 'antd-mobile';
import { base64Encode, base64Decode } from 'utils/CommonUtil/toolUtil';
import { getNextStatus } from 'utils/CommonUtil/getNextStatus';
import { getLngLat, getAddress } from 'utils/Address.js';
import { getFirstError, validators, handleInputBlur } from 'utils';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { home, mine, preApproval } from 'utils/analytinsType';
import { buryingPoints } from 'utils/buryPointMethods';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import { domListen } from 'utils/domListen';
import dayjs from 'dayjs';
import { queryProtocolPreviewInfo } from 'utils/CommonUtil/commonFunc';
import { setIframeProtocolShow } from 'reduxes/actions/commonActions';
import {
	FixedHelpCenter,
	StepTitle,
	AsyncCascadePicker,
	ButtonCustom,
	FixedTopTip,
	CheckRadio
} from 'components';
import {
	contact_relationship_click,
	contact_relationship_close,
	contact_relationship2_click,
	contact_relationship2_close,
	contact_name_oneRiskBury,
	contact_name_twoRiskBury,
	contact_name_onePhoneNo,
	contact_name_twoPhoneNo,
	protocol_checkbox_click,
	submit_button_click,
	grxxsqsRiskBury,
	yhysqzcRiskBury
} from './riskBuryConfig';
import style from './index.scss';
import Images from 'assets/image';
import { auth_queryUsrBasicInfo, msg_relation, auth_prePersonalData } from 'fetch/api';

const pageKey = home.basicInfoBury;
let submitButtonLocked = false;
// let isFetching = false;
@fetch.inject()
@createForm()
@setBackGround('#fff')
@domListen()
@connect(
	(state) => ({
		userInfo: state.staticState.userInfo,
		nextStepStatus: state.commonState.nextStepStatus
	}),
	{
		setIframeProtocolShow
	}
)
export default class pre_add_contact_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			relatValue: [], // 选中的联系人
			relatValue2: [],
			selectFlag: false
		};
	}

	componentWillMount() {
		if (store.getBackFlag()) {
			store.removeBackFlag(); // 清除返回的flag
		}
		buryingPoints();
		this.queryUsrBasicInfo();
	}

	componentDidMount() {
		// 安卓键盘抬起会触发resize事件，ios则不会
		window.addEventListener('resize', function() {
			if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
				window.setTimeout(function() {
					document.activeElement.scrollIntoViewIfNeeded();
				}, 0);
			}
		});
	}

	componentWillUnmount() {
		buryingPoints();
		window.removeEventListener('resize', function() {
			if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
				window.setTimeout(function() {
					document.activeElement.scrollIntoViewIfNeeded();
				}, 0);
			}
		});
	}

	// 跳转个人信息授权书
	readContract = async (obj) => {
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
				url: obj.jumpUrl,
				contractInf: pageData,
				pId: obj.pId
			});
		}
	};

	selectProtocol = () => {
		this.setState({
			selectFlag: !this.state.selectFlag
		});
		this.sxfMD(protocol_checkbox_click.key);
	};

	buttonDisabled = (showToast) => {
		const formData = this.props.form.getFieldsValue();
		const { selectFlag } = this.state;
		const { linkman, linkman2, linkphone, linkphone2, cntRelTyp1, cntRelTyp2 } = formData;
		if (showToast) {
			if (!cntRelTyp1[0]) {
				Toast.info('请选择联系人1关系');
				return true;
			}
			if (!linkman) {
				Toast.info('请填写联系人1姓名');
				return true;
			}
			if (!validators.name(linkman)) {
				Toast.info('请填写正确的联系人1姓名');
				return true;
			}
			if (!linkphone) {
				Toast.info('请填写联系人1手机号');
				return true;
			}
			if (!validators.phone(linkphone)) {
				Toast.info('请填写正确的联系人1手机号');
				return true;
			}
			if (!cntRelTyp2[0]) {
				Toast.info('请选择联系人2关系');
				return true;
			}
			if (!linkman2) {
				Toast.info('请填写联系人2姓名');
				return true;
			}
			if (!validators.name(linkman2)) {
				Toast.info('请填写正确的联系人2姓名');
				return true;
			}
			if (!linkphone2) {
				Toast.info('请填写联系人2手机号');
				return true;
			}
			if (!validators.phone(linkphone2)) {
				Toast.info('请填写正确的联系人2手机号');
				return true;
			}
			if (!selectFlag) {
				Toast.info('请先阅读并勾选相关协议');
				return true;
			}
		}
		if (
			!cntRelTyp2[0] ||
			!linkman ||
			!linkphone2 ||
			!cntRelTyp1[0] ||
			!linkman2 ||
			!linkphone ||
			!selectFlag
		) {
			return true;
		}
		return false;
	};

	// 回显地址
	commonFunc = (res) => {
		const cacheData = store.getCacheBaseInfo();
		store.removeCacheBaseInfo();
		// 阅读协议后缓存信息
		if (cacheData) {
			this.props.form.setFieldsValue({
				linkman: store.getLinkman() || (res && res.data && base64Decode(res.data.cntUsrNm1)) || '',
				linkphone: store.getLinkphone() || (res && res.data && base64Decode(res.data.cntUsrTel1)) || '',
				linkman2: store.getLinkman2() || (res && res.data && base64Decode(res.data.cntUsrNm2)) || '',
				linkphone2: store.getLinkphone2() || (res && res.data && base64Decode(res.data.cntUsrTel2)) || ''
			});
		} else {
			this.props.form.setFieldsValue({
				linkman:
					(res && res.data && res.data.cntUsrNm1 && base64Decode(res.data.cntUsrNm1)) ||
					store.getLinkman() ||
					'',
				linkphone:
					(res && res.data && res.data.cntUsrTel1 && base64Decode(res.data.cntUsrTel1)) ||
					store.getLinkphone() ||
					'',
				linkman2:
					(res && res.data && res.data.cntUsrNm2 && base64Decode(res.data.cntUsrNm2)) ||
					store.getLinkman2() ||
					'',
				linkphone2:
					(res && res.data && res.data.cntUsrTel2 && base64Decode(res.data.cntUsrTel2)) ||
					store.getLinkphone2() ||
					''
			});
		}
		if (cacheData) {
			this.setState({
				relatValue: store.getRelationValue()
					? store.getRelationValue()
					: res && res.data && res.data.cntRelTyp1
					? [`${res.data.cntRelTyp1}`]
					: [],
				relatValue2: store.getRelationValue2()
					? store.getRelationValue2()
					: res && res.data && res.data.cntRelTyp2
					? [`${res.data.cntRelTyp2}`]
					: [],
				selectFlag: cacheData.selectFlag || false
			});
		} else {
			this.setState({
				relatValue:
					res && res.data && res.data.cntRelTyp1
						? [`${res.data.cntRelTyp1}`]
						: store.getRelationValue()
						? store.getRelationValue()
						: [],
				relatValue2:
					res && res.data && res.data.cntRelTyp2
						? [`${res.data.cntRelTyp2}`]
						: store.getRelationValue2()
						? store.getRelationValue2()
						: [],
				selectFlag: (cacheData && cacheData.selectFlag) || false
			});
		}
	};

	//获取基本信息
	queryUsrBasicInfo = () => {
		this.props.$fetch.get(auth_queryUsrBasicInfo).then((res) => {
			if (res.code === '000000' && res && res.data) {
				this.commonFunc(res);
			} else {
				this.commonFunc(null);
			}
		});
	};

	handleSubmit = () => {
		if (submitButtonLocked) return;
		if (this.buttonDisabled(true)) return;
		this.sxfMD(submit_button_click.key);
		submitButtonLocked = true;
		// 调基本信息接口
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const params = {
					cntRelTyp1: values.cntRelTyp1[0],
					cntRelTyp2: values.cntRelTyp2[0],
					cntUsrNm1: base64Encode(values.linkman),
					cntMblNo1: base64Encode(values.linkphone),
					cntUsrNm2: base64Encode(values.linkman2),
					cntMblNo2: base64Encode(values.linkphone2)
				};
				if (values.linkphone === values.linkphone2) {
					Toast.info('联系人手机号重复，请重新填写');
					submitButtonLocked = false;
					return;
				}
				Toast.loading('加载中...', 10);
				this.props.$fetch
					.post(auth_prePersonalData, params)
					.then((result) => {
						submitButtonLocked = false;
						Toast.hide();
						if (result && result.code === '000000') {
							store.setBackFlag(true);
							// 埋点-基本信息页-确定按钮
							this.confirmBuryPoint(true);
							buriedPointEvent(mine.creditExtensionBack, {
								current_step: '基本信息认证'
							});
							if (this.props.nextStepStatus) {
								Toast.info('提交成功', 2);
								// getNextStatus({
								// 	RouterType: 'essential_infomation_page',
								// 	$props: this.props
								// });
							}
						} else if (result.code === '000030') {
							if (this.props.nextStepStatus) {
								Toast.info('提交成功', 2);
								// getNextStatus({
								// 	RouterType: 'essential_infomation_page',
								// 	$props: this.props
								// });
							}
						} else {
							this.confirmBuryPoint(false, result.message);
							Toast.info(result.message);
						}
					})
					.catch(() => {
						submitButtonLocked = false;
					});
			} else {
				submitButtonLocked = false;
				Toast.info(getFirstError(err));
			}
		});
	};

	// 点击确定按钮埋点
	confirmBuryPoint = (isSucc, failInf) => {
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		// 是否是从我的里面进入
		const isFromMine = query.isShowCommit;
		buriedPointEvent(preApproval.addContractSubmit, {
			entry: !isFromMine || isFromMine === 'false' ? '我的' : '风控授信项',
			is_success: isSucc,
			fail_cause: failInf,
			comeFrom: query.entry // 是从确认授权页面、获取验证码页面，还是首页进入
		});
	};

	//input 获取焦点 width: 100%
	inputOnFocus(val, lab) {
		buryingPoints({
			pageKey,
			trigger: 'focus',
			value: val,
			label: lab
		});
	}

	//input 失去焦点
	inputOnBlur(val, lab) {
		handleInputBlur();
		buryingPoints({
			pageKey,
			trigger: 'blur',
			value: val,
			label: lab
		});
	}

	selectClick(obj) {
		buryingPoints({
			trigger: 'open',
			pageKey,
			...obj
		});
	}

	selectSure(obj) {
		buryingPoints({
			trigger: 'sure',
			pageKey,
			...obj
		});
	}

	sxfMD = (type) => {
		sxfburiedPointEvent(type);
	};

	render() {
		const { getFieldDecorator } = this.props.form;
		const { selectFlag } = this.state;
		const { nextStepStatus } = this.props;
		return (
			<div className={[style.nameDiv, 'info_gb'].join(' ')}>
				<FixedTopTip />
				<div className={style.pageContent}>
					<FixedHelpCenter history={this.props.history} />
					<StepTitle title="补充联系人信息" titleSub="请确保内容真实有效，有利于您的借款审核" stepNum="" />
					<div className={style.step_box_new}>
						<div className={style.item_box}>
							<div className={style.titleTop}>
								<span className={style.titleTopNum}>1</span>紧急联系人
							</div>
							<div
								className={[
									(this.state.relatValue && this.state.relatValue.length) ||
									(this.props.form.getFieldValue('cntRelTyp1') &&
										this.props.form.getFieldValue('cntRelTyp1').length)
										? 'hasSelectValue'
										: ''
								].join(' ')}
							>
								{(this.state.relatValue && this.state.relatValue.length) ||
								(this.props.form.getFieldValue('cntRelTyp1') &&
									this.props.form.getFieldValue('cntRelTyp1').length) ? (
									<div className={[style.lableTipWrap, style.lableTipWrap_cntRelTyp1].join(' ')}>
										<span className={style.labelTipText}>所属关系</span>
									</div>
								) : null}
								{getFieldDecorator('cntRelTyp1', {
									initialValue: this.state.relatValue,
									onChange: (value) => {
										this.setState({
											isCntRelTyp1Value: true
										});
										store.setRelationValue(value);
										this.selectSure({
											value: JSON.stringify(value),
											label: 'clan_relation'
										});
									}
								})(
									<AsyncCascadePicker
										title="选择联系人"
										loadData={[
											() =>
												this.props.$fetch.get(`${msg_relation}/1`).then((result) => {
													const prov =
														result && result.data && result.data.data && result.data.data.length
															? result.data.data
															: [];
													return prov.map((item) => ({
														value: item.code,
														label: item.name
													}));
												})
										]}
										cols={1}
										onVisibleChange={(bool) => {
											if (bool) {
												this.sxfMD(contact_relationship_click.key);
												this.selectClick({
													value: JSON.stringify(this.state.relatValue),
													label: 'clan_relation'
												});
											} else {
												this.sxfMD(contact_relationship_close.key);
											}
										}}
									>
										<List.Item className="hasborder"></List.Item>
									</AsyncCascadePicker>
								)}
								<img className={style.informationMore} src={Images.icon.icon_arrow_right} />
							</div>
							{this.state.linkman || this.props.form.getFieldValue('linkman') ? (
								<div className={[style.lableTipWrap, style.lableTipWrap_linkman].join(' ')}>
									<span className={style.labelTipText}>真实姓名</span>
								</div>
							) : null}
							{getFieldDecorator('linkman', {
								onChange: (value) => {
									store.setLinkman(value);
									this.setState({ linkman: value });
								}
							})(
								<InputItem
									clear
									data-sxf-props={JSON.stringify({
										type: contact_name_oneRiskBury.type,
										name: contact_name_oneRiskBury.key,
										actContain: contact_name_oneRiskBury.actContain
									})}
									placeholder="真实姓名"
									type="text"
									onBlur={(v) => {
										this.inputOnBlur(v, 'contact_name_one');
									}}
									onFocus={(v) => {
										this.inputOnFocus(v, 'contact_name_one');
									}}
								></InputItem>
							)}
							{this.state.linkphone || this.props.form.getFieldValue('linkphone') ? (
								<div className={[style.lableTipWrap, style.lableTipWrap_linkphone].join(' ')}>
									<span className={style.labelTipText}>手机号</span>
								</div>
							) : null}
							{getFieldDecorator('linkphone', {
								onChange: (value) => {
									store.setLinkphone(value);
									this.setState({ linkphone: value });
								}
							})(
								<InputItem
									data-sxf-props={JSON.stringify({
										type: contact_name_onePhoneNo.type,
										name: contact_name_onePhoneNo.key,
										actContain: contact_name_onePhoneNo.actContain
									})}
									clear
									className="hasborder"
									type="number"
									maxLength="11"
									placeholder="手机号"
									onBlur={(v) => {
										this.inputOnBlur(v, 'contact_tel_one');
									}}
									onFocus={(v) => {
										this.inputOnFocus(v, 'contact_tel_one');
									}}
								></InputItem>
							)}
						</div>

						<div className={style.item_box}>
							<div className={style.titleTop}>
								<span className={style.titleTopNum}>2</span>紧急联系人
							</div>
							<div
								className={[
									(this.state.relatValue2 && this.state.relatValue2.length) ||
									(this.props.form.getFieldValue('cntRelTyp2') &&
										this.props.form.getFieldValue('cntRelTyp2').length)
										? 'hasSelectValue'
										: ''
								].join(' ')}
							>
								{(this.state.relatValue2 && this.state.relatValue2.length) ||
								(this.props.form.getFieldValue('cntRelTyp2') &&
									this.props.form.getFieldValue('cntRelTyp2').length) ? (
									<div className={[style.lableTipWrap, style.lableTipWrap_cntRelTyp1].join(' ')}>
										<span className={style.labelTipText}>所属关系</span>
									</div>
								) : null}
								{getFieldDecorator('cntRelTyp2', {
									initialValue: this.state.relatValue2,
									onChange: (value) => {
										store.setRelationValue2(value);
										this.selectSure({
											value: JSON.stringify(value),
											label: 'clan_relation'
										});
									}
								})(
									<AsyncCascadePicker
										className="hasborder"
										title="选择联系人"
										loadData={[
											() =>
												this.props.$fetch.get(`${msg_relation}/2`).then((result) => {
													const prov =
														result && result.data && result.data.data && result.data.data.length
															? result.data.data
															: [];
													return prov.map((item) => ({
														value: item.code,
														label: item.name
													}));
												})
										]}
										cols={1}
										onVisibleChange={(bool) => {
											if (bool) {
												this.sxfMD(contact_relationship2_click.key);
												this.selectClick({
													value: JSON.stringify(this.state.relatValue2),
													label: 'clan_relation'
												});
											} else {
												this.sxfMD(contact_relationship2_close.key);
											}
										}}
									>
										<List.Item className="hasborder"></List.Item>
									</AsyncCascadePicker>
								)}
								<img className={style.informationMore} src={Images.icon.icon_arrow_right} />
							</div>
							{this.state.linkman2 || this.props.form.getFieldValue('linkman2') ? (
								<div className={[style.lableTipWrap, style.lableTipWrap_linkman].join(' ')}>
									<span className={style.labelTipText}>真实姓名</span>
								</div>
							) : null}
							{getFieldDecorator('linkman2', {
								onChange: (value) => {
									store.setLinkman2(value);
									this.setState({ linkman2: value });
								}
							})(
								<InputItem
									data-sxf-props={JSON.stringify({
										type: contact_name_twoRiskBury.type,
										name: contact_name_twoRiskBury.key,
										actContain: contact_name_twoRiskBury.actContain
									})}
									clear
									placeholder="真实姓名"
									type="text"
									onBlur={(v) => {
										this.inputOnBlur(v, 'contact_name_two');
									}}
									onFocus={(v) => {
										this.inputOnFocus(v, 'contact_name_two');
									}}
								></InputItem>
							)}
							{this.state.linkphone2 || this.props.form.getFieldValue('linkphone2') ? (
								<div className={[style.lableTipWrap, style.lableTipWrap_linkphone].join(' ')}>
									<span className={style.labelTipText}>手机号</span>
								</div>
							) : null}
							{getFieldDecorator('linkphone2', {
								onChange: (value) => {
									store.setLinkphone2(value);
									this.setState({ linkphone2: value });
								}
							})(
								<InputItem
									data-sxf-props={JSON.stringify({
										type: contact_name_twoPhoneNo.type,
										name: contact_name_twoPhoneNo.key,
										actContain: contact_name_twoPhoneNo.actContain
									})}
									clear
									className="hasborder"
									type="number"
									maxLength="11"
									placeholder="手机号"
									onBlur={(v) => {
										this.inputOnBlur(v, 'contact_tel_two');
									}}
									onFocus={(v) => {
										this.inputOnFocus(v, 'contact_tel_two');
									}}
								></InputItem>
							)}
						</div>
					</div>

					<div className={style.protocolBox} onClick={this.selectProtocol}>
						<CheckRadio isSelect={selectFlag} />
						点击按钮即视为同意
						<em
							onClick={(e) => {
								e.stopPropagation();
								this.readContract({
									pId: grxxsqsRiskBury.key,
									jumpUrl: 'personal_auth_page'
								});
							}}
							className={style.link}
						>
							《个人信息授权书》
						</em>
						<em
							onClick={(e) => {
								e.stopPropagation();
								this.readContract({
									pId: yhysqzcRiskBury.key,
									jumpUrl: 'user_privacy_page'
								});
							}}
							className={style.link}
						>
							《用户隐私权政策》
						</em>
					</div>
				</div>
				<div className={style.sureBtnWrap}>
					<ButtonCustom onClick={this.handleSubmit} type={this.buttonDisabled() ? 'default' : 'yellow'}>
						{nextStepStatus ? '下一步' : '完成'}
					</ButtonCustom>
				</div>
			</div>
		);
	}
}
