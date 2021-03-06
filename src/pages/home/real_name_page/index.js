/*
 * @Author: shawn
 * @LastEditTime: 2020-04-29 16:37:06
 */
import React, { Component } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import { createForm } from 'rc-form';
import { InputItem, List, Toast, Modal } from 'antd-mobile';
import { connect } from 'react-redux';
import { setUserInfoAction } from 'reduxes/actions/staticActions';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import linkConf from 'config/link.conf';

import { domListen } from 'utils/domListen';
import { base64Encode } from 'utils/CommonUtil/toolUtil';
import { getNextStatus } from 'utils/CommonUtil/getNextStatus';
import { getDeviceType, validators, handleInputBlur } from 'utils';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { home, mine } from 'utils/analytinsType';
import {
	auth_ocrIdChk,
	auth_idChk,
	signup_refreshClientUserInfo,
	download_queryDownloadUrl
} from 'fetch/api';
import ButtonCustom from 'components/ButtonCustom';
import PopUp from 'components/PopUp';
import Dialog from 'components/Dialogs';
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
let obj = {};
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
		disabledupload: 'false',
		downloadUrl: ''
	};

	componentWillMount() {
		urlQuery = qs.parse(location.search, { ignoreQueryPrefix: true });
		let { userInfo } = this.props;
		if (urlQuery.newTitle) {
			// ???????????????????????????
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
		this.getDownloadUrl();
	}
	initDialog = (message) => {
		obj = new PopUp(
			(
				<Dialog
					open
					options={{ content: message, sureBtnText: '?????????', cancleBtnText: '??????' }}
					onRequestClose={(res) => {
						obj.close();
						if (res) {
							//
							this.downloadClick();
						}
					}}
				/>
			)
		);
		obj.show();
	};
	getDownloadUrl = () => {
		this.props.$fetch.get(`${download_queryDownloadUrl}/02`).then(
			(res) => {
				if (res.code === '000000') {
					this.setState({
						downloadUrl: res.data.downloadUrl
					});
				}
			},
			(error) => {
				error.message && this.props.toast.info(error.message);
			}
		);
	};
	handleNameChange = (value) => {
		this.setState({ idName: value });
	};
	handleNumberChange = (value) => {
		this.setState({ idNo: value });
	};

	// ?????????????????????
	handleChangePositive = ({ base64Data }) => {
		if (!base64Data) {
			Toast.hide();
			this.setState({
				disabledupload: 'false'
			});
		}
		if (!isEquipment) {
			Toast.info('?????????????????????');
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

		Toast.loading('?????????...', 10);
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
	// ?????????????????????
	handleChangeSide = ({ base64Data }) => {
		if (!base64Data) {
			Toast.hide();
			this.setState({
				disabledupload: 'false'
			});
		}
		if (!isEquipment) {
			Toast.info('?????????????????????');
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

		Toast.loading('?????????...', 10);
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
		if (!this.state.idName) {
			return false;
		}
		// if (!validators.name(this.state.idName)) {
		// 	return false;
		// }
		if (!validators.iDCardNumber(this.state.idNo)) {
			return false;
		}
		return true;
	};
	showHBAlert = () => {
		Modal.alert('', '12121', [
			{
				text: '',
				onPress: () => {}
			},
			{
				text: '?????????',
				onPress: () => {}
			}
		]);
	};
	handleSubmit = () => {
		const { leftUploaded, rightUploaded, idName, idNo, ocrZhengData = {}, ocrFanData = {} } = this.state;
		if (!leftUploaded) {
			Toast.info('????????????????????????');
			return false;
		}
		if (!rightUploaded) {
			Toast.info('????????????????????????');
			return false;
		}
		if (!idName) {
			Toast.info('?????????????????????');
			return false;
		}
		// if (!validators.name(idName)) {
		// 	Toast.info('??????????????????????????????');
		// 	return false;
		// }
		if (!idNo) {
			Toast.info('?????????????????????');
			return false;
		}
		if (!validators.iDCardNumber(idNo)) {
			Toast.info('??????????????????????????????');
			return false;
		}
		const osType = getDeviceType();
		const params = {
			idNo: base64Encode(idNo.trim().toLocaleUpperCase()),
			idNoOld: base64Encode(ocrZhengData.idNo.toLocaleUpperCase()),
			userName: base64Encode(idName.trim()),
			userNameOld: base64Encode(ocrZhengData.idName),

			idCardFrontUrl: ocrZhengData.imgUrl, //??????URL
			idCardBackUrl: ocrFanData.imgUrl, //??????URL
			// handCardImgUrl: ocrData, //????????????URL
			// idNo: idNo.toLocaleUpperCase(), // ????????????
			// idNoOld: ocrZhengData.idNo && ocrZhengData.idNo.toLocaleUpperCase(), // ?????????????????????
			// idName: idName, //????????????
			// usrNmOld: ocrZhengData.idName, //?????????????????????
			userGender: ocrZhengData.sex, //??????
			userNation: ocrZhengData.nation, //??????
			userBirthDate: ocrZhengData.birthday, //???????????????
			issuAuth: ocrFanData.signOrg, //????????????
			idEffDt: ocrFanData.signTime, //???????????????????????????
			idExpDt: ocrFanData.signEndTime, //???????????????????????????
			idAddr: ocrZhengData.address, //????????????
			osType: osType, //??????????????????
			idAddrLctn: '', //???????????????????????????
			usrBrowInfo: '' //?????????????????????
		};
		Toast.loading('?????????...', 10);
		this.props.$fetch
			.post(auth_idChk, params)
			.then((result) => {
				if (result && result.code === '000000') {
					Toast.hide();
					this.signup_refreshClientUserInfo();
					store.setBackFlag(true);
					buriedPointEvent(mine.creditExtensionBack, {
						current_step: '????????????'
					});
					this.confirmBuryPoint(true);
					// TODO: ???????????????????????????????????????????????????????????? ????????????????????????????????? goBack ????????????????????????
					// ?????????????????????
					if (this.props.nextStepStatus || (urlQuery && urlQuery.newTitle)) {
						getNextStatus({
							RouterType: 'real_name_page',
							$props: this.props,
							goBack: true
						});
					} else {
						this.props.history.goBack();
					}
				} else if (result.code === '000038') {
					Toast.hide();
					if (this.props.nextStepStatus) {
						getNextStatus({
							RouterType: 'real_name_page',
							$props: this.props,
							goBack: true
						});
					} else {
						this.props.history.goBack();
					}
					this.confirmBuryPoint(false, result.message);
				} else if (result.code === '000042') {
					Toast.hide();
					this.initDialog(result.message);
				} else {
					this.confirmBuryPoint(false, result.message);
					Toast.info(result.message);
				}
			})
			.catch(() => {
				Toast.hide();
			});
	};
	downloadClick = () => {
		const { downloadUrl } = this.state;
		const phoneType = getDeviceType();

		if (phoneType === 'IOS') {
			window.location.href = linkConf.APPSTORE_URL;
		} else {
			this.props.toast.info('???????????????');
			window.location.href = downloadUrl;
		}
	};
	/**
	 * @description: ????????????????????????
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
				Toast.loading('???????????????...', 0);
			}
		);
	};
	// ????????????????????????
	confirmBuryPoint = (isSucc, failInf) => {
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		// ??????????????????????????????
		const isFromMine = query.isShowCommit;
		buriedPointEvent(home.informationConfirm, {
			entry: !isFromMine || isFromMine === 'false' ? '??????' : '???????????????',
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

						<StepTitle title="?????????????????????" titleSub="???????????????????????????????????????????????????" stepNum="01" />
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

						<p className={style.sectionTitle}>????????????</p>

						<InputItem
							onChange={this.handleNameChange}
							placeholder="?????????????????????"
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
							??????
						</InputItem>
						<InputItem
							data-sxf-props={JSON.stringify({
								type: 'input',
								name: idNoRiskBury.key,
								actContain: idNoRiskBury.actContain
							})}
							clear
							onChange={this.handleNumberChange}
							placeholder="?????????????????????"
							value={this.state.idNo}
							maxLength="18"
							onFocus={() => {
								buriedPointEvent(home.informationTapIDInp);
							}}
							onBlur={() => {
								handleInputBlur();
							}}
						>
							????????????
						</InputItem>

						<div className={style.des}>
							<p className={style.desOne}>?????????????????????????????????????????????????????????????????????????????????</p>
							<p className={style.desOne}>???????????????????????????????????????</p>
						</div>
						<div className={style.bottomBtn}>
							<ButtonCustom
								onClick={this.handleSubmit}
								className={style.sureBtn}
								type={this.isValidate() ? 'yellow' : 'default'}
							>
								??????
							</ButtonCustom>
						</div>
					</div>
				) : null}
				{this.state.showState &&
				(this.state.userInfo && this.state.userInfo.nameHid && !urlQuery.newTitle) ? (
					<div>
						<p className={style.pageTitle}>???????????????????????????</p>
						<List className={style.is_true}>
							<InputItem value={this.state.userInfo && this.state.userInfo.nameHid} editable={false}>
								??????
							</InputItem>
							<InputItem value={this.state.userInfo && this.state.userInfo.idNoHid} editable={false}>
								????????????
							</InputItem>
						</List>
						<ButtonCustom className={style.bottomBtnSuccess} onClick={this.handleGoBack}>
							??????
						</ButtonCustom>
					</div>
				) : null}
			</div>
		);
	}
}
