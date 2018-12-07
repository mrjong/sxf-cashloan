import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import qs from 'qs';
import dayjs from 'dayjs';
import WalletBg from 'assets/images/mine/wallet/wallet_bg.png';
import rightArrow from 'assets/images/mine/wallet/right_arrow.png'
import ButtonCustom from 'components/button';

const API = {
  couponList: '/coupon/list',
};
@fetch.inject()
export default class wallet_page extends PureComponent {
  constructor(props) {
    super(props);
    const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });

    this.state = {
      accountNum: '50',
      showMoudle: false,
    };
  }
  componentWillMount() {
    
  }
  componentDidMount() {
    
  }
  componentWillUnmount() {
    
  }
  // 点击提现
  withdrawHandler = () =>{
    this.setState({
      showMoudle: true,
    });
  }
  // 跳转到收入
  goIncome = () => {
    this.props.history.push('/mine/income_page');
  }
  // 跳转到提现
  goWithdraw = () => {
    this.props.history.push('/mine/withdraw_page');
  }
  
  render() {
    let { accountNum, showMoudle } = this.state;
    return (
      <div className={style.wallet_page}>
        <img src={WalletBg} className={style.walletBg}/>
        <div className={style.walletTitle}>
          <span className={style.leftPart}><i></i>当前账户余额</span>
          <span className={style.rightPart}>去赚钱</span>
        </div>
        <div className={style.walletCont}>
          <p className={style.money}><span>{accountNum}</span>元</p>
          <p className={style.tips}>累计可提现金额</p>
        </div>
        <ButtonCustom className={style.withdrawBtn} onClick={this.withdrawHandler}>提现</ButtonCustom>
        <div className={style.entryBox}>
          <span className={style.income} onClick={this.goIncome}>收入<img src={rightArrow} className={style.rightArrow}/></span>
          <span className={style.divideLine}></span>
          <span className={style.withdraw} onClick={this.goWithdraw}>提现<img src={rightArrow} className={style.rightArrow}/></span>
        </div>
      </div>
    );
  }
}
