import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import qs from 'qs';
import dayjs from 'dayjs';
import failIco from 'assets/images/mine/wallet/fail_ico.png';
import {setBackGround} from 'utils/Background'
import ButtonCustom from 'components/button';

import { Toast } from 'antd-mobile';

@fetch.inject()
// @setBackGround('#efeff4')
export default class withdraw_fail_page extends PureComponent {
  constructor(props) {
    super(props);
    const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });

    this.state = {
    };
  }
  componentWillMount() {
    
  }
  componentDidMount() {
    
  }
  componentWillUnmount() {
    
  }
  // 重新提现
  backHome = () => {
    // this.props.history.replace('/wallet');
    this.props.history.goBack();
  }
  
  render() {
    return (
      <div className={style.withdraw_fail_page}>
        <div className={style.withdrawFailCont}>
          <img src={failIco} className={style.failIco}/>
          <div className={style.failTip}>
            提现失败
          </div>
          <p className={style.contactWays}>
          联系客服
          <a className={style.tel} href="tel:400-088-7626">
            400-088-7626
          </a>
          </p>
        </div>
        <ButtonCustom className={style.backBtn} onClick={this.backHome}>重新提现</ButtonCustom>
      </div>
    );
  }
}
