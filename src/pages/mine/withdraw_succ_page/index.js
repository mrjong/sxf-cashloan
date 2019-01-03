import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import qs from 'qs';
import successIco from 'assets/images/mine/wallet/success_ico.png';
import ButtonCustom from 'components/ButtonCustom';

let accountNum = '';
@fetch.inject()
export default class withdraw_succ_page extends PureComponent {
  constructor(props) {
    super(props);
    const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });

    if (this.props.history.location.state && this.props.history.location.state.withdrawMoney) {
      accountNum = this.props.history.location.state.withdrawMoney;
    }

    this.state = {}
  }
  // 返回首页
  backHome = () => {
    // this.props.history.replace('/wallet');
    this.props.history.goBack();
  }
  
  render() {
    return (
      <div className={style.withdraw_succ_page}>
        <div className={style.withdrawSuccCont}>
          <img src={successIco} className={style.successIco}/>
          <div className={style.withdrawMoney}>
            {accountNum}元
          </div>
          <p>恭喜您，提现成功</p>
        </div>
        <ButtonCustom className={style.backBtn} onClick={this.backHome}>返回首页</ButtonCustom>
      </div>
    );
  }
}
