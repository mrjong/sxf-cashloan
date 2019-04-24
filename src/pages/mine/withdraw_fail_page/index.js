import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import ButtonCustom from 'components/ButtonCustom';

@fetch.inject()
export default class withdraw_fail_page extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
    };
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
          <i className={style.failIco}></i>
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
