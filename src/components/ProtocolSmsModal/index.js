/*
 * @Author: shawn
 * @LastEditTime: 2020-02-24 11:45:07
 */
import React from 'react';
import styles from './index.scss';
import dayjs from 'dayjs';
import { Modal } from 'antd-mobile';
import { ButtonCustom } from 'components';
import { bank_card_protocol_info } from 'fetch/api';
import { handleInputBlur, recordContract } from 'utils';
import { base64Decode } from 'utils/CommonUtil/toolUtil';
import { setIframeProtocolShow } from 'reduxes/actions/commonActions';
import { connect } from 'react-redux';

let timer = null;
@connect(
	(state) => state,
	{ setIframeProtocolShow }
)
export default class ProtocolSmsModal extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			times: 60
		};
	}

	componentWillMount() {
		this.startCountDown();
	}

	componentWillUnmount() {
		this.clearCountDown();
	}

	smsCodeAgain = () => {
		if (this.state.times > 0) return;
		this.setState(
			{
				times: 60
			},
			() => {
				//重新获取
				this.startCountDown();
				this.props.smsCodeAgain();
			}
		);
	};

	handleChange = (e) => {
		if (e.target.value.length > 6) {
			e.target.value = e.target.value.slice(0, 6);
		}
		this.props.onSmsCodeChange(e.target.value);
	};

	//倒计时
	startCountDown = () => {
		let times = this.state.times;
		timer = setInterval(() => {
			this.setState({
				times: times--
			});
			if (times < 0) {
				this.clearCountDown();
			}
		}, 1000);
	};

	clearCountDown = () => {
		clearInterval(timer);
	};

	// 协议支付协议预览
	readProtocol = () => {
		const { fetch, toast } = this.props;
		const params = {
			cardNoCpt: ''
		};
		fetch.post(bank_card_protocol_info, params).then((result) => {
			if (result && result.code === '000000' && result.data !== null) {
				//敏感信息密文改明文
				const list = result.data.bankList.map((item) => ({
					cardNo: base64Decode(item.cardNo),
					bankName: item.bankName
				}));
				const data = {
					name: base64Decode(result.data.name),
					idNo: base64Decode(result.data.idNo),
					bankList: list,
					dateTime: dayjs(result.data.dateTime).format('YYYY年MM月DD日')
				};
				this.props.setIframeProtocolShow({
					url: 'delegation_withhold_page',
					contractInf: data
				});
			} else {
				toast.info(result.message);
			}
		});
	};

	confirmHandler = () => {
		const { onConfirm, bankNo } = this.props;
		// cardNo为银行卡号
		// contractType 为协议类型 01为用户注册协议 02为用户隐私协议 03为用户协议绑卡,用户扣款委托书
		recordContract({
			cardNo: bankNo,
			contractType: '03'
		});
		onConfirm();
	};

	render() {
		const { times } = this.state;
		const {
			onCancel,
			smsCode,
			toggleBtn,
			selectBankCard,
			protocolSmsFailFlag,
			protocolSmsFailInfo,
			bnkTelNoHid
		} = this.props;
		return (
			<Modal visible={true} transparent maskClosable={false} className={styles.antModal}>
				{protocolSmsFailFlag ? (
					<div className={styles.smsModal_error}>
						<p className={styles.smsModal_error_info}>
							还款银行卡异常：{protocolSmsFailInfo && `${protocolSmsFailInfo};`}请联系客服或更换还款银行卡。
						</p>
						<div className={styles.button_box}>
							<div className={styles.button_wrap}>
								<span
									className={[styles.button, styles.exit].join(' ')}
									onClick={() => {
										onCancel();
									}}
								>
									关闭
								</span>
								<span
									className={styles.button}
									onClick={() => {
										selectBankCard();
									}}
								>
									更换银行卡
								</span>
							</div>
						</div>
					</div>
				) : (
					<div className={styles.modalWrap}>
						<div className={styles.main}>
							{/* <Icon type="cross" color="#868E9E" className={styles.closeIcon} /> */}
							<h3 className={styles.head}>验证手机号</h3>
							<p className={styles.desc}>已发送短信验证码到手机</p>
							<p className={styles.phone}>{bnkTelNoHid}</p>
							<div className={styles.smsCode}>
								<input
									type="number"
									placeholder="请输入短信验证码"
									value={smsCode}
									onChange={this.handleChange}
									onBlur={() => {
										handleInputBlur();
									}}
									pattern="[0-9]*"
								/>
								{times ? (
									<span className={styles.time}>{times + 's'}后重试</span>
								) : (
									<span onClick={this.smsCodeAgain} className={styles.again}>
										重新获取验证码
									</span>
								)}
							</div>
							<div className={styles.bottom}>
								{toggleBtn ? (
									[
										<ButtonCustom onClick={onCancel} key="1" className={styles.skipButton}>
											跳过,直接还款
										</ButtonCustom>,
										<ButtonCustom onClick={this.confirmHandler} key="2" className={styles.smallButton}>
											确定
										</ButtonCustom>
									]
								) : (
									<ButtonCustom onClick={this.confirmHandler} className={styles.largeButton}>
										确定
									</ButtonCustom>
								)}
							</div>
						</div>
						<p className={styles.tip} onClick={this.readProtocol}>
							温馨提示：为资金安全考虑需进行短信校验，验证完成即视为同意《绑卡声明》约定扣款
						</p>
					</div>
				)}
			</Modal>
		);
	}
}
