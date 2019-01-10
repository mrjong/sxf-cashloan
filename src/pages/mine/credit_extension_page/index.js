import React, { PureComponent } from 'react';
import Lists from 'components/Lists';
import { store } from 'utils/store';
import ButtonCustom from 'components/ButtonCustom';
import fetch from 'sx-fetch';
import qs from 'qs';
import { buriedPointEvent } from 'utils/analytins';
import { mine } from 'utils/analytinsType';
import styles from './index.scss';
import { isMPOS } from 'utils';
import { getAppsList, getContactsList } from 'utils/publicApi';
import { Modal } from 'antd-mobile';
import ModalContent from './components/ModalInfo';

const API = {
	getStw: '/my/getStsw', // 获取4个认证项的状态
	getOperator: '/auth/operatorAuth', // 运营商的跳转URL
	getZmxy: '/auth/getZhimaUrl', // 芝麻认证的跳转URL
	getXMURL: '/auth/zmAuth' // 芝麻认证之后的回调状态
};
let urlQuery = '';
let autId = '';
// const needDisplayOptions = ['idCheck', 'basicInf', 'operator', 'zmxy'];
const needDisplayOptions = [ 'idCheck', 'basicInf', 'operator' ];

@fetch.inject()
export default class credit_extension_page extends PureComponent {
	constructor(props) {
		super(props);
	}

	state = {
		sourceData: [], // 原始总数据
		stswData: [],
		flag: false,
		submitFlag: false,
		isShowBtn: true, // 是否展示提交代还金申请按钮
		isShowModal: false,
	};

	componentWillMount() {
		if (store.getCheckCardRouter() === 'checkCardRouter') {
			store.removeBackUrl();
			this.props.history.push('/home/home');
			return;
		}
		// 查询 授信项状态
		this.requestGetStatus();
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		urlQuery = this.props.history.location.search;
		autId = query.autId;
		const isShowCommit = query.isShowCommit; // 个人中心进入该页面不展示提交代还金申请按钮
		if (!isShowCommit || isShowCommit === 'false') {
			this.setState({ isShowBtn: false });
		}
	}

	// 获取授信列表状态
	requestGetStatus = () => {
		this.props.$fetch.get(`${API.getStw}`).then((result) => {
			if (result && result.data !== null && result.msgCode === 'PTM0000') {
				this.setState({
					sourceData: result.data,
					stswData: result.data.filter((item) => needDisplayOptions.includes(item.code))
				});

				// 判断四项认证是否都认证成功
				const isAllValid = this.state.stswData.every(
					(item) => item.stsw.dicDetailCd === '2' || item.stsw.dicDetailCd === '1'
				);
				if (isAllValid) {
					this.setState({ submitFlag: true });
				}
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};

	// 提交代还金申请
	commitApply = () => {
		if (!this.checkCreditCardStatus()) {
			return;
		}
		this.setState({
			isShowModal: true,
		})
	};

	// 判断信用卡状态
	checkCreditCardStatus = () => {
		const { sourceData } = this.state;
		const creditCardStatus = sourceData.filter((item) => item && item.code === 'card')[0].stsw.dicDetailCd;
		let isCreditCardStatusVerify = false;
		switch (creditCardStatus) {
			case '1': // 认证中
				isCreditCardStatusVerify = true;
				break;
			case '2': // 认证成功
				isCreditCardStatusVerify = true;
				break;
			case '3': // 认证失败
				this.props.toast.info('账单读取失败，请返回首页更新账单');
				isCreditCardStatusVerify = false;
				break;
			case '4': // 认证过期
				this.props.toast.info('账单已过期，请返回首页更新账单');
				isCreditCardStatusVerify = false;
				break;
			default:
				isCreditCardStatusVerify = false;
		}
		return isCreditCardStatusVerify;
	};

	getStateData = (item) => {
		const { stswData } = this.state;
		const firstOption = stswData.filter((item) => item.code === 'idCheck')[0];
		if (item.dicDetailCd === '2' || item.dicDetailCd === '1') {
			this.props.toast.info(item.extra.name);
		} else if (firstOption.stsw.dicDetailCd !== '2') {
			if (item.extra.code === 'idCheck') {
				buriedPointEvent(mine.creditExtensionRealName);
				this.props.history.push({ pathname: '/home/real_name', search: urlQuery });
			} else {
				this.props.this.props.this.props.toast.info('请先实名认证');
				setTimeout(() => {
					this.props.history.push({ pathname: '/home/real_name', search: urlQuery });
				}, 3000);
			}
		} else {
			switch (item.extra.code) {
				case 'idCheck':
					buriedPointEvent(mine.creditExtensionRealName);
					this.props.history.push({ pathname: '/home/real_name', search: urlQuery });
					break;
				case 'basicInf':
					buriedPointEvent(mine.creditExtensionBaseInfo);
					this.props.history.push({ pathname: '/home/essential_information', search: urlQuery });
					break;
				case 'operator':
					this.props.$fetch
						.post(`${API.getOperator}`, {
							clientCode: '04'
						})
						.then((result) => {
							if (result.msgCode === 'PTM0000' && result.data.url) {
								buriedPointEvent(mine.creditExtensionOperator);
								store.setCheckCardRouter('');
								store.setMoxieBackUrl(`/mine/credit_extension_page${urlQuery}`);
								this.props.SXFToast.loading('加载中...', 0);
								// window.location.href = result.data.url.replace('https://lns-front-test.vbillbank.com/craw/index.html#/','http://172.18.40.77:9000#/')+ `&hideStep=true&project=xdc&localUrl=${window.location.origin}&routeType=${window.location.pathname}${window.location.search}`
								window.location.href =
									result.data.url +
									`&localUrl=${window.location.origin}&routeType=${window.location.pathname}${window
										.location.search}&showTitleBar=NO`;
							} else {
								this.props.toast.info(result.msgInfo);
							}
						});
					break;
				case 'zmxy':
					this.props.$fetch.get(`${API.getZmxy}`).then((result) => {
						if (result.msgCode === 'PTM0000') {
							buriedPointEvent(mine.creditExtensionZM);
							if (result.data.authUrl) {
								store.setCheckCardRouter('');
								store.setMoxieBackUrl(`/mine/credit_extension_page${urlQuery}`);
								this.props.SXFToast.loading('加载中...', 0);
								window.location.href = result.data.authUrl;
							} else {
								this.props.toast.info('授信成功');
								setTimeout(() => {
									this.requestGetStatus();
								}, 3000);
							}
						} else {
							this.props.toast.info(result.msgInfo);
						}
					});
					break;
				default:
					break;
			}
		}
	};

	// 关闭弹框
	handleCloseModal = () => {
		this.setState({
		  isShowModal: false,
		});
	};

	render() {
		const { submitFlag, stswData, isShowBtn } = this.state;
		const data = stswData.map((item) => {
			return {
				dicDetailCd: item.stsw.dicDetailCd,
				extra: {
					code: item.code,
					name: item.stsw.dicDetailValue,
					color: item.stsw.color
				},
				label: {
					name: item.name
				}
			};
		});
		if (isShowBtn) {
			// document.title = '风控授信项';
			this.props.setTitle('信用认证');
		} else {
			// document.title = '信用加分';
			this.props.setTitle('信用加分');
		}
		return (
			<div className={styles.credit_extension_page}>
				<Lists listsInf={data} clickCb={this.getStateData} />
				{isShowBtn ? (
					<ButtonCustom
						onClick={submitFlag ? this.commitApply : null}
						className={submitFlag ? styles.commit_btn : styles.not_commit_btn}
					>
						提交代还金申请
					</ButtonCustom>
				) : null}
				{/* 确认代还信息弹框 */}
				<Modal popup visible={this.state.isShowModal} onClose={this.handleCloseModal} animationType="slide-up">
					<ModalContent autId={autId} onClose={this.handleCloseModal} history={history} />
				</Modal>
			</div>
		);
	}
}
