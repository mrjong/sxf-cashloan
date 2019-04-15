import React from 'react';
import PropTypes from 'prop-types';
import BankCard from '../BankCard';
import { store } from 'utils/store';
import { Icon } from 'antd-mobile';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import style from './index.scss';
import fetch from 'sx-fetch';
import iconArrow from 'assets/images/home/icon_arrow_right.png';
import SXFButton from 'components/ButtonCustom';
import dayjs from 'dayjs';

const API = {
	CARD_AUTH: '/auth/cardAuth', // 0404-信用卡授信
	CRED_CARD_COUNT: '/index/usrCredCardCount' // 授信信用卡数量查询
};
@fetch.inject()
export default class BankContent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			MessageTag50000: '',
			MessageTagError: '',
			MessageTagStep: '',
			MessageTagLimitDate: '', // 额度有效期标识
		};
	}

	static propTypes = {
		className: PropTypes.string,
		children: PropTypes.node,
		history: PropTypes.object,
		fetch: PropTypes.object
	};

	static defaultProps = {
		className: '',
		children: '',
		history: {},
		fetch: {}
	};

	componentWillMount() {
		const MessageTag50000 = store.getMessageTag50000();
		const MessageTagError = store.getMessageTagError();
		const MessageTagStep = store.getMessageTagStep();
		const MessageTagLimitDate = store.getMessageTagLimitDate(); // 额度有效期标识
		this.setState({
			MessageTag50000,
			MessageTagError,
			MessageTagStep,
			MessageTagLimitDate, // 额度有效期标识
		});
	}

	// 代还其他信用卡点击事件
	repayForOtherBank = (count) => {
		if (count > 1) {
			store.setBackUrl('/home/home');
			const { contentData } = this.props;
			this.props.history.push({
				pathname: '/mine/credit_list_page',
				search: `?autId=${contentData.indexSts === 'LN0010' ? '' : contentData.indexData.autId}`
			});
		} else {
			//   this.goToMoXie();
			this.goToNewMoXie();
		}
	};
	// 跳新版魔蝎
	goToNewMoXie = () => {
		const { contentData } = this.props;
		store.setBackUrl('/home/home');
		store.setMoxieBackUrl(
			`/mine/credit_list_page?autId=${contentData.indexSts === 'LN0010' ? '' : contentData.indexData.autId}`
		);
		this.props.history.push({ pathname: '/home/moxie_bank_list_page' });
	};

	// 请求信用卡数量
	requestCredCardCount = () => {
		// 埋点-首页-点击代还其他信用卡
		buriedPointEvent(home.repayOtherCredit);
		this.props.$fetch
			.post(API.CRED_CARD_COUNT)
			.then((result) => {
				if (result && result.msgCode === 'PTM0000') {
					this.repayForOtherBank(result.data.count);
				} else {
					this.props.toast.info(result.msgInfo);
				}
			})
			.catch((err) => {
				this.props.toast.info(err.message);
			});
	};
	closeTip = (key) => {
		console.log(key);
		this.setState({
			[key]: key
		});
		let key2 = 'set' + key;
		store[key2](key);
	};
	render() {
		const { MessageTag50000, MessageTagError, MessageTagStep, MessageTagLimitDate, } = this.state;
		const {
			className,
			children,
			contentData,
			showDefaultTip,
			progressNum,
			toast,
			handleMoxie,
			history,
			...restProps
		} = this.props;
		const { indexSts, indexData } = contentData;
		const showEntranceArr = [ 'LN0003' ]; // 暂时去掉LN0006 和 LN0008两个状态下的代还其他信用卡入口
		const showEntranceArr2 = [ 'LN0001', 'LN0002', 'LN0004', 'LN0005', 'LN0006', 'LN0007', 'LN0008', 'LN0009', 'LN0010' ];
		// 比较额度有效期是否早于当前时间，如果早于则不显示气泡
		const isShowTips = parseFloat(dayjs(new Date()).format('YYYYMMDD')) - parseFloat(indexData && indexData.acOverDt) <= 0;
		let tipText = '';
		if (handleMoxie) {
			this.requestCredCardCount();
		}
		if (
			(indexSts === 'LN0001' || (!indexSts && showDefaultTip)) &&
			(!MessageTag50000 || MessageTag50000 !== 'MessageTag50000')
		) {
			tipText = (
				<div className={style.abnormal_tip_box}>
					<div className={style.abnormal_tip}>
						最高代偿金额 ￥50000
						<Icon
							onClick={() => {
								this.closeTip('MessageTag50000');
							}}
							size="sm"
							style={{ width: '.3rem', height: '.3rem' }}
							className={style.closeIcon}
							type="cross"
						/>
						<div className={style.triangle_border_down}>
							<span />
						</div>
					</div>
				</div>
			);
		} else if (
			(indexSts === 'LN0010' ||
				((indexSts === 'LN0003' || indexSts === 'LN0006' || indexSts === 'LN0008') &&
					(!contentData.indexData ||
						!contentData.indexData.autSts ||
						contentData.indexData.autSts === '3'))) &&
			(!MessageTagError || MessageTagError !== 'MessageTagError')
		) {
			tipText = (
				<div className={style.abnormal_tip_box}>
					<div className={style.abnormal_tip}>
						点击更新账单，获取最新信用卡信息
						<Icon
							onClick={() => {
								this.closeTip('MessageTagError');
							}}
							size="sm"
							style={{ width: '.3rem', height: '.3rem' }}
							className={style.closeIcon}
							type="cross"
						/>
						<div className={style.triangle_border_down}>
							<span />
						</div>
					</div>
				</div>
			);
		} else if (
			progressNum &&
			((indexSts === 'LN0003' || indexSts === 'LN0006' || indexSts === 'LN0008') &&
				(contentData.indexData && contentData.indexData.autSts && contentData.indexData.autSts === '2')) &&
			(!MessageTagStep || MessageTagStep !== 'MessageTagStep')
		) {
            let html = '';
            console.log(progressNum,'-----------')
			switch (Number(progressNum)) {
				case 3:
					html = `帮我还卡，只需<span>${progressNum}</span>步`;
					break;
				case 2:
					html = `还差<span>${progressNum}</span>步，就可以帮我还卡了`;
					break;
				case 1:
					html = `只差最后<span>${progressNum}</span>步，就可以帮我还卡了`;
					break;

				default:
					break;
			}

			tipText = (
				<div className={style.abnormal_tip_box}>
					<div className={style.abnormal_tip}>
						<div dangerouslySetInnerHTML={{ __html: html }} />
						<Icon
							onClick={() => {
								this.closeTip('MessageTagStep');
							}}
							size="sm"
							style={{ width: '.3rem', height: '.3rem' }}
							className={style.closeIcon}
							type="cross"
						/>
						<div className={style.triangle_border_down}>
							<span />
						</div>
					</div>
				</div>
			);
		} else if (
			((indexSts === 'LN0006' || indexSts === 'LN0008') &&
				(contentData.indexData && contentData.indexData.autSts && contentData.indexData.autSts === '2')) &&
			(!MessageTagLimitDate || MessageTagLimitDate !== 'MessageTagLimitDate') && isShowTips
		) {
			tipText = (
				<div className={style.abnormal_tip_box}>
					<div className={style.abnormal_tip}>
						额度有效期至{dayjs(indexData && indexData.acOverDt).format('YYYY年MM月DD日')}
						<Icon
							onClick={() => {
								this.closeTip('MessageTagLimitDate');
							}}
							size="sm"
							style={{ width: '.3rem', height: '.3rem' }}
							className={style.closeIcon}
							type="cross"
						/>
						<div className={style.triangle_border_down}>
							<span />
						</div>
					</div>
				</div>
			);
		}
		return (
			<div className={style.bank_content_wrap} {...restProps}>
				<BankCard contentData={contentData} history={history} toast={toast} {...indexData}>
					{tipText}
					{children}
					{indexSts === 'LN0010' ||
					indexSts === 'LN0002' ||
					((indexSts === 'LN0003' || indexSts === 'LN0006' || indexSts === 'LN0008') &&
						(indexData && indexData.autSts !== '2')) ? (
						<SXFButton className={style.smart_button_two} onClick={this.requestCredCardCount}>
							帮我还，其他信用卡账单
						</SXFButton>
					) : null}
					{showEntranceArr.includes(indexSts) && indexData && indexData.autSts === '2' ? (
						<button className={style.link_tip} onClick={this.requestCredCardCount}>
							帮我还，其他信用卡账单
							<img className={style.link_arrow_img} src={iconArrow} alt="" />
						</button>
					) : null}
					{showEntranceArr2.includes(indexSts) || (indexData && indexData.autSts !== '2') ? (
						<div className={style.subDesc}>安全绑卡，放心还卡</div>
					) : null}
				</BankCard>
			</div>
		);
	}
}
