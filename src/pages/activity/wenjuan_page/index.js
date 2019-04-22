import React, { PureComponent } from 'react';
import qs from 'qs';
import { Checkbox, List, Modal } from 'antd-mobile';
import styles from './index.scss';
import wenjuan_01 from './img/wenjuan_01.jpg';
import result_img from './img/result_img.png';
import paper from './img/paper.png';
import title_img from './img/title.png';
import gift from './img/gift.png';
import card_img from './img/card.png';
import arrow from './img/arrow.png';
import wenjuan_02 from './img/wenjuan_02.jpg';
import wenjuan_03 from './img/wenjuan_03.jpg';
import wenjuan_04 from './img/wenjuan_04.png';
import { isMPOS } from 'utils/common';
import { isWXOpen } from 'utils';
import { mposShare } from 'utils/publicApi';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
import wxshare from 'utils/wxshare';
import SmsAlert from '../components/SmsAlert';
import Alert_mpos from 'pages/mpos/mpos_no_realname_alert_page';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
const AgreeItem = Checkbox.AgreeItem;
const API = {
	queryQuestionnaire: '/activeConfig/queryQuestionnaire/QA001', // 用户是否参与过免息
	saveQuestionnaire: '/activeConfig/saveQuestionnaire'
};
@fetch.inject()
export default class wenjuan_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			showModal: false,
			showShareTip: false,
			showLoginTip: false, // 是否登陆弹框
			showAwardModal: false, // 获奖弹框
			showNoAwardModal: false, // 无领取资格弹框
			showModalType: '', // 展示弹框类型
			urlData: {}, // url上的参数
			showResult: false,
			showBoundle: false, // 是否展示未实名的弹框
			btnStatus: false,
			isNewUser: true,
			submitParam: {},
			shareData: {},
			data: [
				{
					title: '信用卡代偿平台是什么?',
					type: 'radio',
					list: [
						{
							title: '平台代为偿还信用卡账单',
							selected: 'A'
						},
						{
							title: '信用卡偿还另一张信用卡',
							selected: 'B'
						}
					]
				},
				{
					title: '信用卡代偿与卡贷的区别是什么?',
					type: 'radio',
					list: [
						{
							title: '信用卡代偿精准代偿信用卡所欠帐单，卡贷利用信用卡进行借款',
							selected: 'A'
						},
						{
							title: '没有区别',
							selected: 'B'
						}
					]
				},
				{
					title: '信用卡代偿具备什么特点? ',
					type: 'checkbox',
					list: [
						{
							title: '精准匹配帐单欠多少还多少',
							selected: 'A'
						},
						{
							title: '预约还款制，智能还款管家',
							selected: 'B'
						},
						{
							title: '省时省钱',
							selected: 'C'
						}
					]
				},
				{
					title: '以下谁是信用卡代偿平台?',
					type: 'radio',
					list: [
						{
							title: '还到',
							selected: 'A'
						},
						{
							title: '随行付plus',
							selected: 'B'
						},
						{
							title: '小X卡贷',
							selected: 'C'
						}
					]
				}
			]
		};
	}

	componentWillMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		let queryData2 = qs.parse(location.search, { ignoreQueryPrefix: true });
		delete queryData2.token;
		delete queryData2.telNo;
		delete queryData2.appId;
		delete queryData2.scene;
		delete queryData2.site;
		delete queryData2.SXFSharePlatform;
		queryData2.entry = 'isxdc_share';
		const href = qs.stringify(queryData2);
		console.log(href);

		this.setState(
			{
				urlData: queryData,
				shareData: {
					title: '参与答题畅游全球FUN肆嗨', // 分享标题
					desc: '4月25日始，参与答题系列任务，【还到】免费送你价值3668元的双人旅游卡，圆你环球梦', // 分享描述
					link: location.origin + '?' + href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
					imgUrl: 'https://lns-static-resource.vbillbank.com/cashloan/wxapp_static/black_logo_2x.png', // 分享图标
					success: function(res) {
						console.log('已分享', res);
					},
					cancel: function(res) {
						console.log('取消分享', res);
					}
				}
			},
			() => {
				// 注入微信分享
				wxshare({
					$props: this.props,
					shareData: this.state.shareData
				});
            }
    
		);
		if (queryData.entry) {
			// 根据不同入口来源埋点
			buriedPointEvent(activity.wenjuanEntry, {
				entry: queryData.entry
			});
        }

		this.queryQuestionnaire();
	}
	localData = () => {
		if (localStorage.getItem('wenjuan')) {
			this.getBtnStatus(JSON.parse(localStorage.getItem('wenjuan')));
			this.setState({
				data: JSON.parse(localStorage.getItem('wenjuan'))
			});
		}
	};
	queryQuestionnaire = () => {
		this.props.$fetch.get(API.queryQuestionnaire).then((res) => {
			if (res.msgCode === 'PTM0000') {
				if (res.data) {
					this.setState({
						isNewUser: false,
						showModal: true
					});
					localStorage.removeItem('wenjuan');
					this.backData(res.data);
				} else {
					this.localData();
				}
			} else {
				this.localData();
			}
		});
	};
	backData = (data) => {
        let dataCopy = JSON.parse(JSON.stringify(this.state.data));
		let dataKeys = Object.keys(data).filter((item) => item.indexOf('answer') > -1);
		for (let i = 0; i < dataCopy.length; i++) {
			for (let j = 0; j < dataCopy[i].list.length; j++) {
				for (let k = 0; k < dataKeys.length; k++) {
                    let x = data[dataKeys[k]].split('');
                    console.log(x)
					for (let l = 0; l < x.length; l++) {
                        console.log(x[l])
						if (dataCopy[i].list[j].selected === x[l]&&k===i) {
							dataCopy[i].list[j].checked = true;
						}
					}
				}
			}
        }
		this.setState({
			data: dataCopy
		},()=>{
            this.setShowResult()
        });
	};
	getStatus = () => {
		this.child.validateMposRelSts({
			smsProps_disabled: true,
			loginProps_disabled: true,
			loginProps_needLogin: true,
			otherProps_type: 'home'
		});
	};
	goTo = () => {
		const { urlData } = this.state;
		// 根据不同入口来源埋点
		buriedPointEvent(activity.wenjuanBtn, {
			entry: urlData.entry
		});
		if (urlData && urlData.entry && urlData.entry.indexOf('ismpos_') > -1) {
			if (urlData.appId && urlData.token) {
				this.getStatus();
			} else {
				this.setState({
					noLogin: true,
					showLoginTip: true
				});
			}
		} else if (Cookie.get('fin-v-card-token')) {
			store.setToken(Cookie.get('fin-v-card-token'));
			this.goHomePage();
		} else if (urlData.entry.indexOf('isxdc_menu') > -1) {
			store.setWenJuan(true);
			this.props.history.replace('/common/wx_middle_page?NoLoginUrl="/login"');
		}
	};
	closeModal = () => {
		this.setState({
			showModal: false
		});
	};
	closeTip = () => {
		this.setState({
			showLoginTip: false
		});
	};

	// 跳转协议
	go = (url) => {
		this.props.history.push(`/protocol/${url}`);
	};
	getParam = () => {
		let obj = {};
		let wenjuan = JSON.parse(localStorage.getItem('wenjuan'));
		for (let i = 0; i < wenjuan.length; i++) {
			let str = '';
			for (let j = 0; j < wenjuan[i].list.length; j++) {
				if (wenjuan[i].list[j].checked) {
					str = str + wenjuan[i].list[j].selected;
					obj[`answer${i + 1}`] = str;
				}
			}
		}
		return obj;
	};
	// 进入首页
	goHomePage = () => {
		if (localStorage.getItem('wenjuan')) {
			this.props.$fetch
				.post(API.saveQuestionnaire, {
					actId: 'QA001',
					...this.getParam()
				})
				.then((res) => {
					if (res.msgCode === 'PTM0000') {
						localStorage.removeItem('wenjuan');
						this.setState({
							showModal: true
						});
					} else {
						this.props.toast.info(res.msgInfo);
					}
				});
		} else {
			this.props.toast.info('请选择选项后再提交');
		}
	};

	onRef = (ref) => {
		this.child = ref;
	};
	selectedFunc = (e, index, index2, item) => {
		console.log(e);
		const data = this.state.data;
		console.log(item);
		if (item.type === 'radio') {
			for (let index = 0; index < item.list.length; index++) {
				const element = item.list[index];
				element.checked = false;
			}
			data[index].list[index2].checked = e.target.checked;
		} else {
			data[index].list[index2].checked = e.target.checked;
		}
		this.getBtnStatus(data);
		this.setState({
			data: [ ...data ]
		});
	};
	getBtnStatus = (data) => {
		const list = [];
		for (let index = 0; index < data.length; index++) {
			const element = data[index];
			for (let index2 = 0; index2 < element.list.length; index2++) {
				const element2 = element.list[index2];
				if (element2 && element2.checked) {
					list.push('1');
					break;
				}
			}
		}
		console.log(list);
		this.setState({
			btnStatus: data.length === list.length ? true : false
		});
	};
	setShowResult = (type) => {
		this.setState({
			showResult: true
		});
		let data = this.state.data;
		data = data.map((item) => {
			item.list.map((item2) => {
				return (item2.disabled = true);
			});
			return item;
		});
		localStorage.setItem('wenjuan', JSON.stringify(data));
		this.setState(
			{
				data: [ ...data ]
			},
			() => {
				if (type === 'submit') {
					this.goTo();
				}
			}
		);
	};
	shareFunc = () => {
		if (isMPOS()) {
			// mpos
			mposShare({
				$props: this.props,
				shareData: this.state.shareData
			});
		} else if (isWXOpen()) {
			this.setState({
				showShareTip: true
			});
			// 微信分享
		} else {
			this.props.toast.info('请用微信客户端打开，进行分享');
		}
	};
	submitData = () => {
		const { urlData } = this.state;
		// 根据不同入口来源埋点
		buriedPointEvent(activity.wenjuanBtn, {
			entry: urlData.entry
		});
		if (!this.state.btnStatus) {
			return;
		}
		this.setShowResult('submit');
	};
	render() {
		const { showModal, showLoginTip, showBoundle, data, showResult, btnStatus, showShareTip } = this.state;
		return (
			<div className={styles.main}>
				<SmsAlert
					onRef={this.onRef}
					goSubmitCb={{
						PTM0000: (res, getType) => {
							this.goHomePage();
						},
						URM0008: (res, getType) => {},
						others: (res, getType) => {}
					}}
					goLoginCb={{
						PTM0000: (res, getType) => {
							this.goHomePage();
						},
						URM0008: (res, getType) => {},
						others: (res, getType) => {}
					}}
					validateMposCb={{
						PTM9000: (res, getType) => {
							this.props.history.replace('/mpos/mpos_ioscontrol_page');
						},
						others: (res, getType) => {
							this.setState({
								showBoundle: true
							});
						}
					}}
					chkAuthCb={{
						authFlag0: (res, getType) => {},
						authFlag1: (res, getType) => {
							this.goHomePage();
						},
						authFlag2: (res, getType) => {
							// this.props.toast.info('暂无活动资格');
						},
						others: (res, getType) => {}
					}}
					doAuthCb={{
						authSts00: (res, getType) => {
							this.goHomePage();
						},
						others: (res, getType) => {}
					}}
				/>
				<div className={styles.imgBox}>
					<button
						onClick={() => {
							localStorage.removeItem('wenjuan');
						}}
					>
						清除缓存
					</button>
					<img src={wenjuan_01} className={styles.activity_bg} />
					<img src={wenjuan_02} className={styles.activity_bg} />
					<img src={wenjuan_03} className={styles.activity_bg} />
					<img src={wenjuan_04} className={styles.activity_bg} />
					<div className={[ styles.btn_submit_box ]}>
						<a
							onClick={this.shareFunc}
							className={[ styles.btn_submit, styles.btn_submit_share ].join(' ')}
						>
							转发参与抽奖
						</a>
					</div>
					<div className={styles.big_box}>
						<div className={styles.img_box}>
							<img src={title_img} className={styles.img_title} />
							<img src={card_img} className={styles.img_card} />
						</div>
						<div className={[ styles.img_box_white, 'wenjuan' ].join(' ')}>
							<ul className={[ styles.text_box, 'wenjuan' ].join(' ')}>
								{data.map((item, index) => {
									return (
										<li key={index} className={styles.text_title}>
											{index + 1}.{item.title}
											{item.type === 'checkbox' ? '(多选)' : ''}
											<ul className={styles.text_list}>
												{item.list.map((item2, index2) => {
													return (
														<li key={index2}>
															<AgreeItem
																checked={item2.checked}
																disabled={item2.disabled}
																className={[
																	styles.li_desc,
																	item2.checked ? 'checked' : ''
																].join(' ')}
																onChange={(e) =>
																	this.selectedFunc(e, index, index2, item)}
															>
																{item2.selected}.{item2.title}
															</AgreeItem>
														</li>
													);
												})}
											</ul>
										</li>
									);
								})}
							</ul>
							<div className={styles.result_box}>
								{!showResult && btnStatus ? <a onClick={this.setShowResult}>查看答案</a> : null}
								{showResult ? <img src={result_img} /> : null}
							</div>
							<div className={styles.btn_submit_box}>
								<a
									onClick={this.submitData}
									className={[ styles.btn_submit, !btnStatus ? styles.disabled : '' ].join(' ')}
								>
									提交抽奖
								</a>
							</div>

							<div className={styles.footer_text}>
								<span style={{ color: '#733424' }}>参与即同意</span>
								<span
									onClick={() => {
										this.go('register_agreement_page');
									}}
								>
									《随行付金融用户注册协议》
								</span>
								<span
									onClick={() => {
										this.go('privacy_agreement_page');
									}}
								>
									《随行付用户隐私权政策》
								</span>
							</div>
						</div>
						<div className={styles.img_paper_box}>
							<img src={paper} />
						</div>
					</div>
				</div>
				{showLoginTip && (
					<div className={styles.modal}>
						<div className={styles.mask} />
						<div>
							<img src={arrow} />
						</div>
						<div className={[ styles.modalWrapper, styles.tipWrapper ].join(' ')}>
							<div className={styles.tipText}>
								<span>小主～</span>
								<br />
								<span>活动火热进行中，快前往「还到」参与！</span>
							</div>
							<div className={styles.closeBtn} onClick={this.closeTip} />
						</div>
					</div>
				)}

				{showShareTip && (
					<div className={styles.modal}>
						<div
							className={styles.mask}
							onClick={() => {
								this.setState({
									showShareTip: false
								});
							}}
						/>
						<div className={[ styles.arrow_box, styles.animate_up ].join(' ')}>
							<img src={arrow} />
							<div className={styles.text}>点击右上角分享</div>
						</div>
					</div>
				)}

				<Modal
					className="gift"
					onClose={this.closeModal}
					closable
					visible={showModal}
					transparent
					maskClosable={false}
				>
					<div>
						<img src={gift} className={styles.img_gift} />

						{this.state.isNewUser ? (
							<div>
								<h3 className={styles.modalTitle}>提交成功</h3>
								<h3 className={styles.modalTitle}>继续任务可增加中奖概率哦</h3>
							</div>
						) : null}
						{!this.state.isNewUser ? (
							<div>
								<h3 className={styles.modalTitle}>您已参与抽奖</h3>
								<h3 className={styles.modalTitle}>请等待开奖结果</h3>
							</div>
						) : null}
						<div className={styles.btn_submit_box}>
							<a
								onClick={() => {
									this.props.history.push('/home/home');
								}}
								className={[ styles.btn_submit, styles.btn_submit_alert ].join(' ')}
							>
								进入还到
							</a>
						</div>
					</div>
				</Modal>
				{showBoundle ? <Alert_mpos /> : null}
			</div>
		);
	}
}
