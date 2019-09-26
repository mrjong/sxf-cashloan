/*
 * @Author: shawn
 * @LastEditTime: 2019-09-26 12:11:58
 */
import React, { PureComponent } from 'react';
import style from './index.scss';
import { Modal, Icon } from 'antd-mobile';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import ExamineComponents from 'components/ExamineComponents';
import ZButton from 'components/ButtonCustom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { buriedPointEvent } from 'utils/analytins';
import { manualAudit } from 'utils/analytinsType';
import SXFButton from 'components/ButtonCustom';
import q_icon from '../../../assets/images/home/tip_ico.png';
import qs from 'qs';
import { store } from '../../../utils/store';

let queryData = null;

@setBackGround('#fff')
@fetch.inject()
export default class remit_ing_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			copyText: '还到',
			showRulesPannel: false,
			visibleModal: false,
			timeSelectedItem: {},
			daySelectedItem: {
				code: '0',
				day: '今日'
			}
		};
	}

	componentDidMount() {
		queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		buriedPointEvent(manualAudit.pageview, {
			s_medium: queryData.apptoken ? 'APP' : 'H5'
		});
		if (queryData.apptoken) {
			//如果从APP过来
			store.setToken(queryData.apptoken);
			this.querySubscribeInfo();
		} else {
			this.querySubscribeInfo();
		}
	}

	querySubscribeInfo = () => {
		this.props.$fetch.get(`/bill/querySubscribeInfo/${queryData.creadNo}`).then((res) => {
			if (res && res.msgCode === 'PTM0000') {
				const { applyDate, applyTime, today, tomorrow, scheduledTime } = res.data || {};
				if (res.data.existFlag === '1') {
					this.setState({
						applyDate,
						applyTime
					});
				} else {
					this.setState(
						{
							today,
							tomorrow,
							scheduledTime
						},
						() => {
							this.handleClosePannel();
						}
					);
				}
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	handleSubmitOrder = () => {
		const { timeSelectedItem, daySelectedItem } = this.state;
		if (!timeSelectedItem.code) {
			this.props.toast.info('请选择时间');
			return;
		}
		this.props.$fetch
			.post(`/bill/submitSubscribe`, {
				applyDateCode: daySelectedItem.code,
				applyTimeCode: timeSelectedItem.code,
				credApplNo: queryData.creadNo
			})
			.then((res) => {
				if (res && res.msgCode === 'PTM0000') {
					buriedPointEvent(manualAudit.order_submit, {
						s_day: daySelectedItem.day,
						s_time: timeSelectedItem.time,
						s_medium: queryData.apptoken ? 'APP' : 'H5'
					});
					this.props.toast.info('预约成功');
					let timer = setTimeout(() => {
						this.handleClosePannel();
						this.querySubscribeInfo();
						clearTimeout(timer);
					}, 2000);
				} else {
					this.props.toast.info(res.msgInfo);
				}
			});
	};

	copyOperation = () => {
		buriedPointEvent(manualAudit.follow_button, {
			s_medium: queryData.apptoken ? 'APP' : 'H5'
		});
		this.props.toast.info('复制成功！马上打开微信关注“还到”');
		setTimeout(() => {
			window.postMessage('复制成功', () => {});
		}, 0);
	};

	showRulesPannel = () => {
		this.setState({
			showRulesPannel: !this.state.showRulesPannel
		});
	};

	handleClosePannel = () => {
		if (this.state.showRulesPannel) {
			buriedPointEvent(manualAudit.order_rule, {
				s_medium: queryData.apptoken ? 'APP' : 'H5'
			});
			this.setState({
				showRulesPannel: !this.state.showRulesPannel
			});
		} else {
			this.setState({
				visibleModal: !this.state.visibleModal
			});
		}
	};

	handleButtonClick = (type, item) => {
		if (this.state.daySelectedItem.code === '0' && !item.availiable) return; //为今日且不可用时
		if (type === 'day') {
			this.setState({
				timeSelectedItem: {} //切换是清空
			});
		}
		this.setState({
			[type + 'SelectedItem']: item
		});
		if (type === 'time') {
			switch (item.code) {
				case '1':
					buriedPointEvent(manualAudit.order_time_9, {
						s_day: this.state.daySelectedItem.day,
						s_medium: queryData.apptoken ? 'APP' : 'H5'
					});
					break;
				case '2':
					buriedPointEvent(manualAudit.order_time_11, {
						s_day: this.state.daySelectedItem.day,
						s_medium: queryData.apptoken ? 'APP' : 'H5'
					});
					break;
				case '3':
					buriedPointEvent(manualAudit.order_time_13, {
						s_day: this.state.daySelectedItem.day,
						s_medium: queryData.apptoken ? 'APP' : 'H5'
					});
					break;
				case '4':
					buriedPointEvent(manualAudit.order_time_15, {
						s_day: this.state.daySelectedItem.day,
						s_medium: queryData.apptoken ? 'APP' : 'H5'
					});
					break;
				case '5':
					buriedPointEvent(manualAudit.order_time_17, {
						s_day: this.state.daySelectedItem.day,
						s_medium: queryData.apptoken ? 'APP' : 'H5'
					});
					break;
				default:
					break;
			}
		}
	};

	render() {
		const {
			showRulesPannel,
			visibleModal,
			applyDate,
			applyTime,
			today,
			tomorrow,
			scheduledTime,
			daySelectedItem,
			timeSelectedItem
		} = this.state;

		const dayList = [
			{
				code: '0',
				day: today,
				availiable: true
			},
			{
				code: '1',
				day: tomorrow,
				availiable: true
			}
		];

		return (
			<div className={style.remit_ing_page}>
				<div className={style.topImg}>
					<ExamineComponents />
				</div>
				<div className={style.topBox}>
					<div className={style.title}>需要人工审核，耐心等待</div>
					<div className={style.subtitle}>
						{/* <a>0532-5808XXXX</a>的审核电话 */}
						<br />
						至少会拨打3次，最长不超过3个工作日
					</div>
				</div>
				<div className={style.step_box_new}>
					<div className={[style.step_item, style.active].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							放款审核中
						</div>
						<div className={style.line} />
					</div>
					<div className={[style.step_item].join(' ')}>
						<div className={[style.title].join(' ')}>
							<div className={style.step_circle} />
							{!applyDate ? (
								<span
									className={style.order_button}
									onClick={() => {
										this.setState({
											visibleModal: true
										});
										buriedPointEvent(manualAudit.order_button, {
											s_medium: queryData.apptoken ? 'APP' : 'H5'
										});
									}}
								>
									请预约人工审核时间
								</span>
							) : (
								<p style={{ display: 'flex', alignItems: 'center' }}>
									<span className={[style.order_button, style.order_active_button].join(' ')}>
										{applyDate === '0' ? '今天' : applyDate} {applyTime}
									</span>
									<span>人工电话审核</span>
								</p>
							)}
						</div>
						<div className={style.line} />
					</div>
					<div className={[style.step_item].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							短信形式告知您审核结果，审核通过自动放款
						</div>
						<div className={style.line} />
					</div>
				</div>

				<Modal popup className="examine_modal" visible={visibleModal} animationType="slide-up">
					<Icon type="cross" className={style.close_icon} onClick={this.handleClosePannel} />
					<div className={style.title_wrap}>
						<h3 className={style.modalTitle}>
							{showRulesPannel ? '人工审核的预约须知' : '请预约电话审核时间'}
						</h3>
						{!showRulesPannel && (
							<img src={q_icon} className={style.question_icon} onClick={this.showRulesPannel} />
						)}
					</div>
					{showRulesPannel ? (
						<ul className={style.rule_wrap}>
							<li className={style.rule_item}>
								1、已经提交审核的用户，如果需要人工审核，则需要按照自己可以接电话的时间，预约人工审核时间。
							</li>
							<li className={style.rule_item}>2、为保证您能接听到电话，您选择的时段以外也会尝试致电。</li>
							<li className={style.rule_item}> 3、如果不预约，则正常排队审核。</li>
							<li className={style.rule_item}>4、预约了审核时间，确定预约后，则不能取消。</li>
							<li className={style.rule_item}>5、如没有接听，会尝试多次拨打。</li>
							<li className={style.rule_item}>6、最长不超过3个工作日拨打。</li>
						</ul>
					) : (
						<div>
							{/* <p className={style.modalDesc}>预约时间到达前2小时则不能修改预约时间</p> */}
							{/* <p className={style.modalDesc}>
								审核电话为<span>0532-5808XXXX</span>，请注意接听
							</p> */}
							<div>
								<div className={style.options_day}>
									{dayList.map((item) => (
										<span
											className={[
												style.opts_button_day,
												item.code === daySelectedItem.code && style.opts_button_active
											].join(' ')}
											onClick={() => {
												this.handleButtonClick('day', item);
											}}
											key={item.code}
										>
											{item.day}
										</span>
									))}
								</div>
								<div className={style.options_time}>
									{scheduledTime &&
										scheduledTime.map((item) => (
											<div className={style.opts_item} key={item.name}>
												<h3 className={style.opts_title}>{item.name}</h3>
												<div className={style.opts_button_wrap}>
													{item.timeItems.map((item) => (
														<span
															className={[
																style.opts_button,
																item.code === timeSelectedItem.code && style.opts_button_active,
																daySelectedItem.code === '0' && !item.availiable && style.opts_button_disabled
															].join(' ')}
															onClick={() => {
																this.handleButtonClick('time', item);
															}}
															key={item.code}
														>
															{item.time}
														</span>
													))}
												</div>
											</div>
										))}
								</div>
							</div>
						</div>
					)}
					{!showRulesPannel && (
						<SXFButton
							className={timeSelectedItem.code ? style.submitBtn : style.submitBtnDisabled}
							onClick={this.handleSubmitOrder}
						>
							确定预约
						</SXFButton>
					)}
				</Modal>

				<CopyToClipboard text={this.state.copyText} onCopy={() => this.copyOperation()}>
					<ZButton className={style.submitBtn}>关注“还到”公众号</ZButton>
				</CopyToClipboard>
				<div className={style.desctext}>关注还到公众号 实时查看审核进度</div>
			</div>
		);
	}
}
