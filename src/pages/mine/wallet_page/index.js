import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import qs from 'qs';
import dayjs from 'dayjs';
import WalletBg from 'assets/images/mine/wallet/wallet_bg.png';
import rightArrow from 'assets/images/mine/wallet/right_arrow.png'
import ButtonCustom from 'components/button';
import { Modal } from 'antd-mobile';
import { store } from 'utils/store';

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
      money: '50',
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

  // 选择银行卡
  selectBank = () => {
    store.setBackUrl('/mine/wallet_page');
    this.props.history.push(`/mine/select_save_page?agrNo=${this.state.bankInfo && this.state.bankInfo.agrNo || this.state.billDesc && this.state.billDesc.wthCrdAgrNo}`);
  }
  
  render() {
    let { accountNum, showMoudle, money } = this.state;
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
        <Modal popup visible={showMoudle} onClose={() => { this.setState({ showMoudle: false }) }} animationType="slide-up">
          <div className={style.modal_box}>
            <div className={style.modal_title}>提现到银行卡<i onClick={() => { this.setState({ showMoudle: false }) }}></i></div>
            <div className={`${style.modal_flex} ${style.with_border}`}>
              <span className={style.modal_label}>提现金额</span><span className={style.modal_value}>{money}元</span>
            </div>
            <div className={style.modal_flex} onClick={this.selectBank}>
              <div className={style.bank_info}>
                {/* {
                  this.state.bankInfo && this.state.bankInfo.bankName ? <span>{this.state.bankInfo.bankName}({this.state.bankInfo.lastCardNo})</span> : <span>{billDesc && billDesc.wthdCrdCorpOrgNm}({billDesc && billDesc.wthdCrdNoLast})</span>
                } */}
                <span className={`bank_ico bank_ico_${'BOC'}`}></span>
                {/* <span className={`bank_ico bank_ico_${item.bankCd}`}></span> */}
                <span className={style.bank_name}>招商银行(16666)</span>
              </div>
              <i></i>
            </div>
            <ButtonCustom onClick={this.handleClickConfirm} className={style.modal_btn}>
              确定
            </ButtonCustom>
          </div>
        </Modal>
      </div>
    );
  }
}
