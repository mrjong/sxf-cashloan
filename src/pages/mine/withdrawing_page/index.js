import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import qs from 'qs';
import dayjs from 'dayjs';
import {setBackGround} from 'utils/Background'
import Countdown from "./components/countdown"

import { Toast } from 'antd-mobile';

let applyNo = '';
const API = {
  couponList: '/coupon/list',
};
@fetch.inject()
// @setBackGround('#efeff4')
export default class withdrawing_page extends PureComponent {
  constructor(props) {
    super(props);
    if (this.props.history.location.state && this.props.history.location.state.applyNo) {
      applyNo = this.props.history.location.state.applyNo;
    }
    this.state = {
    };
  }
  componentWillMount() {
    
  }
  componentDidMount() {
    
  }
  componentWillUnmount() {
    
  }

  // 跳转到路由
  jumpRouter = () => {
    // this.props.history.push('/withdraw');
    console.log('计时结束')
  }
  
  render() {
    let { accountNum } = this.state;
    return (
      <div className={style.withdrawing_page}>
        <div className={style.withdrawingCont}>
          <Countdown timerEnd={this.jumpRouter} />
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
