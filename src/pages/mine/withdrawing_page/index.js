import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
// import {setBackGround} from 'utils/Background'
import Countdown from "./components/countdown"

let applyNo = ''; // 订单号
let accountNum = ''; // 提现金额

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
  
  render() {
    return (
      <div className={style.withdrawing_page}>
        <div className={style.withdrawingCont}>
          <Countdown accountNum={accountNum} applyNo={applyNo} cb={this} />
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
