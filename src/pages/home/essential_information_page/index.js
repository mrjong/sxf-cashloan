/*
 * @Author: shawn
 * @LastEditTime: 2019-12-04 16:02:34
 */
import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { InputItem, List, Modal } from 'antd-mobile';
import informationMore from './img/back.png';
import AsyncCascadePicker from 'components/AsyncCascadePicker';
import ButtonCustom from 'components/ButtonCustom';
import fetch from 'sx-fetch';
import { getLngLat, getAddress } from 'utils/Address.js';
import style from './index.scss';
import { getFirstError, validators, handleInputBlur, getNextStr } from 'utils';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { home, mine } from 'utils/analytinsType';
import { buryingPoints } from 'utils/buryPointMethods';
import qs from 'qs';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import ClockS from 'components/TimeDown/ClockS';
import adsBg from './img/base_top_img.png';
import AgreementModal from 'components/AgreementModal';
import { domListen } from 'utils/domListen';
import { sxfhome } from 'utils/sxfAnalytinsType';
import AddressSelect from 'components/react-picker-address';

let timedown = null;
const pageKey = home.basicInfoBury;
let submitButtonLocked = false;
const API = {
	getProv: '/rcm/qryProv',
	getRelat: '/rcm/qryRelat',
	submitData: '/auth/personalData',
	qryCity: '/rcm/qryCity',
	queryUsrBasicInfo: '/auth/queryUsrBasicInfo',
	procedure_user_sts: '/procedure/user/sts', // 判断是否提交授信
	readAgreement: '/index/saveAgreementViewRecord', // 上报我已阅读协议
	contractInfo: '/bill/personalDataAuthInfo', // 个人信息授权书数据查询
	rcm_qryArea: '/rcm/qryArea' // 获取地理位置
};

const reducedFilter = (data, keys, fn) =>
	data.filter(fn).map((el) =>
		keys.reduce((acc, key) => {
			acc[key] = el[key];
			return acc;
		}, {})
	);

let urlQuery = '';
// let isFetching = false;
@fetch.inject()
@createForm()
@setBackGround('#F7F8FA')
@domListen()
export default class essential_information_page extends PureComponent {
	constructor(props) {
		super(props);
		urlQuery = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		this.state = {
			count: 0,
			status: 'stopped',
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
		urlQuery && urlQuery.jumpToBase && this.handleSetCountDown(60 * 60);
		this.getMillisecond();
		// 安卓键盘抬起会触发resize事件，ios则不会
		window.addEventListener('resize', function() {
			if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
				window.setTimeout(function() {
					document.activeElement.scrollIntoViewIfNeeded();
				}, 0);
			}
		});
	}
	componentDidUpdate(prevProps, prevState) {
		if (this.state.status !== prevState.status) {
			switch (this.state.status) {
				case 'started':
					this.startTimer();
					break;
				case 'stopped':
					this.setState({
						count: 0
					});
					break;
				case 'paused':
					clearInterval(this.timer);
					this.timer = null;
					break;
			}
		}
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
		clearInterval(timedown);
		clearInterval(this.timer);
		this.timer = null;
	}
	// 跳转个人信息授权书
	readContract = () => {
		this.props.$fetch.get(API.contractInfo).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				store.setProtocolPersonalData(result.data);
				this.props.history.push('/protocol/personal_auth_page');
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};
	selectProtocol = () => {
		this.setState({
			selectFlag: !this.state.selectFlag
		});
	};
	getMillisecond = () => {
		setTimeout(() => {
			timedown = setInterval(() => {
				if (Number(this.state.millisecond) > 8) {
					this.setState({
						millisecond: 0
					});
				} else {
					this.setState({
						millisecond: this.state.millisecond + 1
					});
				}
			}, 100);
		}, 0);
	};

	buttonDisabled = () => {
		const formData = this.props.form.getFieldsValue();
		const { ProvincesValue } = this.state;
		const { address, linkman, linkman2, linkphone, linkphone2, cntRelTyp1, cntRelTyp2 } = formData;
		if (
			ProvincesValue &&
			address &&
			cntRelTyp2 &&
			linkman &&
			linkphone2 &&
			cntRelTyp1 &&
			linkman2 &&
			linkphone
		) {
			return true;
		}
		return false;
	};
	// 回显地址
	commonFunc = (res, { province, city, district, township }) => {
		console.log(province, city, district, township);
		const provCity = store.getProvCity() || [];
		if (res && res.data && res.data.provCd && res.data.cityCd && res.data.districtCd && res.data.streetCd) {
			this.getProCode(res.data.provCd, res.data.cityCd, res.data.districtCd, res.data.streetCd);
		} else if (res && res.data && res.data.provCd && res.data.cityCd && res.data.districtCd) {
			this.getProCode(res.data.provCd, res.data.cityCd, res.data.districtCd);
		} else if (res && res.data && res.data.provCd && res.data.cityCd) {
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
		this.props.form.setFieldsValue({
			address: (res && res.data && res.data.usrDtlAddr) || store.getAddress() || '',
			linkman: (res && res.data && res.data.cntUsrNm1) || store.getLinkman() || '',
			linkphone: store.getLinkphone() || '',
			linkman2: (res && res.data && res.data.cntUsrNm2) || store.getLinkman2() || '',
			linkphone2: store.getLinkphone2() || ''
		});
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
					: []
		});
	};

	//获取基本信息
	queryUsrBasicInfo = (province, city, district, township) => {
		this.props.$fetch.post(API.queryUsrBasicInfo).then((res) => {
			if (res.msgCode === 'PTM0000' && res && res.data) {
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
		let result = await this.props.$fetch.get(`${API.rcm_qryArea}/0`);

		if (result && result.data) {
			let cityItem = [];
			let areaItem = [];
			let townshipItem = [];
			const provItem = reducedFilter(result.data, ['key', 'value'], (item) => {
				let proPattern2 = new RegExp(`^[\\u4E00-\\u9FA5]*${item.value}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
				if (proPattern.test(item.value) || proPattern2.test(pro)) {
					return item;
				}
			});
			if (provItem && provItem.length > 0) {
				let result2 = await this.props.$fetch.get(`${API.rcm_qryArea}/${provItem && provItem[0].key}`);
				cityItem = reducedFilter(result2.data, ['key', 'value'], (item2) => {
					let cityPattern2 = new RegExp(`^[\\u4E00-\\u9FA5]*${item2.value}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
					if (cityPattern.test(item2.value) || cityPattern2.test(city)) {
						return item2;
					}
				});
			}

			if (cityItem && cityItem.length > 0) {
				let result3 = await this.props.$fetch.get(`${API.rcm_qryArea}/${cityItem && cityItem[0].key}`);
				areaItem = reducedFilter(result3.data, ['key', 'value'], (item3) => {
					let areaPattern3 = new RegExp(`^[\\u4E00-\\u9FA5]*${item3.value}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
					if (areaPattern.test(item3.value) || areaPattern3.test(area)) {
						return item3;
					}
				});
			}

			if (areaItem && areaItem.length > 0) {
				let result4 = await this.props.$fetch.get(`${API.rcm_qryArea}/${areaItem && areaItem[0].key}`);
				townshipItem = reducedFilter(result4.data, ['key', 'value'], (item4) => {
					let townshipPattern4 = new RegExp(`^[\\u4E00-\\u9FA5]*${item4.value}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
					if (townshipPattern.test(item4.value) || townshipPattern4.test(area)) {
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
		let result = await this.props.$fetch.get(`${API.rcm_qryArea}/0`);

		if (result && result.data) {
			let cityItem = [];
			let areaItem = [];
			let streetItem = [];

			const provItem = reducedFilter(result.data, ['key', 'value'], (item) => {
				if (item.key === pro) {
					return item;
				}
			});
			if (provItem && provItem.length > 0) {
				let result2 = await this.props.$fetch.get(`${API.rcm_qryArea}/${provItem && provItem[0].key}`);
				cityItem = reducedFilter(result2.data, ['key', 'value'], (item2) => {
					if (item2.key === city) {
						return item2;
					}
				});
			}

			if (cityItem && cityItem.length > 0) {
				let result3 = await this.props.$fetch.get(`${API.rcm_qryArea}/${cityItem && cityItem[0].key}`);
				areaItem = reducedFilter(result3.data, ['key', 'value'], (item3) => {
					if (item3.key === area) {
						return item3;
					}
				});
			}
			if (areaItem && areaItem.length > 0) {
				let result3 = await this.props.$fetch.get(`${API.rcm_qryArea}/${areaItem && areaItem[0].key}`);
				streetItem = reducedFilter(result3.data, ['key', 'value'], (item4) => {
					if (item4.key === street) {
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
					areaStr += element.value + ',';
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
			this.props.toast.info('请先勾选个人信息授权书');
			return;
		}
		if (submitButtonLocked) return;
		submitButtonLocked = true;
		let timer = setTimeout(() => {
			submitButtonLocked = false;
			clearTimeout(timer);
		}, 3000);
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
				provCd = addressList[0].key;
			}
			if (addressList[1]) {
				cityCd = addressList[1].key;
			}
			if (addressList[2]) {
				districtCd = addressList[2].key;
			}

			if (addressList[3]) {
				streetCd = addressList[3].key;
			}
		}
		if (!(streetNm && streetCd)) {
			submitButtonLocked = false;
			this.props.toast.info('请选择完整的居住地址');
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
							cntUsrNm1: values.linkman,
							cntMblNo1: values.linkphone,
							cntUsrNm2: values.linkman2,
							cntMblNo2: values.linkphone2,
							credCorpOrg: ''
						};
						if (values.linkphone === values.linkphone2) {
							this.props.toast.info('联系人手机号重复，请重新填写');
							// isFetching = false;
							submitButtonLocked = false;
							return;
						}

						// isFetching = true;
						// values中存放的是经过 getFieldDecorator 包装的表单元素的值
						this.props.$fetch
							.post(`${API.submitData}`, params)
							.then((result) => {
								submitButtonLocked = false;
								if (result && result.msgCode === 'PTM0000') {
									store.setBackFlag(true);
									// 埋点-基本信息页-确定按钮
									this.confirmBuryPoint(true);
									buriedPointEvent(mine.creditExtensionBack, {
										current_step: '基本信息认证'
									});
									if (store.getNeedNextUrl()) {
										this.props.toast.info('提交成功', 2);
										setTimeout(() => {
											getNextStr({
												$props: this.props
											});
										}, 2000);
										store.setMoxieBackUrl('/home/home');
									} else {
										// this.props.history.replace({
										// 	pathname: '/mine/credit_extension_page',
										// 	search: urlQuery
										// });
									}
								} else if (result.msgCode === 'PCC-PRC-9994') {
									if (store.getNeedNextUrl()) {
										this.props.toast.info('提交成功', 2);
										setTimeout(() => {
											getNextStr({
												$props: this.props
											});
										}, 2000);
										store.setMoxieBackUrl('/home/home');
									}
								} else {
									this.confirmBuryPoint(false, result.msgInfo);
									// isFetching = false;
									this.props.toast.info(result.msgInfo);
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
				this.props.toast.info(getFirstError(err));
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

	// 关闭注册协议弹窗
	readAgreementCb = () => {
		this.props.$fetch.post(`${API.readAgreement}`).then((res) => {
			if (res && res.msgCode === 'PTM0000') {
				this.setState({
					showAgreement: false
				});
			}
		});
	};

	judgeShowAgree = () => {
		this.props.$fetch.post(API.procedure_user_sts).then(async (res) => {
			if (res && res.msgCode === 'PTM0000') {
				// agreementPopupFlag协议弹框是否显示，1为显示，0为隐藏
				this.setState({
					showAgreement: res.data.agreementPopupFlag === '1'
				});
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	handleStatusChange = (newStaus) => {
		this.setState({
			status: newStaus
		});
	};

	startTimer() {
		this.timer = setInterval(() => {
			const newCount = this.state.count - 1;
			this.setState({
				count: newCount >= 0 ? newCount : 0
			});
			if (newCount === 0) {
				this.setState({
					status: 'stopped'
				});
			}
		}, 1000);
	}
	handleSetCountDown = (totalSeconds) => {
		this.setState({
			count: totalSeconds,
			status: 'started'
		});
	};
	sxfMD = (type) => {
		sxfburiedPointEvent(sxfhome[type]);
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
		// sxfBuriedEvent('resident_cityOut');
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
				<Modal
					onClose={() => {
						this.sxfMD('resident_cityOut');
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
				<div className={style.warning_tip}>还到不向学生借款</div>
				{urlQuery.jumpToBase && (
					<div className={style.adsImg}>
						<img src={adsBg} alt="ad" />
						<div className={style.text}>
							限时参与&nbsp;
							<ClockS count={this.state.count} />
							<span className="jg">:</span>
							{this.state.millisecond < 9 ? <span className="mins">0</span> : <span className="mins">1</span>}
							{<span className="mins">{this.state.millisecond}</span>}
						</div>
					</div>
				)}
				<div className={[style.step_box_new, urlQuery.jumpToBase ? style.step_box_space : ''].join(' ')}>
					<div className={[style.step_item, style.active].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							请先完善个人信息
						</div>
						<div className={style.line} />
						<div className={style.content}>
							<div className={style.item_box}>
								<div className={style.titleTop}>居住地址</div>
								<div
									className={style.listRow}
									onClick={() => {
										this.sxfMD('resident_city');
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
										className="noBorder"
										placeholder="详细地址示例：中关村大街2号楼3单元601"
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
								<div className={style.titleTop}>紧急联系人1</div>
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
											className="hasborder"
											title="选择联系人"
											loadData={[
												() =>
													this.props.$fetch.get(`${API.getRelat}/2`).then((result) => {
														const prov = result && result.data && result.data.length ? result.data : [];
														return prov.map((item) => ({
															value: item.key,
															label: item.value
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
									rules: [
										{ required: true, message: '请输入联系人手机号' },
										{ validator: this.validatePhone }
									],
									onChange: (value) => {
										store.setLinkphone(value);
										this.setState({ linkphone: value });
									}
								})(
									<InputItem
										clear
										className="noBorder"
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
								<div className={style.titleTop}>紧急联系人2</div>
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
													this.props.$fetch.get(`${API.getRelat}/1`).then((result) => {
														const prov = result && result.data && result.data.length ? result.data : [];
														return prov.map((item) => ({
															value: item.key,
															label: item.value
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
									rules: [
										{ required: true, message: '请输入联系人手机号' },
										{ validator: this.validatePhone }
									],
									onChange: (value) => {
										store.setLinkphone2(value);
										this.setState({ linkphone2: value });
									}
								})(
									<InputItem
										clear
										className="noBorder"
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
					</div>
					<div className={[style.step_item].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							继续添加要还款的信用卡
						</div>
						<div className={style.line} />
					</div>
					<div className={[style.step_item].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							获得还款金
						</div>
						<div className={style.line} />
					</div>
				</div>
				{urlQuery.jumpToBase && (
					<div className={style.operatorCont}>
						<ButtonCustom
							onClick={this.handleSubmit}
							className={[style.nextBtn, !this.buttonDisabled() ? style.dis : ''].join(' ')}
						>
							下一步
						</ButtonCustom>
						<div className={style.quitText} onClick={this.quitSubmit}>
							放弃本次机会
						</div>
					</div>
				)}
				{!urlQuery.jumpToBase && (
					<ButtonCustom
						onClick={this.handleSubmit}
						className={[style.sureBtn, !this.buttonDisabled() ? style.dis : ''].join(' ')}
					>
						{needNextUrl ? '下一步' : '完成'}
					</ButtonCustom>
				)}
				<div className={style.protocolBox}>
					<i
						className={selectFlag ? style.selectStyle : `${style.selectStyle} ${style.unselectStyle}`}
						onClick={this.selectProtocol}
					/>
					点击按钮即视为同意
					<a
						onClick={() => {
							this.readContract();
						}}
						className={style.link}
					>
						《个人信息授权书》
					</a>
				</div>
				<AgreementModal visible={showAgreement} readAgreementCb={this.readAgreementCb} />
			</div>
		);
	}
}
