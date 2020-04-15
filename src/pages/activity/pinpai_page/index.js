import React, { PureComponent } from 'react';
import qs from 'qs';
import styles from './index.scss';
import btn_bg from './img/btn_bg.png';
import intro_box from './img/intro_box.png';
import intro_img from './img/intro_img.png';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
import SmsAlert from '../components/SmsAlert';
import Alert_mpos from 'pages/mpos/mpos_no_realname_alert_page';

export default class funsisong_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isSelProtocal: true
		};
	}

	componentWillMount() {}

	componentDidMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData.entry) {
			buriedPointEvent(activity.brandEntry, {
				entry: queryData.entry
			});
		}
	}

	// 跳转协议
	go = (url) => {
		this.props.history.push(`/protocol/${url}`);
	};

	// 进入首页
	goHomePage = () => {
		this.props.history.push('/home/home');
	};

	// 还到体验
	joinNow = () => {
		buriedPointEvent(activity.brandBtnClick);
		if (!this.state.isSelProtocal) {
			this.props.toast.info('请先勾选协议');
			return;
		}
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData.appId && queryData.token) {
			this.child.validateMposRelSts({
				smsProps_disabled: true,
				loginProps_disabled: true,
				loginProps_needLogin: true,
				otherProps_type: 'home'
			});
		} else {
			this.setState({
				showLoginTip: true
			});
		}
	};

	onRef = (ref) => {
		this.child = ref;
	};

	checkAgreement = () => {
		this.setState({
			isSelProtocal: !this.state.isSelProtocal
		});
	};

	closeTip = () => {
		this.setState({
			showLoginTip: false
		});
	};

	render() {
		const { showLoginTip, isSelProtocal, showBoundle } = this.state;
		return (
			<div className={styles.pinpai}>
				<SmsAlert
					onRef={this.onRef}
					goSubmitCb={{
						PTM0000: () => {
							this.goHomePage();
						},
						URM0008: () => {},
						others: (res) => {
							this.props.toast.info(res.msgInfo);
						}
					}}
					goLoginCb={{
						PTM0000: () => {
							this.goHomePage();
						},
						URM0008: () => {},
						others: (res) => {
							this.props.toast.info(res.msgInfo);
						}
					}}
					validateMposCb={{
						PTM9000: () => {
							this.props.history.replace('/mpos/mpos_ioscontrol_page');
						},
						others: () => {
							this.setState({
								showBoundle: true
							});
						}
					}}
					chkAuthCb={{
						authFlag0: () => {},
						authFlag1: () => {
							this.goHomePage();
						},
						authFlag2: () => {
							// this.props.toast.info('暂无活动资格');
						},
						others: () => {}
					}}
					doAuthCb={{
						authSts00: () => {
							this.goHomePage();
						},
						others: () => {}
					}}
				/>
				<img src={btn_bg} onClick={this.joinNow} className={styles.entryBtn} alt="按钮" />
				<div className={styles.descBox}>
					<h3>还到</h3>
					<p>随行付金融旗下的移动互联网金融产品，提供信用卡余额代偿服务。</p>
					<p>
						由随行付金融开发和运营，为有需求的信用卡用户提供匹配账单的智能还信用卡服务，高效便捷、准时到账。
					</p>
					<p>持卡人可以通过本平台在线完成授信审批，贷款汇入持卡人指定的信用卡中，直接完成信用卡还款。</p>
				</div>
				<img src={intro_img} className={styles.proIntro} alt="产品介绍" />
				<img src={intro_box} className={styles.proDesc} alt="产品介绍" />
				<div className={styles.protocolBox}>
					<i
						className={isSelProtocal ? styles.checked : `${styles.checked} ${styles.nochecked}`}
						onClick={this.checkAgreement}
					/>
					<span className={styles.specailColor}>阅读并接受</span>
					<span
						onClick={() => {
							this.go('register_agreement_page');
						}}
					>
						《随行付金融用户注册协议》
					</span>
					<span
						onClick={() => {
							this.go('user_privacy_page');
						}}
					>
						《用户隐私权政策》
					</span>
				</div>
				{showLoginTip && (
					<div className={styles.modal}>
						<div className={styles.mask}></div>
						<div className={[styles.modalWrapper, styles.tipWrapper].join(' ')}>
							<div className={styles.tipText}>
								<span>小主～</span>
								<br />
								<span>先去登录才能参与活动哦～</span>
							</div>
							<div className={styles.closeBtn} onClick={this.closeTip}></div>
						</div>
					</div>
				)}
				{showBoundle ? <Alert_mpos /> : null}
			</div>
		);
	}
}
