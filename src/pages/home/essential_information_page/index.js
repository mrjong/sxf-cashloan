/*
 * @Author: shawn
 * @LastEditTime: 2020-04-17 15:27:32
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
import { getFirstError, validators, handleInputBlur } from 'utils';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { home, mine } from 'utils/analytinsType';
import { buryingPoints } from 'utils/buryPointMethods';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import { domListen } from 'utils/domListen';
import {
	FixedHelpCenter,
	StepTitle,
	AddressSelect,
	AsyncCascadePicker,
	ButtonCustom,
	FixedTopTip
} from 'components';
import {
	resident_addressRiskBury,
	resident_address_click,
	resident_address_close,
	contact_relationship_click,
	contact_relationship_close,
	contact_relationship2_click,
	contact_relationship2_close,
	contact_name_oneRiskBury,
	contact_name_twoRiskBury,
	contact_name_onePhoneNo,
	contact_name_twoPhoneNo
} from './riskBuryConfig';
import style from './index.scss';

import Images from 'assets/image';

const pageKey = home.basicInfoBury;
let submitButtonLocked = false;

import { auth_queryUsrBasicInfo, msg_area, msg_relation, auth_personalData } from 'fetch/api';

const reducedFilter = (data, keys, fn) => {
	return data.filter(fn).map((el) =>
		keys.reduce((acc, key) => {
			acc[key] = el[key];
			return acc;
		}, {})
	);
};

// let isFetching = false;
@fetch.inject()
@createForm()
@setBackGround('#fff')
@domListen()
@connect((state) => ({
	userInfo: state.staticState.userInfo,
	nextStepStatus: state.commonState.nextStepStatus
}))
export default class essential_information_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			relatData: [], // ?????????????????????
			relatVisible: false, // ?????????????????????
			relatValue: [], // ??????????????????
			provValue: [], // ??????????????????
			provLabel: [],
			millisecond: 0,
			addressList: [],
			relatValue2: [],
			ProvincesValue: '',
			abTest: ''
		};
	}

	componentWillMount() {
		// mpos?????????????????????????????????
		if (store.getBackFlag()) {
			store.removeBackFlag(); // ???????????????flag
		}
		buryingPoints();
		this.initBasicInfo();
	}

	componentDidMount() {
		// ???????????????????????????resize?????????ios?????????
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

	buttonDisabled = (showToast) => {
		const formData = this.props.form.getFieldsValue();
		const { ProvincesValue } = this.state;
		const { address, linkman, linkman2, linkphone, linkphone2, cntRelTyp1, cntRelTyp2 } = formData;
		if (showToast) {
			if (!ProvincesValue) {
				Toast.info('?????????????????????');
				return true;
			}
			if (!address) {
				Toast.info('?????????????????????');
				return true;
			}
			if (address.length > 50) {
				Toast.info('??????????????????????????????');
				return true;
			}
			if (!cntRelTyp1[0]) {
				Toast.info('??????????????????1??????');
				return true;
			}
			if (!linkman) {
				Toast.info('??????????????????1??????');
				return true;
			}
			// if (!validators.name(linkman)) {
			// 	Toast.info('???????????????????????????1??????');
			// 	return true;
			// }
			if (!linkphone) {
				Toast.info('??????????????????1?????????');
				return true;
			}
			if (!validators.phone(linkphone)) {
				Toast.info('???????????????????????????1?????????');
				return true;
			}
			if (!cntRelTyp2[0]) {
				Toast.info('??????????????????2??????');
				return true;
			}
			if (!linkman2) {
				Toast.info('??????????????????2??????');
				return true;
			}
			// if (!validators.name(linkman2)) {
			// 	Toast.info('???????????????????????????2??????');
			// 	return true;
			// }
			if (!linkphone2) {
				Toast.info('??????????????????2?????????');
				return true;
			}
			if (!validators.phone(linkphone2)) {
				Toast.info('???????????????????????????2?????????');
				return true;
			}
		}
		if (
			!ProvincesValue ||
			!address ||
			!cntRelTyp2[0] ||
			!linkman ||
			!linkphone2 ||
			!cntRelTyp1[0] ||
			!linkman2 ||
			!linkphone
		) {
			return true;
		}
		return false;
	};
	// ????????????
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
			console.log('????????????????????????');
		}
		// ???????????????????????????
		if (cacheData) {
			this.props.form.setFieldsValue({
				address: store.getAddress() || (res && res.data && res.data.usrDtlAddr) || '',
				linkman: store.getLinkman() || (res && res.data && base64Decode(res.data.cntUsrNm1)) || '',
				linkphone: store.getLinkphone() || (res && res.data && base64Decode(res.data.cntUsrTel1)) || '',
				linkman2: store.getLinkman2() || (res && res.data && base64Decode(res.data.cntUsrNm2)) || '',
				linkphone2: store.getLinkphone2() || (res && res.data && base64Decode(res.data.cntUsrTel2)) || ''
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
					: []
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
						: []
			});
		}
	};

	//??????????????????
	queryUsrBasicInfo = (province, city, district, township) => {
		this.props.$fetch.get(auth_queryUsrBasicInfo).then((res) => {
			if (res.code === '000000' && res && res.data) {
				this.commonFunc(res, { province, city, district, township });
			} else {
				this.commonFunc(null, { province, city, district, township });
			}
		});
	};

	// ?????????????????????????????????
	initBasicInfo = () => {
		//???????????????????????????
		getAddress()
			.then((res) => {
				const { province, city, district, township } = res;
				this.queryUsrBasicInfo(province, city || province, district, township);
			})
			.catch(() => {
				this.queryUsrBasicInfo();
				console.log('??????????????????????????????');
			});
	};
	// ????????????????????????(????????????),??????gps????????????????????????
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
			 * @description: ???????????????
			 * @param {type}
			 * @return: ???????????????????????????????????????????????????
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

	// ????????????????????????(code??????)
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
			 * @description: ???????????????
			 * @param {type}
			 * @return: ???????????????????????????????????????????????????
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
		const { ProvincesValue, addressList } = this.state;
		if (this.buttonDisabled(true)) return;

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
		if (!(streetNm && streetCd)) {
			submitButtonLocked = false;
			Toast.info('??????????????????????????????');
			return;
		}
		// ?????????????????????
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
							Toast.info('??????????????????????????????????????????');
							// isFetching = false;
							submitButtonLocked = false;
							return;
						}

						// isFetching = true;
						// values????????????????????? getFieldDecorator ???????????????????????????
						Toast.loading('?????????...', 10);
						this.props.$fetch
							.post(auth_personalData, params)
							.then((result) => {
								submitButtonLocked = false;
								Toast.hide();
								if (result && result.code === '000000') {
									store.setBackFlag(true);
									// ??????-???????????????-????????????
									this.confirmBuryPoint(true);
									buriedPointEvent(mine.creditExtensionBack, {
										current_step: '??????????????????'
									});
									if (this.props.nextStepStatus) {
										Toast.info('????????????', 2);
										getNextStatus({
											RouterType: 'essential_infomation_page',
											$props: this.props
										});
									}
								} else if (result.code === '000030') {
									if (this.props.nextStepStatus) {
										Toast.info('????????????', 2);
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

	// ????????????????????????
	confirmBuryPoint = (isSucc, failInf) => {
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		// ??????????????????????????????
		const isFromMine = query.isShowCommit;
		buriedPointEvent(home.basicInfoComplete, {
			entry: !isFromMine || isFromMine === 'false' ? '??????' : '???????????????',
			is_success: isSucc,
			fail_cause: failInf,
			comeFrom: query.entry // ?????????????????????????????????????????????????????????????????????
		});
	};

	// ???????????????
	// validatePhone = (rule, value, callback) => {
	// 	if (!validators.phone(value)) {
	// 		callback('????????????????????????????????????');
	// 	} else {
	// 		callback();
	// 	}
	// };
	// ????????????
	// validateName = (rule, value, callback) => {
	// 	if (!validators.name(value)) {
	// 		callback('???????????????????????????1??????');
	// 	} else {
	// 		callback();
	// 	}
	// };
	// validateAddress = (rule, value, callback) => {
	// 	if (value && value.length > 50) {
	// 		callback('??????????????????????????????');
	// 	} else {
	// 		callback();
	// 	}
	// };

	//input ???????????? width: 100%
	inputOnFocus(val, lab) {
		buryingPoints({
			pageKey,
			trigger: 'focus',
			value: val,
			label: lab
		});
	}

	//input ????????????
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
	// ??????????????????
	quitSubmit = () => {
		this.props.history.goBack();
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
			this.sxfMD(resident_address_close.key);
		}
		this.setState({
			visible: value
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { addressList, visible, ProvincesValue } = this.state;
		const { nextStepStatus } = this.props;
		return (
			<div className={[style.nameDiv, 'info_gb'].join(' ')}>
				<FixedTopTip />
				<div className={style.pageContent}>
					<FixedHelpCenter history={this.props.history} />

					<StepTitle title="??????????????????" titleSub="?????????????????????????????????????????????????????????" stepNum="03" />

					<div className={[style.step_box_new].join(' ')}>
						<div className={style.item_box}>
							<div className={style.titleTop}>????????????</div>
							<div
								className={style.listRow}
								onClick={() => {
									this.sxfMD(resident_address_click.key);
									this.setState({
										visible: true
									});
								}}
							>
								{ProvincesValue ? (
									<div className={style.lableTipWrap}>
										<span className={style.labelTipText}>????????????</span>
										<span className={style.active}>{ProvincesValue}</span>
									</div>
								) : (
									'??????????????????????????????'
								)}
								<img className={style.informationMoreNew} src={Images.icon.icon_arrow_right} />
							</div>

							{this.props.form.getFieldValue('address') || this.state.address ? (
								<div className={[style.lableTipWrap, style.lableTipWrap_address].join(' ')}>
									<span className={style.labelTipText}>????????????</span>
								</div>
							) : null}
							{getFieldDecorator('address', {
								// rules: [{ required: true, message: '?????????????????????' }, { validator: this.validateAddress }],
								onChange: (value) => {
									// ????????????????????????
									store.setAddress(value);
									this.setState({ address: value });
								}
							})(
								<InputItem
									clear
									data-sxf-props={JSON.stringify({
										type: resident_addressRiskBury.type,
										name: resident_addressRiskBury.key,
										actContain: resident_addressRiskBury.actContain
									})}
									className="hasborder"
									placeholder="????????????????????????????????????"
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
								<span className={style.titleTopNum}>1</span>???????????????
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
										<span className={style.labelTipText}>????????????</span>
									</div>
								) : null}
								{getFieldDecorator('cntRelTyp1', {
									initialValue: this.state.relatValue,
									// rules: [{ required: true, message: '??????????????????1??????' }],
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
										title="???????????????"
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
									<span className={style.labelTipText}>????????????</span>
								</div>
							) : null}
							{getFieldDecorator('linkman', {
								// rules: [{ required: true, message: '??????????????????1??????' }, { validator: this.validateName }],
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
									placeholder="????????????"
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
									<span className={style.labelTipText}>?????????</span>
								</div>
							) : null}
							{getFieldDecorator('linkphone', {
								// rules: [
								// 	{ required: true, message: '??????????????????1?????????' },
								// 	{ validator: this.validatePhone }
								// ],
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
									placeholder="?????????"
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
								<span className={style.titleTopNum}>2</span>???????????????
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
										<span className={style.labelTipText}>????????????</span>
									</div>
								) : null}
								{getFieldDecorator('cntRelTyp2', {
									initialValue: this.state.relatValue2,
									// rules: [{ required: true, message: '??????????????????2??????' }],
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
										title="???????????????"
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
									<span className={style.labelTipText}>????????????</span>
								</div>
							) : null}
							{getFieldDecorator('linkman2', {
								// rules: [{ required: true, message: '??????????????????2??????' }, { validator: this.validateName }],
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
									placeholder="????????????"
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
									<span className={style.labelTipText}>?????????</span>
								</div>
							) : null}
							{getFieldDecorator('linkphone2', {
								// rules: [
								// 	{ required: true, message: '??????????????????2?????????' },
								// 	{ validator: this.validatePhone }
								// ],
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
									placeholder="?????????"
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

				<div className={style.sureBtnWrap}>
					<ButtonCustom onClick={this.handleSubmit} type={this.buttonDisabled() ? 'default' : 'yellow'}>
						{nextStepStatus ? '?????????' : '??????'}
					</ButtonCustom>
					{/* {urlQuery.jumpToBase ? (
						<div className={style.quitText} onClick={this.quitSubmit}>
							??????????????????
						</div>
					) : null} */}
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
			</div>
		);
	}
}
