import React from 'react';
import PropTypes from 'prop-types';
import BankCard from '../BankCard';
import { store } from 'utils/store';
import { Icon } from 'antd-mobile';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import style from './index.scss';
import iconArrow from 'assets/images/home/icon_arrow_right.png';
import SXFButton from 'components/ButtonCustom';
const API = {
	CARD_AUTH: '/auth/cardAuth', // 0404-信用卡授信
	CRED_CARD_COUNT: '/index/usrCredCardCount' // 授信信用卡数量查询
};

export default class BankContent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			messageTag: ''
		};
	}

	static propTypes = {
		className: PropTypes.string,
		children: PropTypes.node,
		history: PropTypes.object,
		contentData: PropTypes.object,
		fetch: PropTypes.object
	};

	static defaultProps = {
		className: '',
		children: '',
		history: {},
		contentData: {},
		fetch: {}
	};

	componentWillMount() {
		const messageTag = store.getNotShowTip();
		this.setState({
			messageTag
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
		this.props.fetch
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
        console.log(key)
		this.setState({
			messageTag: key
        });
        store.setNotShowTip(key);
	};
	render() {
		const { messageTag } = this.state;
		const { className, children, contentData, progressNum, toast, history, ...restProps } = this.props;
		const { indexSts, indexData } = contentData;
		const showEntranceArr = [ 'LN0002', 'LN0003', 'LN0006', 'LN0008' ];
		const showEntranceArr2 = [ 'LN0001', 'LN0004', 'LN0007', 'LN0009', 'LN0010' ];
		let tipText = '';
		if (
			(indexSts === 'LN0001' && (!messageTag || messageTag !== '50000')) ||
			(!indexSts && (!messageTag || messageTag !== '50000'))
		) {
			tipText = (
				<div className={style.abnormal_tip_box}>
					<p className={style.abnormal_tip}>
						最高代还金额 ￥50000
						<Icon
							onClick={() => {
								this.closeTip('50000');
							}}
							size="sm"
							style={{ width: '.3rem', height: '.3rem' }}
							className={style.closeIcon}
							type="cross"
						/>
						<div className={style.triangle_border_down}>
							<span />
						</div>
					</p>
				</div>
			);
		} else if (indexSts === 'LN0010' && (!messageTag || messageTag !== 'error')) {
			tipText = (
				<div className={style.abnormal_tip_box}>
					<p className={style.abnormal_tip}>
						点击更新账单，获取最新信用卡信息
						<Icon
							onClick={() => {
								this.closeTip('error');
							}}
							size="sm"
							style={{ width: '.3rem', height: '.3rem' }}
							className={style.closeIcon}
							type="cross"
						/>
						<div className={style.triangle_border_down}>
							<span />
						</div>
					</p>
				</div>
			);
		} else if (indexSts === 'LN0003' && progressNum && (!messageTag || messageTag !== 'step')) {
			let html = '';
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
					<p className={style.abnormal_tip}>
						<div dangerouslySetInnerHTML={{ __html: html }} />
						<Icon
							onClick={() => {
								this.closeTip('step');
							}}
							size="sm"
							style={{ width: '.3rem', height: '.3rem' }}
							className={style.closeIcon}
							type="cross"
						/>
						<div className={style.triangle_border_down}>
							<span />
						</div>
					</p>
				</div>
			);
		}
		return (
			<div className={style.bank_content_wrap} {...restProps}>
				<BankCard contentData={contentData} history={history} toast={toast} {...indexData}>
					{tipText}
					{children}
					{indexSts === 'LN0010' ? (
						<SXFButton className={style.smart_button_two} onClick={this.requestCredCardCount}>
							帮我还，其他信用卡账单
						</SXFButton>
					) : null}
					{showEntranceArr.includes(indexSts) ? (
						<button className={style.link_tip} onClick={this.requestCredCardCount}>
							帮我还，其他信用卡账单
							<img className={style.link_arrow_img} src={iconArrow} alt="" />
						</button>
					) : null}
					{showEntranceArr2.includes(indexSts) ? <div className={style.subDesc}>安全绑卡，放心还卡</div> : null}
				</BankCard>
			</div>
		);
	}
}
