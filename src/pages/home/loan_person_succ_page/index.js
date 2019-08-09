import React, { PureComponent } from 'react';
import style from './index.scss';
import { Modal, Icon } from 'antd-mobile';
import { setBackGround } from 'utils/background';
import ExamineComponents from 'components/ExamineComponents';
import ZButton from 'components/ButtonCustom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { buriedPointEvent } from 'utils/analytins';
import { manualAudit } from 'utils/analytinsType';
import SXFButton from 'components/ButtonCustom';
import q_icon from '../../../assets/images/home/tip_ico.png';

const hhh = [
	{
		key: '上午',
		arr: [
			{
				key: 1,
				value: '10:00-13:00'
			},
			{
				key: 1,
				value: '10:00-13:00'
			}
		]
	},
	{
		key: '中午',

		arr: [
			{
				key: 1,
				value: '10:00-13:00'
			},
			{
				key: 1,
				value: '10:00-13:00'
			}
		]
	},
	{
		key: '下午',

		arr: [
			{
				key: 1,
				value: '10:00-13:00'
			},
			{
				key: 1,
				value: '10:00-13:00'
			},
			{
				key: 1,
				value: '10:00-13:00'
			}
		]
	}
];

@setBackGround('#fff')
export default class remit_ing_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			copyText: '还到',
			showRulesPannel: false,
			visibleModal: false
		};
	}

	componentWillMount() {
		buriedPointEvent(manualAudit.pageview);
	}

	copyOperation = () => {
		buriedPointEvent(manualAudit.follow_button);
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
		this.setState({
			[type + 'item']: item
		});
	};

	handleSubmitOrder = () => {};

	render() {
		const { showRulesPannel, visibleModal } = this.state;
		return (
			<div className={style.remit_ing_page}>
				<div className={style.topImg}>
					<ExamineComponents />
				</div>
				<div className={style.topBox}>
					<div className={style.title}>需要人工审核，耐心等待</div>
					<div className={style.subtitle}>
						<a>010-86355 XXX</a>的审核电话
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
							{true ? (
								<span className={style.order_button} onClick={this.handleClosePannel}>
									请预约人工审核时间
								</span>
							) : (
								<p>
									<span className={[style.order_button, style.order_active_button].join(' ')}>
										今天 08:00-10:00
									</span>
									<span>人工审核电话</span>
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
							{showRulesPannel ? '人工审核的预约须知' : '请预约人工审核时间'}
						</h3>
						{!showRulesPannel && (
							<img src={q_icon} className={style.question_icon} onClick={this.showRulesPannel} />
						)}
					</div>
					{showRulesPannel ? (
						<ul className={style.rule_wrap}>
							<li className={style.rule_item}>
								1、已经提交审核的用户，如果需要人工审核，则需要按照自己可以接电话的时间，预约人工审时间。
							</li>
							<li className={style.rule_item}>2、为保证您能接听到电话，您选择的时段以外也会尝试致电。</li>
							<li className={style.rule_item}> 3、如果不预约，则正常排队审核。</li>
							<li className={style.rule_item}>4、预约了审核时间，确定预约后，则不能取消。</li>
							<li className={style.rule_item}>
								5、人工审核电话为 010-86355 xxx的审核电话，请注意接听。如没有接听，会尝试多次拨打。
							</li>
							<li className={style.rule_item}>6、最长不超过3个工作日拨打。</li>
						</ul>
					) : (
						<div>
							<p className={style.modalDesc}>预约时间到达前2小时则不能修改预约时间</p>
							<div>
								<div className={style.options_day}>
									<span
										className={[style.opts_button_day, style.opts_button_active].join(' ')}
										onClick={() => {
											this.handleButtonClick('day', item);
										}}
									>
										今日
									</span>
									<span
										className={style.opts_button_day}
										onClick={() => {
											this.handleButtonClick('day', item);
										}}
									>
										今日
									</span>
								</div>
								<div className={style.options_time}>
									{hhh.map((item) => (
										<div className={style.opts_item}>
											<h3 className={style.opts_title}>{item.key}</h3>
											<div className={style.opts_button_wrap}>
												{item.arr.map((item) => (
													<span
														className={[style.opts_button, style.opts_button_active].join(' ')}
														onClick={() => {
															this.handleButtonClick('time', item);
														}}
													>
														{item.value}
													</span>
												))}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					<SXFButton
						className={false ? style.submitBtn : style.submitBtnDisabled}
						onClick={this.handleSubmitOrder}
					>
						确定预约
					</SXFButton>
				</Modal>

				<CopyToClipboard text={this.state.copyText} onCopy={() => this.copyOperation()}>
					<ZButton className={style.submitBtn}>关注“还到”公众号</ZButton>
				</CopyToClipboard>
				<div className={style.desctext}>关注还到公众号 实时查看审核进度</div>
			</div>
		);
	}
}
