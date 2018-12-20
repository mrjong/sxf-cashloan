import React from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import qs from 'qs';
import dayjs from 'dayjs';

import { Toast } from 'antd-mobile';

const API = {
  couponList: '/coupon/list',
};
@fetch.inject()
export default class Countdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timerCount: this.props.timerCount || 5,
      counting: false,
      selfEnable: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { cb, orderSts, accountNum } = nextProps;
    setTimeout(()=>{
      switch (orderSts) { // 订单状态0：初登记，1：处理中，2：交易成功，3：交易失败，4：撤销
        case '2': // 交易成功
          cb.props.history.replace({pathname: '/mine/withdraw_succ_page', state: { withdrawMoney: accountNum }});
          break;
        case '3': // 交易失败
          cb.props.history.replace('/mine/withdraw_fail_page');
          break;
        default:
          break;
      };
    }, 2000);
  }

  componentWillMount() { 
    this.countDownAction();
  }

  countDownAction = () => {
    let codeTime = this.state.timerCount;
    this.interval = setInterval(() => {
      this.setState({
        timerCount: codeTime--,
      });
      if (codeTime === -1) {
        /* 倒计时结束*/
        this.interval && clearInterval(this.interval);
        cb.props.history.replace('/mine/withdraw_page');
        if (this.props.timerEnd) {
          this.props.timerEnd();
        }
      }
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }
  
  render() {
    const { counting, timerCount, selfEnable } = this.state;
    return (
      <div className={style.Countdown_page}>
        <div className={style.CountdownCont}>
          {timerCount}s
        </div>
      </div>
    );
  }
}
