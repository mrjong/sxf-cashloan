import React, { PureComponent } from 'react';
import ButtonCustom from 'components/ButtonCustom';
import fetch from "sx-fetch";
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { order } from 'utils/analytinsType';
// import 'utils/noRouterBack'
import styles from './index.scss';

const API = {
  qryDtl: "/bill/qryDtl",
  payback: '/bill/payback',
  couponCount: '/bill/doCouponCount', // 后台处理优惠劵抵扣金额
  protocolSms: '/withhold/protocolSms', // 校验协议绑卡
  protocolBind: '/withhold/protocolBink', //协议绑卡接口
  fundPlain: '/fund/plain', // 费率接口
  payFrontBack: '/bill/payFrontBack', // 用户还款新接口
}
@fetch.inject()

export default class overdue_progress_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      
    }
  }
  componentWillMount() {
    let test = store.getOrderSuccess()
    if (test) {
      let orderSuccess = test
      this.setState({
        orderSuccess
      })
    }
  }

  // 返回首页
  backHome = () => {
    this.props.history.goBack()
  }

  render() {
    const { isShowTipsModal } = this.state;
    return (
      <div className={styles.overdue_progress_page}>
        
      </div>
    )
  }
}

