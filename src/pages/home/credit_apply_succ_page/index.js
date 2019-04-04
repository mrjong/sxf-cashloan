import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import successIco from 'assets/images/mine/wallet/success_ico.png';
import ButtonCustom from 'components/ButtonCustom';
import { setBackGround } from 'utils/background'
import { store } from 'utils/store';
import qs from 'qs';

const API = {
  isBankCard: '/my/chkCard', // 是否绑定了银行卡
  chkCredCard: '/my/chkCredCard' // 查询信用卡列表中是否有授权卡
}
let timer = null;
let autId = '';
@fetch.inject()
@setBackGround('#fff')
export default class credit_apply_succ_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentWillMount() {
    const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    autId = query && query.autId;
  }

  componentDidMount() {
    timer = setTimeout(() => {
      this.checkIsBandCard()
    }, 3000)
  }

  componentWillUnmount() {
    clearTimeout(timer)
  }

  // 返回首页
  backHome = () => {
    this.props.history.replace('/home/home');
  }

  // 判断是否绑卡
  checkIsBandCard = () => {
    const api = autId ? `${API.chkCredCard}/${autId}` : API.isBankCard;
    this.props.$fetch.get(api).then((result) => {
      // 跳转至储蓄卡
      if (result && result.msgCode === 'PTM2003') {
        store.setCheckCardRouter('checkCardRouter');
        this.props.toast.info(result.msgInfo);
        store.setBackUrl('/home/home');
        setTimeout(() => {
          this.props.history.replace({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
        }, 3000);
      } else if (result && result.msgCode === 'PTM2002') {
        store.setCheckCardRouter('checkCardRouter');
        this.props.toast.info(result.msgInfo);
        store.setBackUrl('/home/home');
        setTimeout(() => {
          this.props.history.replace({ pathname: '/mine/bind_credit_page', search: `?noBankInfo=true&autId=${autId}` });
        }, 3000);
      }
    });
  }

  render() {
    return (
      <div className={style.credit_apply_succ_page}>
        <div className={style.content}>
          <img src={successIco} className={style.successIco} />
          <div className={style.desc}>
            <p>申请成功</p>
            <p>你已进入快速审核通道，最快3分钟完成审核</p>
          </div>
          <div className={style.tip}>
            温馨提示<br />借款审核通过后，在签约前需要绑定借款信用卡及还款 储蓄卡银行。如果您未绑卡，请点击
          <a className={style.link} onClick={this.checkIsBandCard}>立即绑卡</a>
          </div>
        </div>
        <ButtonCustom className={style.backBtn} onClick={this.backHome}>返回首页</ButtonCustom>
        <p className='bottomTip'>怕逾期，用还到</p>
      </div>
    );
  }
}
