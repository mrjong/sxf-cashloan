/*
 * @Author: shawn
 * @LastEditTime: 2019-09-03 15:02:15
 */
import React, { Component } from 'react';
import Cookie from 'js-cookie';
import { createForm } from 'rc-form';
import updateLeft from 'assets/images/real_name/left.png';
import updateRight from 'assets/images/real_name/right.png';
import updateBottomTip from 'assets/images/real_name/bottom_tip.png';
import FEZipImage from 'components/FEZIpImage';
import { InputItem, List } from 'antd-mobile';
import { setBackGround } from 'utils/background';
import ButtonCustom from 'components/ButtonCustom';
import style from './index.scss';
import fetch from 'sx-fetch';
import { sxfhome } from 'utils/sxfAnalytinsType';
import { store } from 'utils/store';
import { domListen } from 'utils/domListen';
import {
	getDeviceType,
	validators,
	handleInputBlur,
	getNextStr,
	handleClickConfirm,
	idChkPhoto
} from 'utils';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { home, mine } from 'utils/analytinsType';
import qs from 'qs';

const isEquipment = window.navigator.userAgent.match(
	/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
);
const API = {
	getImgUrl: '/auth/ocrIdChk',
	submitName: '/auth/idChk'
};

let urlQuery = '';
@fetch.inject()
@createForm()
@setBackGround('#fff')
@domListen()
export default class real_name_page extends Component {
	state = {
		idName: '',
		idNo: '',
		ocrZhengData: {},
		ocrFanData: {},
		leftValue: updateLeft,
		updateLeftValue: '',
		rightValue: updateRight,
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
		let userInfo = store.getUserInfo();
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
		if (!value) {
			sxfburiedPointEvent('idName', {
				actId: 'delAll'
			});
		}
		this.setState({ idName: value });
	};
	handleNumberChange = (value) => {
		if (!value) {
			sxfburiedPointEvent('idNo', {
				actId: 'delAll'
			});
		}
		this.setState({ idNo: value });
	};

	// 上传身份证正面
	handleChangePositive = ({ base64Data }) => {
		if (!base64Data) {
			this.props.SXFToast.hide();
			this.setState({
				disabledupload: 'false'
			});
		}
		if (!isEquipment) {
			this.props.toast.info('请使用手机设备');
			return;
		}
		this.setState({ showFloat: true });
		buriedPointEvent(home.informationMyselfFrontCard);
		this.setState({ leftValue: base64Data });
		const params = {
			imageBase64: this.state.leftValue, //身份证正面图片信息
			ocrType: '2'
		};
		this.props.$fetch
			.post(`${API.getImgUrl}`, params, { timeout: 30000 })
			.then((result) => {
				this.props.SXFToast.hide();
				this.setState({
					disabledupload: 'false'
				});
				if (result.msgCode === 'PTM0000') {
					this.setState({ ocrZhengData: result.data });
					this.setState({ idName: result.data.idName || '' });
					this.setState({ idNo: result.data.idNo || '' });
					this.setState({ showFloat: false });
					this.setState({ leftUploaded: true });
				} else {
					this.props.toast.info(result.msgInfo);
					this.setState({ leftUploaded: false, leftValue: updateLeft, showFloat: false });
				}
			})
			.catch(() => {
				this.props.SXFToast.hide();
				this.setState({
					disabledupload: 'false'
				});
				this.setState({ leftUploaded: false, leftValue: updateLeft, showFloat: false });
			});
	};
	// 上传身份证反面
	handleChangeSide = ({ base64Data }) => {
		if (!base64Data) {
			this.props.SXFToast.hide();
			this.setState({
				disabledupload: 'false'
			});
		}
		if (!isEquipment) {
			this.props.toast.info('请使用手机设备');
			return;
		}
		this.setState({ showFloat: true });
		buriedPointEvent(home.informationMyselfBackCard);
		this.setState({ rightValue: base64Data });
		const params1 = {
			imageBase64: this.state.rightValue, //身份证反面图片信息
			ocrType: '3'
		};
		this.props.$fetch
			.post(`${API.getImgUrl}`, params1, { timeout: 30000 })
			.then((res) => {
				this.props.SXFToast.hide();
				this.setState({
					disabledupload: 'false'
				});
				if (res.msgCode === 'PTM0000') {
					this.setState({ ocrFanData: res.data });
					this.setState({ rightUploaded: true });
					this.setState({ showFloat: false });
				} else {
					this.props.toast.info(res.msgInfo);
					this.setState({ rightUploaded: false, rightValue: updateRight, showFloat: false });
				}
			})
			.catch(() => {
				this.props.SXFToast.hide();
				this.setState({
					disabledupload: 'false'
				});
				this.setState({ rightUploaded: false, rightValue: updateRight, showFloat: false });
			});
	};

	handleSubmit = () => {
		if (!this.state.leftUploaded) {
			this.props.toast.info('请上传身份证正面');
			return false;
		}
		if (!this.state.rightUploaded) {
			this.props.toast.info('请上传身份证反面');
			return false;
		}
		if (!validators.name(this.state.idName)) {
			this.props.toast.info('请输入正确的姓名');
			return false;
		}
		if (!validators.iDCardNumber(this.state.idNo)) {
			this.props.toast.info('请输入正确的身份证号');
			return false;
		}
		const { ocrZhengData = {}, ocrFanData = {}, idName, idNo } = this.state;
		const osType = getDeviceType();
		const params = {
			idCardFrontUrl: ocrZhengData.imgUrl, //正面URL
			idCardBackUrl: ocrFanData.imgUrl, //反面URL
			// handCardImgUrl: ocrData, //手持正面URL
			idNo: idNo.toLocaleUpperCase(), // 证件号码
			idNoOld: ocrZhengData.idNo && ocrZhengData.idNo.toLocaleUpperCase(), // 修改前证件号码
			usrNm: idName, //证件姓名
			usrNmOld: ocrZhengData.idName, //修改前证件姓名
			usrGender: ocrZhengData.sex, //性别
			usrNation: ocrZhengData.nation, //民族
			usrBirthDt: ocrZhengData.birthday, //出生年月日
			issuAuth: ocrFanData.signOrg, //签发机关
			idEffDt: ocrFanData.signTime, //证件有效期起始日期
			idExpDt: ocrFanData.signEndTime, //证件有效期截止日期
			idAddr: ocrZhengData.address, //居住地址
			osType: osType, //操作系统类型
			idAddrLctn: '', //身份证户籍地经纬度
			usrBrowInfo: '' //授信浏览器信息
		};
		this.props.$fetch.post(`${API.submitName}`, params).then((result) => {
			if (result && result.msgCode === 'PTM0000') {
				store.setBackFlag(true);
				buriedPointEvent(mine.creditExtensionBack, {
					current_step: '实名认证'
				});
				this.confirmBuryPoint(true);
				// store.removeAuthFlag();
				Cookie.remove('authFlag');
				// TODO: 这里成功之后有两个地方去，一个是我的页面 一个是四项认证页。直接 goBack 应该能带上参数吧
				// 是否需要下一步
				if (urlQuery.newTitle) {
					// 需要补身份证的
					this.nextFunc();
				} else if (store.getNeedNextUrl()) {
					// 首页正常流程走实名认证的
					this.props.SXFToast.loading('数据加载中...', 0);
					this.nextFunc(() => {
						getNextStr({
							$props: this.props
						});
					});
				} else {
					// 我的页面
					this.nextFunc(() => {
						this.props.history.goBack();
					});
					// this.props.history.goBack();
				}
			} else if (result.msgCode === 'URM5016' && !urlQuery.newTitle) {
				this.nextFunc(() => {
					if (store.getNeedNextUrl()) {
						this.props.SXFToast.loading('数据加载中...', 0);
						getNextStr({
							$props: this.props
						});
					}
				});
			} else if (result.msgCode === 'URM5016' && urlQuery.newTitle) {
				store.setBackFlag(true);
				this.nextFunc();
			} else {
				this.confirmBuryPoint(false, result.msgInfo);
				this.props.toast.info(result.msgInfo);
			}
		});
	};
	nextFunc = (callBack) => {
		// 新用户
		switch (urlQuery.type) {
			// 新用户授信来的
			case 'noRealName':
				idChkPhoto({
					$props: this.props,
					type: 'noRealName',
					msg: '审核'
				}).then((res) => {
					switch (res) {
						case '1':
							callBack && callBack();
							break;
						case '3':
							if (urlQuery.fromRouter === 'home') {
								store.setRealNameNextStep('home');
								store.setTencentBackUrl('/home/home');
							} else {
								store.setRealNameNextStep('other');
								store.setTencentBackUrl('/mine/mine_page');
							}
							// store.setIdChkPhotoBack(-3); //从人脸中间页回退3层到此页面
							// store.setChkPhotoBackNew(-2); //活体直接返回
							break;
						default:
							break;
					}
				});
				break;
			// 新用户授信来的
			case 'creditExtension':
				idChkPhoto({
					$props: this.props,
					type: 'creditExtension',
					msg: '审核'
				}).then((res) => {
					switch (res) {
						case '1':
							this.props.toast.info('实名照片补充成功!');
							store.removeToggleMoxieCard();
							setTimeout(() => {
								handleClickConfirm(this.props, {
									...store.getLoanAspirationHome()
								});
							}, 2000);
							break;
						case '3':
							store.setTencentBackUrl('/home/loan_repay_confirm_page');
							// store.setIdChkPhotoBack(-3); //从人脸中间页回退3层到此页面
							// store.setChkPhotoBackNew(-2); //活体直接返回
							break;
						default:
							break;
					}
				});
				break;
			// case 'historyCreditExtension':
			// 	store.removeToggleMoxieCard();

			// 	// 实名之后
			// 	idChkPhoto({
			// 		$props: this.props,
			// 		type: 'historyCreditExtension',
			// 		msg: '认证'
			// 	}).then((res) => {
			// 		switch (res) {
			// 			case '1':
			// 				this.props.toast.info('实名照片补充成功!');
			// 				store.removeToggleMoxieCard();
			// 				setTimeout(() => {
			// 					getNextStr({
			// 						$props: this.props
			// 					});
			// 				}, 2000);
			// 				break;
			// 			case '3':
			// 				store.setIdChkPhotoBack(-3); //从人脸中间页回退3层到此页面
			// 				store.setChkPhotoBackNew(-2); //活体直接返回
			// 				break;
			// 			default:
			// 				break;
			// 		}
			// 	});
			// 	break;
			case 'agency_page':
				idChkPhoto({
					$props: this.props,
					type: 'agency_page',
					msg: '放款'
				}).then((res) => {
					switch (res) {
						case '1':
							this.props.toast.info('实名照片补充成功!');
							store.removeToggleMoxieCard();
							setTimeout(() => {
								history.go(-2);
							}, 3000);
							break;
						case '3':
							store.setTencentBackUrl('/home/confirm_agency');
							// store.setIdChkPhotoBack(-3); //从人脸中间页回退3层到此页面
							// store.setChkPhotoBackNew(-2); //活体直接返回
							break;
						default:
							break;
					}
				});
				break;
			default:
				break;
		}
	};
	cardMD = (type) => {
		if (type === 'z') {
			sxfburiedPointEvent(sxfhome.idCardF);
		} else {
			sxfburiedPointEvent(sxfhome.idCardB);
		}
	};
	handleBeforeCompress = () => {
		store.setDisableBack(true);
		this.setState(
			{
				disabledupload: 'true'
			},
			() => {
				this.props.SXFToast.loading('压缩图片中...', 0);
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
			sxfburiedPointEvent(sxfhome.idCardOutF);
		} else {
			sxfburiedPointEvent(sxfhome.idCardOutB);
		}
		store.removeDisableBack();
	};
	render() {
		const { disabledupload } = this.state;
		return (
			<div className={[style.real_name_page, 'real_name_page_list'].join(' ')}>
				{this.state.showState &&
				(!this.state.userInfo || !this.state.userInfo.nameHid || urlQuery.newTitle) ? (
					<div>
						<div className={style.updateTitle}>
							<span>上传身份证正 、反面</span>
						</div>
						<div className={style.updateContent}>
							<div
								className={style.updateImgLeft}
								onClick={() => {
									this.cardMD('z');
								}}
							>
								<FEZipImage
									disabledupload={disabledupload}
									style={{ width: '3.26rem', height: '2rem', borderRadius: '3px', margin: '0 auto' }}
									value={this.state.leftValue}
									onChange={this.handleChangePositive}
									beforeCompress={this.handleBeforeCompress}
									afterCompress={() => {
										this.handleAfterCompress('z');
									}}
								/>
								<p>拍摄身份证正面</p>
							</div>
							<div
								className={style.updateImgRight}
								onClick={() => {
									this.cardMD('f');
								}}
							>
								<FEZipImage
									disabledupload={disabledupload}
									style={{ width: '3.26rem', height: '2rem', borderRadius: '3px', margin: '0 auto' }}
									value={this.state.rightValue}
									onChange={this.handleChangeSide}
									beforeCompress={this.handleBeforeCompress}
									afterCompress={() => {
										this.handleAfterCompress('f');
									}}
								/>
								<p>拍摄身份证反面</p>
							</div>
							<img src={updateBottomTip} style={{ width: '100%', marginTop: '.3rem' }} />
						</div>

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
								notSendValue: true, // 无需上报输入框的值
								name: 'idName',
								eventList: [
									{
										type: 'focus'
									},
									{
										type: 'delete'
									},
									{
										type: 'blur'
									},
									{
										type: 'paste'
									}
								]
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
								notSendValue: true, // 无需上报输入框的值
								name: 'idNo',
								eventList: [
									{
										type: 'focus'
									},
									{
										type: 'delete'
									},
									{
										type: 'blur'
									},
									{
										type: 'paste'
									}
								]
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
							<p className={style.desOne}>*为保障您的借款资金安全与合法性，借款前需要进行身份认证</p>
							<p className={style.desOne}>*身份信息一旦认证，不可修改</p>
						</div>
						<ButtonCustom onClick={this.handleSubmit} className={style.sureBtn}>
							确定
						</ButtonCustom>
						<p className="bottomTip">怕逾期，用还到</p>
					</div>
				) : null}
				{this.state.showState &&
				(this.state.userInfo && this.state.userInfo.nameHid && !urlQuery.newTitle) ? (
					<div>
						<List className={style.is_true}>
							<InputItem value={this.state.userInfo && this.state.userInfo.name} editable={false}>
								姓名
							</InputItem>
							<InputItem value={this.state.userInfo && this.state.userInfo.idNoHid} editable={false}>
								身份证号
							</InputItem>
						</List>
					</div>
				) : null}
			</div>
		);
	}
}
