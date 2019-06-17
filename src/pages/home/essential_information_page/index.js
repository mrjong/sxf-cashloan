import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { InputItem, List, Steps } from 'antd-mobile';
import informationMore from './img/back.png';
import AsyncCascadePicker from 'components/AsyncCascadePicker';
import ButtonCustom from 'components/ButtonCustom';
import fetch from 'sx-fetch';
import { getLngLat, getAddress } from 'utils/Address.js';
import style from './index.scss';
import { getFirstError, validators, handleInputBlur, getNextStr } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { home, mine } from 'utils/analytinsType';
import { buryingPoints } from 'utils/buryPointMethods';
import qs from 'qs';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import StepBar from 'components/StepBar';
import CountDownForm from 'components/TimeDown/CountDownForm';
import ClockS from 'components/TimeDown/ClockS';
import circle from './img/circle.png';
import circle_not from './img/circle_not.png';
import adsBg from './img/base_top_img.png';
import AgreementModal from 'components/AgreementModal';
const Step = Steps.Step;
const pageKey = home.basicInfoBury;
const customIcon = (type) => {
	return type ? (
		<img className={style.step_circle} src={circle} />
	) : (
		<img className={style.step_circle} src={circle_not} />
	);
};
let btn_dis = false;
const API = {
	getProv: '/rcm/qryProv',
	getRelat: '/rcm/qryRelat',
	submitData: '/auth/personalData',
	qryCity: '/rcm/qryCity',
	queryUsrBasicInfo: '/auth/queryUsrBasicInfo',
	procedure_user_sts: '/procedure/user/sts', // 判断是否提交授信
	readAgreement: '/index/saveAgreementViewRecord' // 上报我已阅读协议
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
export default class essential_information_page extends PureComponent {
	constructor(props) {
		super(props);
		urlQuery = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		this.state = {
			count: 0,
			status: 'stopped',
			loading: false,
			relatData: [], // 亲属联系人数据
			relatVisible: false, // 联系人是否显示
			relatValue: [], // 选中的联系人
			provValue: [], // 选中的省市区
			provLabel: [],
			showAgreement: false, // 显示协议弹窗
			millisecond: 0
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
		this.getMillisecond();
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
		clearInterval(this.timer);
		this.timer = null;
	}
	getMillisecond = () => {
		setTimeout(() => {
			setInterval(() => {
				if (Number(this.state.millisecond) > 9) {
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
	getErrorInput = () => {
		this.props.form.validateFields((err, values) => {
			if (!err) {
				btn_dis = true;
			} else {
				btn_dis = false;
			}
		});
	};

	//获取基本信息
	queryUsrBasicInfo = (province, city) => {
		this.props.$fetch.post(API.queryUsrBasicInfo).then(
			(res) => {
				if (res.msgCode === 'PTM0000') {
					this.getProCode(
						res.data.provNm || store.getProvince() || province || '',
						res.data.cityNm || store.getCity() || city || ''
					);
					this.props.form.setFieldsValue({
						address: (res.data && res.data.usrDtlAddr) || store.getAddress() || '',
						linkman: (res.data && res.data.cntUsrNm1) || store.getLinkman() || '',
						linkphone: store.getLinkphone() || ''
					});
					this.setState({
						relatValue:
							res.data && res.data.cntRelTyp1
								? [ `${res.data.cntRelTyp1}` ]
								: store.getRelationValue() ? store.getRelationValue() : []
					});
				} else {
					this.getErrorInput();
					this.props.toast.info(res.msgInfo);
				}
			},
			(error) => {}
		);
	};

	// 初始化页面信息（反显）
	initBasicInfo = () => {
		//通过经纬度获取省市
		getAddress()
			.then((res) => {
				const { province, city } = res;
				this.queryUsrBasicInfo(province, city || province);
			})
			.catch(() => {
				this.queryUsrBasicInfo();
				console.log('经纬度获取省市报错了');
			});
	};

	// 获取城市标签反显
	getProCode = (pro, city) => {
		let proPattern = new RegExp(`^[\\u4E00-\\u9FA5]*${pro}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
		let cityPattern = new RegExp(`^[\\u4E00-\\u9FA5]*${city}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
		this.props.$fetch.get(`${API.getProv}`).then((result) => {
			if (result && result.data) {
				const provItem = reducedFilter(result.data, [ 'key', 'value' ], (item) => {
					let proPattern2 = new RegExp(`^[\\u4E00-\\u9FA5]*${item.value}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
					if (proPattern.test(item.value) || proPattern2.test(pro)) {
						return item;
					}
				});
				this.props.$fetch.get(`${API.qryCity}/${provItem[0].key}`).then((result2) => {
					const cityItem = reducedFilter(result2.data, [ 'key', 'value' ], (item2) => {
						let cityPattern2 = new RegExp(`^[\\u4E00-\\u9FA5]*${item2.value}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
						if (cityPattern.test(item2.value) || cityPattern2.test(city)) {
							return item2;
						}
					});
					this.setState({
						provValue: provItem && cityItem && [ provItem[0].key + '', cityItem[0].key + '' ],
						provLabel: provItem && cityItem && [ provItem[0].value + '', cityItem[0].value + '' ]
					});
					this.getErrorInput();
					console.log(this.state.provValue, this.state.provLabel);
				});
			}
		});
	};

	handleSubmit = () => {
		// if (isFetching) {
		// 	return;
		// }
		const { loading } = this.state;
		if (loading) return; // 防止重复提交
		const city = this.state.provLabel[0];
		const prov = this.state.provLabel[1];
		// 调基本信息接口
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = `${city}${prov}${values.address}`;
				getLngLat(data).then((lngLat) => {
					const params = {
						provNm: this.state.provLabel[0],
						cityNm: this.state.provLabel[1],
						usrDtlAddr: values.address,
						usrDtlAddrLctn: lngLat,
						cntRelTyp1: values.cntRelTyp1[0],
						cntUsrNm1: values.linkman,
						cntMblNo1: values.linkphone,
						credCorpOrg: ''
					};
					if (values.linkphone === values.relativesPhone) {
						this.props.toast.info('联系人手机号重复，请重新填写');
						// isFetching = false;
					} else {
						// isFetching = true;
						// values中存放的是经过 getFieldDecorator 包装的表单元素的值
						this.props.$fetch.post(`${API.submitData}`, params).then((result) => {
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
						});
					}
				});
			} else {
				// isFetching = false;
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
		this.getErrorInput();
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

	render() {
		const { getFieldDecorator } = this.props.form;
		const { showAgreement } = this.state;
		const needNextUrl = store.getNeedNextUrl();
		return (
			<div className={[ style.nameDiv, 'info_gb' ].join(' ')}>
				{/* {urlQuery.jumpToBase && ( */}
					<div className={style.adsImg}>
						<img src={adsBg} alt="ad" />
					</div>
				{/* )} */}
				<ClockS count={this.state.count} />
				{this.state.millisecond}
				<CountDownForm onSetCountDown={this.handleSetCountDown} />
				<div className={[ style.step_box_new, urlQuery.jumpToBase ? style.step_box_space : '' ].join(' ')}>
					<div className={[ style.step_item, style.active ].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							请先完善个人信息
						</div>
						<div className={style.line} />
						<div className={style.content}>
							<div className={style.item_box}>
								<div className={style.labelDiv}>
									{getFieldDecorator('city', {
										initialValue: this.state.provValue,
										rules: [ { required: true, message: '请选择城市' } ],
										onChange: (value, label) => {
											this.selectSure({
												value: JSON.stringify(value),
												label: 'resident_city'
											});
											store.setProvince(label[0]);
											store.setCity(label[1]);
											this.setState({ provValue: value });
											this.setState({ provLabel: label });
										}
									})(
										// 这里面的组件，要有 value onChange属性就行，一般都是表单组件，自定义组件，提供了value onChange 属性的也可以用，也可以通过 valuePropName 来指定，这个就是高级一点的用法了。
										<AsyncCascadePicker
											title="选择省市"
											loadData={[
												() =>
													this.props.$fetch.get(`${API.getProv}`).then((result) => {
														const prov =
															result && result.data && result.data.length
																? result.data
																: [];
														return prov.map((item) => ({
															value: item.key,
															label: item.value
														}));
													}),
												(provCd) =>
													this.props.$fetch.get(`${API.qryCity}/${provCd}`).then((result) => {
														const city =
															result && result.data && result.data.length
																? result.data
																: [];
														return city.map((item) => ({
															value: item.key,
															label: item.value
														}));
													})
											]}
											onVisibleChange={(bool) => {
												if (bool) {
													this.selectClick({
														value: JSON.stringify(this.state.provValue),
														label: 'resident_city'
													});
												}
											}}
											cols={2}
										>
											<List.Item className="hasborder">居住城市</List.Item>
										</AsyncCascadePicker>
									)}
									<img className={style.informationMore} src={informationMore} />
								</div>
								{getFieldDecorator('address', {
									rules: [
										{ required: true, message: '请输入常住地址' },
										{ validator: this.validateAddress }
									],
									onChange: (value) => {
										// 本地缓存常住地址
										store.setAddress(value);
										this.setState({ address: value });
									}
								})(
									<InputItem
										className="noBorder"
										placeholder="县区、街道、小区、楼栋号"
										type="text"
										onBlur={(v) => {
											this.inputOnBlur(v, 'resident_address');
										}}
										onFocus={(v) => {
											this.inputOnFocus(v, 'resident_address');
										}}
									>
										常住地址
									</InputItem>
								)}
							</div>

							<div className={style.item_box}>
								<div className={style.labelDiv}>
									{getFieldDecorator('cntRelTyp1', {
										initialValue: this.state.relatValue,
										rules: [ { required: true, message: '请选择联系人关系' } ],
										onChange: (value, label) => {
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
														const prov =
															result && result.data && result.data.length
																? result.data
																: [];
														return prov.map((item) => ({
															value: item.key,
															label: item.value
														}));
													})
											]}
											cols={1}
											onVisibleChange={(bool) => {
												if (bool) {
													this.selectClick({
														value: JSON.stringify(this.state.relatValue),
														label: 'clan_relation'
													});
												}
											}}
										>
											<List.Item className="hasborder">联系人关系</List.Item>
										</AsyncCascadePicker>
									)}
									<img className={style.informationMore} src={informationMore} />
								</div>
								{getFieldDecorator('linkman', {
									rules: [
										{ required: true, message: '请输入联系人姓名' },
										{ validator: this.validateName }
									],
									onChange: (value) => {
										store.setLinkman(value);
										this.setState({ linkman: value });
									}
								})(
									<InputItem
										placeholder="联系人真实姓名"
										type="text"
										onBlur={(v) => {
											this.inputOnBlur(v, 'contact_name_one');
										}}
										onFocus={(v) => {
											this.inputOnFocus(v, 'contact_name_one');
										}}
									>
										联系人姓名
									</InputItem>
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
										className="noBorder"
										type="number"
										maxLength="11"
										placeholder="有效联系人的手机号"
										onBlur={(v) => {
											this.inputOnBlur(v, 'contact_tel_one');
										}}
										onFocus={(v) => {
											this.inputOnFocus(v, 'contact_tel_one');
										}}
									>
										联系人电话
									</InputItem>
								)}
							</div>
						</div>
					</div>
					<div className={[ style.step_item ].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							继续添加要还款的信用卡
						</div>
						<div className={style.line} />
					</div>
					<div className={[ style.step_item ].join(' ')}>
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
							className={[ style.nextBtn, !btn_dis ? style.dis : '' ].join(' ')}
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
						className={[ style.sureBtn, !btn_dis ? style.dis : '' ].join(' ')}
					>
						{needNextUrl ? '下一步' : '完成'}
					</ButtonCustom>
				)}
				<AgreementModal visible={showAgreement} readAgreementCb={this.readAgreementCb} />
			</div>
		);
	}
}
