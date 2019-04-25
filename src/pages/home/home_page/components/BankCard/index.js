import React from 'react';
import PropTypes from 'prop-types';
import fetch from 'sx-fetch';
import dayjs from 'dayjs';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import style from './index.scss';
// import AnimationCount from 'react-count-animation';
// import 'react-count-animation/dist/count.min.css';
@fetch.inject()
export default class BankCard extends React.PureComponent {
	static propTypes = {
		className: PropTypes.string,
		children: PropTypes.node,
		bankIcon: PropTypes.string,
		bankName: PropTypes.string,
		bankNo: PropTypes.string,
		cardNoHid: PropTypes.string,
		cardBillDt: PropTypes.string,
		billDt: PropTypes.string,
		cardBillAmt: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
		overDt: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
		onClick: PropTypes.func
	};

	static defaultProps = {
		className: '',
		children: '',
		bankIcon: '',
		bankName: '',
		bankNo: '',
		cardNoHid: '',
		cardBillDt: '----/--/--',
		billDt: '----/--/--',
		cardBillAmt: '---',
		overDt: '----/--/--',
		onClick: () => {}
	};

	handleUpdate = () => {
		const { indexSts = '' } = this.props.contentData;
		if (indexSts === 'LN0009') {
			this.props.toast.info('您有未结清的账单，暂时不能更新');
		} else {
			// this.applyCardRepay();
			this.goToNewMoXie();
		}
	};
	// 跳新版魔蝎
	goToNewMoXie = () => {
		buriedPointEvent(home.updateBill);
		store.setMoxieBackUrl('/home/home');
		this.props.history.push({ pathname: '/home/moxie_bank_list_page' });
	};

	render() {
		const { children, contentData, bankName, bankNo, cardNoHid, billDt, cardBillAmt, overDt, billRemainAmt, cardBillSts } = this.props;
		const noNeedUpdateArr = [ 'LN0006', 'LN0007', 'LN0008', 'LN0009', 'LN0010' ]; // 不需要更新账单的状态
		const iconClass = bankNo ? `bank_ico_${bankNo}` : 'logo_ico';
		let overDtStr = '----/--/--';
		if (overDt === '----/--/--') {
			overDtStr = `<span class="blod">${overDt}</span>`;
		} else if (overDt > 0) {
			overDtStr = `<span class="blod">${overDt}</span>天 后到期`;
		} else if (parseInt(overDt, 10) === 0) {
			overDtStr = '<span class="blod">今天到期</span>';
		} else if (overDt < 0) {
			overDtStr = `<span class="blod">已到期</span>`;
		}
		const billDtData =
			billDt === '----/--/--' || billDt === null ? '----/--/--' : dayjs(billDt).format('YYYY/MM/DD');
        let cardBillAmtData = '';
        if (cardBillSts === '01' && Number(cardBillAmt)<=0) {
			cardBillAmtData = '已结清'
		}else if (cardBillSts === '02' && !noNeedUpdateArr.includes(contentData.indexSts)) {
			cardBillAmtData = '待更新'
		} else {
			if (billRemainAmt === 0 || billRemainAmt) {
				cardBillAmtData = parseFloat(billRemainAmt, 10).toFixed(2)
			} else if(cardBillAmt === '---' || cardBillAmt === null) {
				cardBillAmtData = '---';
			} else {
				cardBillAmtData = parseFloat(cardBillAmt, 10).toFixed(2)
			}
		}
		
		const settings = {
			start: 0,
			count: cardBillAmtData,
			duration: 3000,
			decimals: 2,
			useGroup: true,
			animation: 'up'
		};
		return (
			<div className={style.billBox}>
				<div className={style.billBox2}>
					<div className={style.title}>
						{contentData.indexSts && contentData.indexSts !== 'LN0001' ? '我的信用卡账单' : '信用卡账单'}
						<div className={style.fr}>
							{contentData.indexSts === 'LN0002' ||
							((contentData.indexSts === 'LN0003') &&
								(contentData.indexData &&
									contentData.indexData.autSts &&
									contentData.indexData.autSts === '1')) ? (
								<button className={style.bill_update_btn}>更新中</button>
							) : contentData.indexSts 
							&& (contentData.indexSts === 'LN0003'
							|| contentData.indexSts === 'LN0005'
							|| contentData.indexSts === 'LN0010')
							 ? (
								<button className={style.bill_update_btn} onClick={this.handleUpdate}>
									更新账单
								</button>
							) : (
								''
							)}
						</div>
					</div>
					<div className={style.money}>
						<div className={style.moneyLine}>
							{cardBillAmtData !== '---' ? (
								// <AnimationCount {...settings} />
								cardBillAmtData
							) : (
								<div className={style.noneMoney}>
									<span />
									<span />
									<span />
									<span />
									<span />
									<div className={style.greencircle} />
									<span />
									<span />
								</div>
							)}
						</div>
					</div>
					<div className={style.subTitle}>剩余应还金额(元)</div>
					<div className={style.timeBox}>
						<div className={style.time}>
							{' '}
							<span className={style.noStyle}>账单日</span> <span className="blod">{billDtData}</span>
						</div>
						<div className={style.desc}>
							<span className={style.noStyle}>还款日</span>{' '}
							<span dangerouslySetInnerHTML={{ __html: overDtStr }} />
						</div>
					</div>
					<div className={style.bankBox}>
						<span className={[ 'bank_ico', iconClass, `${style.bankIcon}` ].join(' ')} />
						<span className={style.bankName}>
							<span className={style.noStyle}>{bankName ? bankName : '随行付_还到'}</span>
						</span>
						<span className={style.bankNum}>
							<span className={style.noStyle}>{cardNoHid ? cardNoHid : '**** **** **** ****'}</span>
						</span>
					</div>
					<div>{children}</div>
				</div>
			</div>
		);
	}
}
