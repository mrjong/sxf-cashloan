import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import qs from 'qs';
import dayjs from 'dayjs';
import {setBackGround} from 'utils/Background'
import Countdown from "./components/countdown"

import { Toast } from 'antd-mobile';

let applyNo = ''; // 订单号
let accountNum = ''; // 提现金额
const API = {
  queryOrdSts: '/redAccount/queryOrdSts', // 付款结果查询接口
};
@fetch.inject()
// @setBackGround('#efeff4')
export default class withdrawing_page extends PureComponent {
  constructor(props) {
    super(props);
    if (this.props.history.location.state && this.props.history.location.state.applyNo) {
      applyNo = this.props.history.location.state.applyNo;
    }
    if (this.props.history.location.state && this.props.history.location.state.withdrawMoney) {
      accountNum = this.props.history.location.state.withdrawMoney;
    }
    this.state = {
      orderSts: ''
    };
  }
  componentWillMount() {
    this.getOrdSts();
  }
  componentDidMount() {
    
  }
  componentWillUnmount() {
    
  }

  // 付款结果查询
  getOrdSts = () => {
		this.props.$fetch.post(API.queryOrdSts, {applyNo: applyNo}).then(
			(result) => {
				if (result.msgCode !== 'PTM0000') {
					result.msgInfo && this.props.toast.info(result.msgInfo);
					return;
				}
				if (result && result.data !== null) {
					this.setState({
						orderSts: result.data,
					});
				}
			},
			(err) => {
				err.msgInfo && this.props.toast.info(err.msgInfo);
			}
		);
	};
  
  render() {
    let { orderSts } = this.state;
    return (
      <div className={style.withdrawing_page}>
        <div className={style.withdrawingCont}>
          <Countdown accountNum={accountNum} orderSts={orderSts} cb={this} />
          <div className={style.withdrawMoney}>
            {accountNum}元
          </div>
          <p className={style.withdrawingTip}>
            支付中...
          </p>
        </div>
      </div>
    );
  }
}
