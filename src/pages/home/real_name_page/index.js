/*
 * @Author: shawn
 * @LastEditTime: 2020-02-20 17:41:21
 */
import React, { Component } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import { createForm } from 'rc-form';
import { InputItem, List, Toast } from 'antd-mobile';
import { connect } from 'react-redux';
import { setUserInfoAction } from 'reduxes/actions/staticActions';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import { domListen } from 'utils/domListen';
import { base64Encode } from 'utils/CommonUtil/toolUtil';
import { getNextStatus } from 'utils/CommonUtil/getNextStatus';
import { getDeviceType, validators, handleInputBlur } from 'utils';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { home, mine } from 'utils/analytinsType';
import { auth_ocrIdChk, auth_idChk, signup_refreshClientUserInfo } from 'fetch/api';
import ButtonCustom from 'components/ButtonCustom';
import StepTitle from 'components/StepTitle';
import FEZipImage from 'components/FEZIpImage';
import FixedHelpCenter from 'components/FixedHelpCenter';
import {
	idCardFRiskBury,
	idCardOutFRiskBury,
	idCardBRiskBury,
	idCardOutBRiskBury,
	idNameRiskBury,
	idNoRiskBury
} from './riskBuryConfig';

import style from './index.scss';
import Images from 'assets/image';

const updateLeftPlaceHolder = Images.adorn.id_card_front;
const updateLeftSuccessPlaceHolder = Images.adorn.id_card_front_success;
const updateRightPlaceHolder = Images.adorn.id_card_after;
const updateRightSuccessPlaceHolder = Images.adorn.id_card_after_success;
const updateBottomTip = Images.bg.id_card_tip;

const isEquipment = window.navigator.userAgent.match(
	/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
);
let urlQuery = '';
@fetch.inject()
@createForm()
@setBackGround('#fff')
@domListen()
@connect(
	(state) => ({
		userInfo: state.staticState.userInfo,
		nextStepStatus: state.commonState.nextStepStatus
	}),
	{ setUserInfoAction }
)
export default class real_name_page extends Component {
	state = {
		idName: '',
		idNo: '',
		ocrZhengData: {},
		ocrFanData: {},
		leftValue: '',
		updateLeftValue: '',
		rightValue: '',
		leftUploaded: false,
		rightUploaded: false,
		footerUploaded: false,
		showState: false,
		disabledupload: 'false'
	};

	componentWillMount() {
		if (store.getBackFlag()) {
			store.removeBackFlag(); // 清除返回的flag
		}

		urlQuery = qs.parse(location.search, { ignoreQueryPrefix: true });
		let { userInfo } = this.props;
		if (urlQuery.newTitle) {
			// 判断是不是授信来的
			this.props.setTitle(urlQuery.newTitle);
		}
		if (userInfo && JSON.stringify(userInfo) !== '{}') {
			this.setState({
				userInfo,
				showState: true
			});
		} else {
			this.setState({
				showState: true
			});
		}
	}

	handleNameChange = (value) => {
		this.setState({ idName: value });
	};
	handleNumberChange = (value) => {
		this.setState({ idNo: value });
	};

	// 上传身份证正面
	handleChangePositive = ({ base64Data }) => {
		if (!base64Data) {
			Toast.hide();
			this.setState({
				disabledupload: 'false'
			});
		}
		if (!isEquipment) {
			Toast.info('请使用手机设备');
			return;
		}
		buriedPointEvent(home.informationMyselfFrontCard);

		let bytes = window.atob(base64Data.split(',')[1]);
		let array = [];
		for (let i = 0; i < bytes.length; i++) {
			array.push(bytes.charCodeAt(i));
		}
		let blob = new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
		const formData = new FormData();

		formData.append('image', blob);
		formData.append('ocrType', '2');

		Toast.loading('加载中...', 10);
		this.props.$fetch
			.post(`${auth_ocrIdChk}/2`, formData, { 'Content-Type': 'multipart/form-data', timeout: 30000 })
			.then((result) => {
				this.setState({
					disabledupload: 'false'
				});
				if (result.code === '000000') {
					Toast.hide();
					this.setState({
						ocrZhengData: result.data,
						idName: result.data.idName || '',
						idNo: result.data.idNo || '',
						leftUploaded: true,
						leftValue: base64Data
					});
				} else {
					Toast.info(result.message);
					this.setState({ leftUploaded: false, leftValue: '' });
				}
			})
			.catch(() => {
				this.setState({
					disabledupload: 'false'
				});
				this.setState({ leftUploaded: false, leftValue: '' });
				Toast.hide();
			});
	};
	// 上传身份证反面
	handleChangeSide = ({ base64Data }) => {
		if (!base64Data) {
			Toast.hide();
			this.setState({
				disabledupload: 'false'
			});
		}
		if (!isEquipment) {
			Toast.info('请使用手机设备');
			return;
		}
		buriedPointEvent(home.informationMyselfBackCard);

		let bytes = window.atob(base64Data.split(',')[1]);
		let array = [];
		for (let i = 0; i < bytes.length; i++) {
			array.push(bytes.charCodeAt(i));
		}
		let blob = new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
		const formData = new FormData();

		formData.append('image', blob);
		formData.append('ocrType', '2');

		Toast.loading('加载中...', 10);
		this.props.$fetch
			.post(`${auth_ocrIdChk}/3`, formData, { 'Content-Type': 'multipart/form-data', timeout: 30000 })
			.then((res) => {
				this.setState({
					disabledupload: 'false'
				});
				if (res.code === '000000') {
					this.setState({
						ocrFanData: res.data,
						rightUploaded: true,
						rightValue: base64Data
					});

					Toast.hide();
				} else {
					Toast.info(res.message);
					this.setState({ rightUploaded: false, rightValue: '' });
				}
			})
			.catch(() => {
				this.setState({
					disabledupload: 'false'
				});
				this.setState({ rightUploaded: false, rightValue: '' });
				Toast.hide();
			});
	};

	isValidate = () => {
		if (!this.state.leftUploaded) {
			return false;
		}
		if (!this.state.rightUploaded) {
			return false;
		}
		if (!validators.name(this.state.idName)) {
			return false;
		}
		if (!validators.iDCardNumber(this.state.idNo)) {
			return false;
		}
		return true;
	};

	handleSubmit = () => {
		const { leftUploaded, rightUploaded, idName, idNo, ocrZhengData = {}, ocrFanData = {} } = this.state;
		if (!leftUploaded) {
			Toast.info('请上传身份证正面');
			return false;
		}
		if (!rightUploaded) {
			Toast.info('请上传身份证反面');
			return false;
		}
		if (!idName) {
			Toast.info('请输入中文姓名');
			return false;
		}
		if (!validators.name(idName)) {
			Toast.info('请输入有效的中文姓名');
			return false;
		}
		if (!idNo) {
			Toast.info('请输入身份证号');
			return false;
		}
		if (!validators.iDCardNumber(idNo)) {
			Toast.info('请输入有效的身份证号');
			return false;
		}
		const osType = getDeviceType();
		const params = {
			idNo: base64Encode(idNo.toLocaleUpperCase()),
			idNoOld: base64Encode(ocrZhengData.idNo.toLocaleUpperCase()),
			userName: base64Encode(idName),
			userNameOld: base64Encode(ocrZhengData.idName),

			idCardFrontUrl: ocrZhengData.imgUrl, //正面URL
			idCardBackUrl: ocrFanData.imgUrl, //反面URL
			// handCardImgUrl: ocrData, //手持正面URL
			// idNo: idNo.toLocaleUpperCase(), // 证件号码
			// idNoOld: ocrZhengData.idNo && ocrZhengData.idNo.toLocaleUpperCase(), // 修改前证件号码
			// idName: idName, //证件姓名
			// usrNmOld: ocrZhengData.idName, //修改前证件姓名
			userGender: ocrZhengData.sex, //性别
			userNation: ocrZhengData.nation, //民族
			userBirthDate: ocrZhengData.birthday, //出生年月日
			issuAuth: ocrFanData.signOrg, //签发机关
			idEffDt: ocrFanData.signTime, //证件有效期起始日期
			idExpDt: ocrFanData.signEndTime, //证件有效期截止日期
			idAddr: ocrZhengData.address, //居住地址
			osType: osType, //操作系统类型
			idAddrLctn: '', //身份证户籍地经纬度
			usrBrowInfo: '' //授信浏览器信息
		};
		Toast.loading('加载中...', 10);
		this.props.$fetch
			.post(auth_idChk, params)
			.then((result) => {
				if (result && result.code === '000000') {
					Toast.hide();
					this.signup_refreshClientUserInfo();
					store.setBackFlag(true);
					buriedPointEvent(mine.creditExtensionBack, {
						current_step: '实名认证'
					});
					this.confirmBuryPoint(true);
					// TODO: 这里成功之后有两个地方去，一个是我的页面 一个是四项认证页。直接 goBack 应该能带上参数吧
					// 是否需要下一步
					if (this.props.nextStepStatus || (urlQuery && urlQuery.newTitle)) {
						getNextStatus({
							RouterType: 'real_name_page',
							$props: this.props
						});
					} else {
						this.props.history.goBack();
					}
				} else if (result.code === '000038') {
					Toast.hide();
					if (this.props.nextStepStatus) {
						getNextStatus({
							RouterType: 'real_name_page',
							$props: this.props
						});
					} else {
						this.props.history.goBack();
					}
					this.confirmBuryPoint(false, result.message);
				} else {
					this.confirmBuryPoint(false, result.message);
					Toast.info(result.message);
				}
			})
			.catch(() => {
				Toast.hide();
			});
	};
	/**
	 * @description: 刷新用户登录信息
	 * @param {type}
	 * @return:
	 */
	signup_refreshClientUserInfo = () => {
		this.props.$fetch.post(signup_refreshClientUserInfo, null, { hideToast: true }).then((res) => {
			if (res && res.code === '000000' && res.data) {
				this.props.setUserInfoAction(res.data);
			}
		});
	};
	cardMD = (type) => {
		if (type === 'z') {
			sxfburiedPointEvent(idCardFRiskBury.key);
		} else {
			sxfburiedPointEvent(idCardBRiskBury.key);
		}
	};
	handleBeforeCompress = () => {
		store.setDisableBack(true);
		this.setState(
			{
				disabledupload: 'true'
			},
			() => {
				Toast.loading('压缩图片中...', 0);
			}
		);
	};
	// 点击确定按钮埋点
	confirmBuryPoint = (isSucc, failInf) => {
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		// 是否是从我的里面进入
		const isFromMine = query.isShowCommit;
		buriedPointEvent(home.informationConfirm, {
			entry: !isFromMine || isFromMine === 'false' ? '我的' : '风控授信项',
			is_success: isSucc,
			fail_cause: failInf
		});
	};
	handleAfterCompress = (type) => {
		if (type === 'z') {
			sxfburiedPointEvent(idCardOutFRiskBury.key);
		} else {
			sxfburiedPointEvent(idCardOutBRiskBury.key);
		}
		store.removeDisableBack();
	};

	handleGoBack = () => {
		this.props.history.goBack();
	};

	render() {
		const { disabledupload, leftValue, rightValue } = this.state;
		return (
			<div className={[style.real_name_page, 'real_name_page_list'].join(' ')}>
				{this.state.showState &&
				(!this.state.userInfo || !this.state.userInfo.nameHid || urlQuery.newTitle) ? (
					<div>
						<FixedHelpCenter history={this.props.history} />

						<StepTitle
							title="上传身份证照片"
							titleSub="请上传身份证照片，仅用于公安网身份核实"
							stepNum="01"
						/>
						<div className={style.updateContent}>
							<div className={style.updateImgWrap}>
								<div
									className={style.updateImgLeft}
									onClick={() => {
										this.cardMD('z');
									}}
								>
									<FEZipImage
										disabledupload={disabledupload}
										style={{ width: '2.2rem', height: '2rem', borderRadius: '3px', margin: '0 auto' }}
										value={leftValue ? updateLeftSuccessPlaceHolder : updateLeftPlaceHolder}
										onChange={this.handleChangePositive}
										beforeCompress={this.handleBeforeCompress}
										afterCompress={() => {
											this.handleAfterCompress('z');
										}}
									/>
								</div>
								<div
									className={style.updateImgRight}
									onClick={() => {
										this.cardMD('f');
									}}
								>
									<FEZipImage
										disabledupload={disabledupload}
										style={{ width: '2.2rem', height: '2rem', borderRadius: '3px', margin: '0 auto' }}
										value={rightValue ? updateRightSuccessPlaceHolder : updateRightPlaceHolder}
										onChange={this.handleChangeSide}
										beforeCompress={this.handleBeforeCompress}
										afterCompress={() => {
											this.handleAfterCompress('f');
										}}
									/>
								</div>
							</div>

							<div className={style.updateImgTipWrap}>
								<img src={updateBottomTip} className={style.updateImgTip} />
							</div>
						</div>

						<p className={style.sectionTitle}>确认信息</p>

						<InputItem
							onChange={this.handleNameChange}
							placeholder="借款人本人姓名"
							value={this.state.idName}
							onFocus={() => {
								buriedPointEvent(home.informationTapNameInp);
							}}
							clear
							data-sxf-props={JSON.stringify({
								type: 'input',
								name: idNameRiskBury.key,
								actContain: idNameRiskBury.actContain
							})}
							onBlur={() => {
								handleInputBlur();
							}}
						>
							姓名
						</InputItem>
						<InputItem
							data-sxf-props={JSON.stringify({
								type: 'input',
								name: idNoRiskBury.key,
								actContain: idNoRiskBury.actContain
							})}
							clear
							onChange={this.handleNumberChange}
							placeholder="借款人身份证号"
							value={this.state.idNo}
							maxLength="18"
							onFocus={() => {
								buriedPointEvent(home.informationTapIDInp);
							}}
							onBlur={() => {
								handleInputBlur();
							}}
						>
							身份证号
						</InputItem>

						<div className={style.des}>
							<p className={style.desOne}>为保障您的借款资金安全与合法性，借款前需要进行身份认证</p>
							<p className={style.desOne}>身份信息一旦认证，不可修改</p>
						</div>
						<div className={style.bottomBtn}>
							<ButtonCustom
								onClick={this.handleSubmit}
								className={style.sureBtn}
								type={this.isValidate() ? 'yellow' : 'default'}
							>
								确定
							</ButtonCustom>
						</div>
					</div>
				) : null}
				{this.state.showState &&
				(this.state.userInfo && this.state.userInfo.nameHid && !urlQuery.newTitle) ? (
					<div>
						<p className={style.pageTitle}>您已完成实名认证！</p>
						<List className={style.is_true}>
							<InputItem value={this.state.userInfo && this.state.userInfo.nameHid} editable={false}>
								姓名
							</InputItem>
							<InputItem value={this.state.userInfo && this.state.userInfo.idNoHid} editable={false}>
								身份证号
							</InputItem>
						</List>
						<ButtonCustom className={style.bottomBtnSuccess} onClick={this.handleGoBack}>
							返回
						</ButtonCustom>
					</div>
				) : null}
			</div>
		);
	}
}
