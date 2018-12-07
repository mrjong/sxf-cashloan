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
