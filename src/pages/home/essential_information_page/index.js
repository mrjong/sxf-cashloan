/*
 * @Author: shawn
 * @LastEditTime : 2020-02-14 17:27:01
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import { connect } from 'react-redux';
import { createForm } from 'rc-form';
import { InputItem, List, Modal, Toast } from 'antd-mobile';
import { base64Encode, base64Decode } from 'utils/CommonUtil/toolUtil';
import { getNextStatus } from 'utils/CommonUtil/getNextStatus';
import { getLngLat, getAddress } from 'utils/Address.js';
import { getFirstError, validators, handleInputBlur, recordContract } from 'utils';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { home, mine } from 'utils/analytinsType';
import { buryingPoints } from 'utils/buryPointMethods';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import { domListen } from 'utils/domListen';
import dayjs from 'dayjs';

import {
	FixedHelpCenter,
	AgreementModal,
	StepTitle,
	StepList,
	AddressSelect,
	AsyncCascadePicker,
	ButtonCustom,
	FixedTopTip
} from 'components';

import LimitTimeJoin from './components/LimitTimeJoin';
import style from './index.scss';
import informationMore from './img/back.png';

const pageKey = home.basicInfoBury;
let submitButtonLocked = false;

import {
	auth_queryUsrBasicInfo,
	msg_area,
	msg_relation,
	auth_personalData,
	index_queryPLPShowSts
} from 'fetch/api';

const reducedFilter = (data, keys, fn) => {
	return data.filter(fn).map((el) =>
		keys.reduce((acc, key) => {
			acc[key] = el[key];
			return acc;
		}, {})
	);
};

let urlQuery = '';
// let isFetching = false;
@fetch.inject()
@createForm()
@setBackGround('#fff')
@domListen()
@connect((state) => ({
	userInfo: state.staticState.userInfo,
	nextStepStatus: state.commonState.nextStepStatus,
	protocolPreviewInfo: state.staticState.protocolPreviewInfo
}))
export default class essential_information_page extends PureComponent {
	constructor(props) {
		super(props);
		urlQuery = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		this.state = {
			relatData: [], // 亲属联系人数据
			relatVisible: false, // 联系人是否显示
			relatValue: [], // 选中的联系人
			provValue: [], // 选中的省市区
			provLabel: [],
			showAgreement: false, // 显示协议弹窗
			millisecond: 0,
			selectFlag: false,
			addressList: [],
			relatValue2: [],
			ProvincesValue: ''
		};
	}

	componentWillMount() {
		// mpos中从授权页进入基本信息
		urlQuery && urlQuery.jumpToBase && store.setNeedNextUrl(true);
		if (store.getBackFlag()) {
			store.removeBackFlag(); // 清除返回的flag
		}
		if (store.getMoxieBackUrl()) {
			store.removeMoxieBackUrl();
			this.props.history.push(`/home/home`);
		}
		buryingPoints();
		this.initBasicInfo();
		// mpos中从授权页进入基本信息，判断是否显示协议
		urlQuery && urlQuery.jumpToBase && this.judgeShowAgree();
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
	readContract = (jumpUrl) => {
		const { selectFlag } = this.state;
		store.setCacheBaseInfo({ selectFlag });
		const { protocolPreviewInfo = {} } = this.props;
		const pageData = {
			name: protocolPreviewInfo.name,
			idNo: protocolPreviewInfo.idNo,
			dateTime: dayjs().format('YYYY年MM月DD日')
		};
		store.setProtocolPersonalData(pageData);
		this.props.history.push(jumpUrl);
	};
	selectProtocol = () => {
		this.setState({
			selectFlag: !this.state.selectFlag
		});
	};

	buttonDisabled = () => {
		const formData = this.props.form.getFieldsValue();
		const { ProvincesValue, selectFlag } = this.state;
		const { address, linkman, linkman2, linkphone, linkphone2, cntRelTyp1, cntRelTyp2 } = formData;
		if (
			ProvincesValue &&
			address &&
			cntRelTyp2 &&
			linkman &&
			linkphone2 &&
			cntRelTyp1 &&
			linkman2 &&
			linkphone &&
			selectFlag
		) {
			return true;
		}
		return false;
	};
	// 回显地址
	commonFunc = (res, { province, city, district, township }) => {
		const provCity = store.getProvCity() || [];
		const cacheData = store.getCacheBaseInfo();
		store.removeCacheBaseInfo();
		if (
			res &&
			res.data &&
			res.data.provCd &&
			res.data.cityCd &&
			res.data.districtCd &&
			res.data.streetCd &&
			(!cacheData || !store.getProvCity())
		) {
			this.getProCode(res.data.provCd, res.data.cityCd, res.data.districtCd, res.data.streetCd);
		} else if (
			res &&
			res.data &&
			res.data.provCd &&
			res.data.cityCd &&
			res.data.districtCd &&
			(!cacheData || !store.getProvCity())
		) {
			this.getProCode(res.data.provCd, res.data.cityCd, res.data.districtCd);
		} else if (
			res &&
			res.data &&
			res.data.provCd &&
			res.data.cityCd &&
			(!cacheData || !store.getProvCity())
		) {
			this.getProCode(res.data.provCd, res.data.cityCd);
		} else if (
			provCity &&
			provCity[0] &&
			provCity[0].key &&
			provCity[1] &&
			provCity[1].key &&
			provCity[2] &&
			provCity[2].key &&
			provCity[3] &&
			provCity[3].key
		) {
			this.getProCode(provCity[0].key, provCity[1].key, provCity[2].key, provCity[3].key);
		} else if (
			provCity &&
			provCity[0] &&
			provCity[0].key &&
			provCity[1] &&
			provCity[1].key &&
			provCity[2] &&
			provCity[2].key
		) {
			this.getProCode(provCity[0].key, provCity[1].key, provCity[2].key);
		} else if (provCity && provCity[0] && provCity[0].key && provCity[1] && provCity[1].key) {
			this.getProCode(provCity[0].key, provCity[1].key);
		} else if (province && city && district) {
			this.getProName(province, city, district);
		} else if (province && city && district && township) {
			this.getProName(province, city, district, township);
		} else if (province && city) {
			this.getProName(province, city);
		} else {
			console.log('没有获取到省市区');
		}
		// 阅读协议后缓存信息
		if (cacheData) {
			this.props.form.setFieldsValue({
				address: store.getAddress() || (res && res.data && res.data.usrDtlAddr) || '',
				linkman: store.getLinkman() || (res && res.data && res.data.cntUsrNm1) || '',
				linkphone: store.getLinkphone() || (res && res.data && res.data.cntUsrTel1) || '',
				linkman2: store.getLinkman2() || (res && res.data && res.data.cntUsrNm2) || '',
				linkphone2: store.getLinkphone2() || (res && res.data && res.data.cntUsrTel2) || ''
			});
		} else {
			this.props.form.setFieldsValue({
				address: (res && res.data && res.data.usrDtlAddr) || store.getAddress() || '',
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
	queryUsrBasicInfo = (province, city, district, township) => {
		this.props.$fetch.get(auth_queryUsrBasicInfo).then((res) => {
			if (res.code === '000000' && res && res.data) {
				this.commonFunc(res, { province, city, district, township });
			} else {
				this.commonFunc(null, { province, city, district, township });
			}
		});
	};

	// 初始化页面信息（反显）
	initBasicInfo = () => {
		//通过经纬度获取省市
		getAddress()
			.then((res) => {
				const { province, city, district, township } = res;
				this.queryUsrBasicInfo(province, city || province, district, township);
			})
			.catch(() => {
				this.queryUsrBasicInfo();
				console.log('经纬度获取省市报错了');
			});
	};
	// 获取城市标签反显(中文匹配),用于gps定位返回中文处理
	getProName = async (pro, city, area, township) => {
		let proPattern = new RegExp(`^[\\u4E00-\\u9FA5]*${pro}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
		let cityPattern = new RegExp(`^[\\u4E00-\\u9FA5]*${city}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
		let areaPattern = new RegExp(`^[\\u4E00-\\u9FA5]*${area}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
		let townshipPattern = new RegExp(`^[\\u4E00-\\u9FA5]*${township}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
		let result = await this.props.$fetch.get(`${msg_area}/0`);

		if (result && result.data) {
			let cityItem = [];
			let areaItem = [];
			let townshipItem = [];
			const provItem = reducedFilter(result.data.data, ['code', 'name'], (item) => {
				let proPattern2 = new RegExp(`^[\\u4E00-\\u9FA5]*${item.name}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
				if (proPattern.test(item.name) || proPattern2.test(pro)) {
					return item;
				}
			});
			if (provItem && provItem.length > 0) {
				let result2 = await this.props.$fetch.get(`${msg_area}/${provItem && provItem[0].code}`);
				cityItem = reducedFilter(result2.data.data, ['code', 'name'], (item2) => {
					let cityPattern2 = new RegExp(`^[\\u4E00-\\u9FA5]*${item2.name}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
					if (cityPattern.test(item2.name) || cityPattern2.test(city)) {
						return item2;
					}
				});
			}

			if (cityItem && cityItem.length > 0) {
				let result3 = await this.props.$fetch.get(`${msg_area}/${cityItem && cityItem[0].code}`);
				areaItem = reducedFilter(result3.data.data, ['code', 'name'], (item3) => {
					let areaPattern3 = new RegExp(`^[\\u4E00-\\u9FA5]*${item3.name}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
					if (areaPattern.test(item3.name) || areaPattern3.test(area)) {
						return item3;
					}
				});
			}

			if (areaItem && areaItem.length > 0) {
				let result4 = await this.props.$fetch.get(`${msg_area}/${areaItem && areaItem[0].code}`);
				townshipItem = reducedFilter(result4.data.data, ['code', 'name'], (item4) => {
					let townshipPattern4 = new RegExp(`^[\\u4E00-\\u9FA5]*${item4.name}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
					if (townshipPattern.test(item4.name) || townshipPattern4.test(area)) {
						return item4;
					}
				});
			}
			let addressList = [];
			/**
			 * @description: 省、市、区
			 * @param {type}
			 * @return: 省不存在，其他也没法回显，同上得出
			 */
			if (
				provItem &&
				provItem.length > 0 &&
				cityItem &&
				cityItem.length > 0 &&
				areaItem &&
				areaItem.length > 0 &&
				townshipItem &&
				townshipItem.length > 0
			) {
				addressList = [provItem[0], cityItem[0], areaItem[0], townshipItem[0]];
			} else if (
				provItem &&
				provItem.length > 0 &&
				cityItem &&
				cityItem.length > 0 &&
				areaItem &&
				areaItem.length > 0
			) {
				addressList = [provItem[0], cityItem[0], areaItem[0]];
			} else if (provItem && provItem.length > 0 && cityItem && cityItem.length > 0) {
				addressList = [provItem[0], cityItem[0]];
			} else if (provItem && provItem.length > 0) {
				addressList = [provItem[0]];
			} else {
				this.setState({
					ProvincesValue: ''
				});
			}
			this.setState({
				addressList
			});
		}
	};

	// 获取城市标签反显(code匹配)
	getProCode = async (pro, city, area, street) => {
		let result = await this.props.$fetch.get(`${msg_area}/0`);

		if (result && result.data) {
			let cityItem = [];
			let areaItem = [];
			let streetItem = [];

			const provItem = reducedFilter(result.data.data, ['code', 'name'], (item) => {
				if (item.code === pro) {
					return item;
				}
			});

			if (provItem && provItem.length > 0) {
				let result2 = await this.props.$fetch.get(`${msg_area}/${provItem && provItem[0].code}`);
				cityItem = reducedFilter(result2.data.data, ['code', 'name'], (item2) => {
					if (item2.code === city) {
						return item2;
					}
				});
			}

			if (cityItem && cityItem.length > 0) {
				let result3 = await this.props.$fetch.get(`${msg_area}/${cityItem && cityItem[0].code}`);
				areaItem = reducedFilter(result3.data.data, ['code', 'name'], (item3) => {
					if (item3.code === area) {
						return item3;
					}
				});
			}
			if (areaItem && areaItem.length > 0) {
				let result3 = await this.props.$fetch.get(`${msg_area}/${areaItem && areaItem[0].code}`);
				streetItem = reducedFilter(result3.data.data, ['code', 'name'], (item4) => {
					if (item4.code === street) {
						return item4;
					}
				});
			}

			let addressList = [];

			/**
			 * @description: 省、市、区
			 * @param {type}
			 * @return: 省不存在，其他也没法回显，同上得出
			 */
			if (
				provItem &&
				provItem.length > 0 &&
				cityItem &&
				cityItem.length > 0 &&
				areaItem &&
				areaItem.length > 0 &&
				streetItem &&
				streetItem.length > 0
			) {
				addressList = [provItem[0], cityItem[0], areaItem[0], streetItem[0]];
				let areaStr = '';
				addressList.forEach((element) => {
					areaStr += element.name + ',';
				});
				areaStr = areaStr.substring(0, areaStr.length - 1);
				this.setState({
					ProvincesValue: areaStr
				});
			} else if (
				provItem &&
				provItem.length > 0 &&
				cityItem &&
				cityItem.length > 0 &&
				areaItem &&
				areaItem.length > 0
			) {
				addressList = [provItem[0], cityItem[0], areaItem[0]];
				let areaStr = '';
				addressList.forEach((element) => {
					areaStr += element.value + ',';
				});
				areaStr = areaStr.substring(0, areaStr.length - 1);
				this.setState({
					ProvincesValue: areaStr
				});
			} else if (provItem && provItem.length > 0 && cityItem && cityItem.length > 0) {
				addressList = [provItem[0], cityItem[0]];
				let areaStr = '';
				addressList.forEach((element) => {
					areaStr += element.value + ',';
				});
				areaStr = areaStr.substring(0, areaStr.length - 1);

				this.setState({
					ProvincesValue: areaStr
				});
			} else if (provItem && provItem.length > 0) {
				addressList = [provItem[0]];
				let areaStr = '';
				addressList.forEach((element) => {
					areaStr += element.value + ',';
				});
				areaStr = areaStr.substring(0, areaStr.length - 1);
				this.setState({
					ProvincesValue: areaStr
				});
			} else {
				this.setState({
					ProvincesValue: ''
				});
			}
			this.setState({
				addressList
			});
		}
	};

	handleSubmit = () => {
		const { ProvincesValue, addressList, selectFlag } = this.state;
		if (!selectFlag) {
			Toast.info('请先阅读并勾选相关协议');
			return;
		}
		if (submitButtonLocked) return;
		submitButtonLocked = true;
		let cityNm = '';
		let provNm = '';
		let districtNm = '';
		let streetNm = '';
		if (ProvincesValue && ProvincesValue.length > 0) {
			let ProvincesList = ProvincesValue.split(',');
			if (ProvincesList[0]) {
				provNm = ProvincesList[0];
			}
			if (ProvincesList[1]) {
				cityNm = ProvincesList[1];
			}
			if (ProvincesList[2]) {
				districtNm = ProvincesList[2];
			}
			if (ProvincesList[3]) {
				streetNm = ProvincesList[3];
			}
		}

		let provCd = '';
		let cityCd = '';
		let districtCd = '';
		let streetCd = '';
		if (addressList && addressList.length > 0) {
			if (addressList[0]) {
				provCd = addressList[0].code;
			}
			if (addressList[1]) {
				cityCd = addressList[1].code;
			}
			if (addressList[2]) {
				districtCd = addressList[2].code;
			}

			if (addressList[3]) {
				streetCd = addressList[3].code;
			}
		}
		console.log(streetNm, streetCd, '909090909999999');
		if (!(streetNm && streetCd)) {
			submitButtonLocked = false;
			Toast.info('请选择完整的居住地址');
			return;
		}
		// 调基本信息接口
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = `${provNm}${cityNm}${districtNm}${values.address}`;
				getLngLat(data)
					.then((lngLat) => {
						submitButtonLocked = false;
						const params = {
							provNm,
							cityNm,
							districtNm,
							streetNm,
							provCd,
							cityCd,
							districtCd,
							streetCd,
							usrDtlAddr: values.address,
							usrDtlAddrLctn: lngLat,
							cntRelTyp1: values.cntRelTyp1[0],
							cntRelTyp2: values.cntRelTyp2[0],
							cntUsrNm1: base64Encode(values.linkman),
							cntMblNo1: base64Encode(values.linkphone),
							cntUsrNm2: base64Encode(values.linkman2),
							cntMblNo2: base64Encode(values.linkphone2),
							credCorpOrg: ''
						};
						if (values.linkphone === values.linkphone2) {
							Toast.info('联系人手机号重复，请重新填写');
							// isFetching = false;
							submitButtonLocked = false;
							return;
						}

						// isFetching = true;
						// values中存放的是经过 getFieldDecorator 包装的表单元素的值
						Toast.loading('加载中...', 10);
						this.props.$fetch
							.post(auth_personalData, params)
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
										getNextStatus({
											RouterType: 'essential_infomation_page',
											$props: this.props
										});
									}
								} else if (result.code === '000030') {
									if (this.props.nextStepStatus) {
										Toast.info('提交成功', 2);
										getNextStatus({
											RouterType: 'essential_infomation_page',
											$props: this.props
										});
									}
								} else {
									this.confirmBuryPoint(false, result.message);
									// isFetching = false;
									Toast.info(result.message);
								}
							})
							.catch(() => {
								submitButtonLocked = false;
							});
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
		buriedPointEvent(home.basicInfoComplete, {
			entry: !isFromMine || isFromMine === 'false' ? '我的' : '风控授信项',
			is_success: isSucc,
			fail_cause: failInf,
			comeFrom: query.entry // 是从确认授权页面、获取验证码页面，还是首页进入
		});
	};

	// 校验手机号
	validatePhone = (rule, value, callback) => {
		if (!validators.phone(value)) {
			callback('请输入正确的联系人手机号');
		} else {
			callback();
		}
	};
	// 校验姓名
	validateName = (rule, value, callback) => {
		if (!validators.name(value)) {
			callback('请输入正确的联系人的姓名');
		} else {
			callback();
		}
	};
	validateAddress = (rule, value, callback) => {
		if (value && value.length > 50) {
			callback('请输入正确的常住地址');
		} else {
			callback();
		}
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
	// 放弃本次机会
	quitSubmit = () => {
		this.props.history.goBack();
	};
	judgeShowAgree = () => {
		this.props.$fetch.post(index_queryPLPShowSts).then(async (res) => {
			if (res && res.code === '000000') {
				// agreementPopupFlag协议弹框是否显示，1为显示，0为隐藏
				this.setState({
					showAgreement: res.data.plpSts === '1'
				});
			} else {
				Toast.info(res.message);
			}
		});
	};

	sxfMD = (type) => {
		sxfburiedPointEvent(type);
	};

	onSelectArea = (area) => {
		let areaStr = '';
		area.forEach((element) => {
			areaStr += element.value + ',';
		});
		areaStr = areaStr.substring(0, areaStr.length - 1);
		store.setProvCity(area);
		this.selectClick({
			value: areaStr,
			label: 'resident_city'
		});
		this.setState({
			ProvincesValue: areaStr,
			addressList: area
		});
	};

	handleSetModal(value) {
		if (!value) {
			this.sxfMD('resident_cityOut');
		}
		this.setState({
			visible: value
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { showAgreement, selectFlag, addressList, visible, ProvincesValue } = this.state;
		const needNextUrl = store.getNeedNextUrl();
		return (
			<div className={[style.nameDiv, 'info_gb'].join(' ')}>
				<FixedTopTip />
				<div className={style.pageContent}>
					{urlQuery && urlQuery.jumpToBase ? <LimitTimeJoin /> : null}

					<FixedHelpCenter history={this.props.history} />

					<StepTitle title="完善个人信息" titleSub="请确保内容真实有效，有利于您的借款审核" stepNum="02" />

					<div className={[style.step_box_new, urlQuery.jumpToBase ? style.step_box_space : ''].join(' ')}>
						<div className={style.item_box}>
							<div className={style.titleTop}>居住地址</div>
							<div
								className={style.listRow}
								onClick={() => {
									this.sxfMD('DC_resident_city');
									this.setState({
										visible: true
									});
								}}
							>
								{ProvincesValue ? (
									<span className={style.active}>{ProvincesValue}</span>
								) : (
									'请选择您的现居住城市'
								)}
								<img className={style.informationMoreNew} src={informationMore} />
							</div>
							{getFieldDecorator('address', {
								rules: [{ required: true, message: '请输入常住地址' }, { validator: this.validateAddress }],
								onChange: (value) => {
									if (!value) {
										sxfburiedPointEvent('resident_address', {
											actId: 'delAll'
										});
									}
									// 本地缓存常住地址
									store.setAddress(value);
									this.setState({ address: value });
								}
							})(
								<InputItem
									clear
									data-sxf-props={JSON.stringify({
										type: 'input',
										name: 'resident_address',
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
									className="hasborder"
									placeholder="请输入您的现居住详细地址"
									type="text"
									onBlur={(v) => {
										this.inputOnBlur(v, 'resident_address');
									}}
									onFocus={(v) => {
										this.inputOnFocus(v, 'resident_address');
									}}
								></InputItem>
							)}
						</div>

						<div className={style.item_box}>
							<div className={style.titleTop}>
								<span className={style.titleTopNum}>1</span>紧急联系人
							</div>
							<div className={style.labelDiv}>
								{getFieldDecorator('cntRelTyp1', {
									initialValue: this.state.relatValue,
									rules: [{ required: true, message: '请选择联系人关系' }],
									onChange: (value) => {
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
												this.sxfMD('cntRelTyp1');
												this.selectClick({
													value: JSON.stringify(this.state.relatValue),
													label: 'clan_relation'
												});
											} else {
												this.sxfMD('cntRelTypOut1');
											}
										}}
									>
										<List.Item className="hasborder"></List.Item>
									</AsyncCascadePicker>
								)}
								<img className={style.informationMore} src={informationMore} />
							</div>
							{getFieldDecorator('linkman', {
								rules: [{ required: true, message: '请输入联系人姓名' }, { validator: this.validateName }],
								onChange: (value) => {
									if (!value) {
										sxfburiedPointEvent('contact_name_one', {
											actId: 'delAll'
										});
									}
									store.setLinkman(value);
									this.setState({ linkman: value });
								}
							})(
								<InputItem
									clear
									data-sxf-props={JSON.stringify({
										type: 'input',
										notSendValue: true, // 无需上报输入框的值
										name: 'contact_name_one',
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
									placeholder="联系人姓名"
									type="text"
									onBlur={(v) => {
										this.inputOnBlur(v, 'contact_name_one');
									}}
									onFocus={(v) => {
										this.inputOnFocus(v, 'contact_name_one');
									}}
								></InputItem>
							)}
							{getFieldDecorator('linkphone', {
								rules: [{ required: true, message: '请输入联系人手机号' }, { validator: this.validatePhone }],
								onChange: (value) => {
									if (!value) {
										sxfburiedPointEvent('linkphone', {
											actId: 'delAll'
										});
									}
									store.setLinkphone(value);
									this.setState({ linkphone: value });
								}
							})(
								<InputItem
									data-sxf-props={JSON.stringify({
										type: 'input',
										notSendValue: true, // 无需上报输入框的值
										name: 'linkphone',
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
									className="hasborder"
									type="number"
									maxLength="11"
									placeholder="联系人电话"
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
							<div className={style.labelDiv}>
								{getFieldDecorator('cntRelTyp2', {
									initialValue: this.state.relatValue2,
									rules: [{ required: true, message: '请选择联系人关系' }],
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
												this.sxfMD('cntRelTyp2');
												this.selectClick({
													value: JSON.stringify(this.state.relatValue2),
													label: 'clan_relation'
												});
											} else {
												this.sxfMD('cntRelTypOut2');
											}
										}}
									>
										<List.Item className="hasborder"></List.Item>
									</AsyncCascadePicker>
								)}
								<img className={style.informationMore} src={informationMore} />
							</div>
							{getFieldDecorator('linkman2', {
								rules: [{ required: true, message: '请输入联系人姓名' }, { validator: this.validateName }],
								onChange: (value) => {
									if (!value) {
										sxfburiedPointEvent('contact_name_two', {
											actId: 'delAll'
										});
									}
									store.setLinkman2(value);
									this.setState({ linkman2: value });
								}
							})(
								<InputItem
									data-sxf-props={JSON.stringify({
										type: 'input',
										notSendValue: true, // 无需上报输入框的值
										name: 'contact_name_two',
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
									placeholder="联系人姓名"
									type="text"
									onBlur={(v) => {
										this.inputOnBlur(v, 'contact_name_two');
									}}
									onFocus={(v) => {
										this.inputOnFocus(v, 'contact_name_two');
									}}
								></InputItem>
							)}
							{getFieldDecorator('linkphone2', {
								rules: [{ required: true, message: '请输入联系人手机号' }, { validator: this.validatePhone }],
								onChange: (value) => {
									if (!value) {
										sxfburiedPointEvent('linkphone2', {
											actId: 'delAll'
										});
									}
									store.setLinkphone2(value);
									this.setState({ linkphone2: value });
								}
							})(
								<InputItem
									data-sxf-props={JSON.stringify({
										type: 'input',
										notSendValue: true, // 无需上报输入框的值
										name: 'linkphone2',
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
									className="hasborder"
									type="number"
									maxLength="11"
									placeholder="联系人电话"
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

					<StepList
						style={{ marginTop: '20px' }}
						stepList={[{ title: '填写基本信息', stepNum: '03' }, { title: '认证信用卡', stepNum: '04' }]}
					></StepList>

					<div className={style.protocolBox} onClick={this.selectProtocol}>
						<i className={selectFlag ? style.selectStyle : `${style.selectStyle} ${style.unselectStyle}`} />
						点击按钮即视为同意
						<em
							onClick={(e) => {
								e.stopPropagation();
								this.readContract('/protocol/personal_auth_page');
							}}
							className={style.link}
						>
							《个人信息授权书》
						</em>
						<em
							onClick={(e) => {
								e.stopPropagation();
								this.readContract('/protocol/user_privacy_page');
							}}
							className={style.link}
						>
							《用户隐私权政策》
						</em>
					</div>
				</div>

				<div className={style.sureBtnWrap}>
					<ButtonCustom onClick={this.handleSubmit} type={this.buttonDisabled() ? 'yellow' : 'default'}>
						{needNextUrl ? '下一步' : '完成'}
					</ButtonCustom>
					{urlQuery.jumpToBase ? (
						<div className={style.quitText} onClick={this.quitSubmit}>
							放弃本次机会
						</div>
					) : null}
				</div>

				<Modal
					onClose={() => {
						this.handleSetModal(false);
					}}
					closable={true}
					className="cashier_modal_info"
					wrapClassName="cashier_modal_info"
					visible={visible}
					animationType="slide-up"
					popup
				>
					<AddressSelect
						level={4}
						value={addressList}
						commitFun={(area) => this.onSelectArea(area)}
						dissmissFun={() => this.handleSetModal(false)}
					/>
				</Modal>
				<Modal visible={showAgreement} transparent wrapClassName="agreement_modal_warp" maskClosable={false}>
					<AgreementModal
						visible={showAgreement}
						handleClick={() => {
							this.closeWelfareModal();
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
