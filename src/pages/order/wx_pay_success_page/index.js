import React, { Component } from 'react';
import qs from 'qs';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import ButtonCustom from 'components/ButtonCustom';
import { store } from 'utils/store';
import Blanks from 'components/Blank';
import { getDeviceType } from 'utils';
import { setH5Channel, getH5Channel } from 'utils/common';
import styles from './index.scss'
const API = {
	qryDtl: '/bill/qryDtl'
};
@fetch.inject()
export default class wx_middle_page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			orderData: ''
		};
	}
	componentWillMount() {
		this.getLoanInfo();
	}
	// 获取还款信息
	getLoanInfo = () => {
		this.props.$fetch
			.post(API.qryDtl, {
				billNo: store.getBillNo()
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					for (let index = 0; index < res.data.perdList.length; index++) {
						const element = res.data.perdList[index];
						if (res.data.perdNum == element.perdNum) {
							this.setState({
								orderData: element
							});

							break;
						}
					}
					if (res.data.perdList[res.data.perdList.length - 1].perdSts === '4') {
						store.setWxPayEnd(true);
					} else {
						store.setWxPayEnd(false);
					}
				} else {
					this.props.toast.info(res.msgInfo);
				}
			});
	};

	render() {
    const { isShowTipsModal } = this.state;
    const listsArr = [
      // {
      //   extra: {
      //     name: this.state.memberInf.status,
      //     color: this.state.memberInf.color,
      //   },
      //   label: {
      //     name: '会员卡',
      //     icon: require('assets/images/mine/menu_ico7.png')
      //   },
      //   jumpToUrl: '/mine/membership_card_page',
      // },
      {
        // extra: {
        //   name: this.state.memberInf.status,
        //   color: this.state.memberInf.color,
        // },
        label: {
          name: '优惠劵',
          className: styles.coupon_page
        },
        arrowHide:true,
        jumpToUrl: '/mine/coupon_page',
      },
      {
        label: {
          name: '我的钱包',
          className: styles.wallet_page
        },
        arrowHide:true,
        jumpToUrl: '/mine/wallet_page',
      },
    ];
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		return (
			<div className={styles.repayment_succ_page}>
				<div className={styles.tips}>
					<i className={styles.success_ico} />
					<p>还款成功</p>
				</div>
        <div>
        <div className={styles.box}>
          <div className={styles.item}>
            <span className={styles.title}>还款金额</span>
            <span className={styles.money}>1400.00</span>
          </div>
          <div className={styles.item}>
            <span className={styles.title}>还款金额</span>
            <span className={styles.money}>1400.00</span>
          </div>
        </div>
        </div>
				{/* <div className={styles.details}>
					<p>借款金额：{this.state.orderSuccess.billPrcpAmt}元</p>
					<p>
						借款期限：{this.state.orderSuccess.perdLth}
						{this.state.orderSuccess.perdUnit === 'M' ? '个月' : '天'}
					</p>
					<p>申请借款日期：{this.state.orderSuccess.billRegDt}</p>
				</div> */}
				<ButtonCustom
					onClick={() => {
						this.backHome(order.returnHome);
					}}
					className={styles.back_btn}
				>
					返回首页
				</ButtonCustom>
			</div>
		);
	}
}
