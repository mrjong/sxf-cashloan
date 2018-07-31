import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import { Toast } from 'antd-mobile';
import STabs from 'components/tabs';
import FormContent from './form-content';
import style from './index.scss';

const API = {
  USER_INFO: '/my/getRealInfo',
  BANK_LIST_URL: '/my/quickpay/cardList',
};

const tabBar = [
  {
    title: '信用卡',
    value: 'C',
  },
  {
    title: '储蓄卡',
    value: 'D',
  },
];

@fetch.inject()
export default class BindBankCardPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      formtype: 'C',
      userInfo: {
        userName: '张**',
        certNoEnc: '298402938408102312',
      },
      // bankList: [],
    };
  }

  componentWillMount() {
    this.requestUserInfo();
    this.requestBankList();
  }

  handleChangeTabs = (tab, index) => {
    this.setState({
      formtype: tab.value,
    });
  };

  // 获取用户信息
  requestUserInfo = () => {
    this.props.$fetch.post(API.USER_INFO).then(res => {
      if (res.msgCode === 'PTM0000' && res.data !== null) {
        this.setState({
          userInfo: res.data,
        });
      } else {
        Toast.info(res.msgInfo);
      }
    });
  };

  // 获取银行卡列表
  requestBankList = () => {
    this.props.$fetch.post(API.BANK_LIST_URL).then(res => {
      if (res.msgCode === 'PTM0000' && res.data !== null) {
        console.log(res, 'res');
        this.setState({
          bankList: res.data,
        });
      } else {
        Toast.info(res.msgInfo);
      }
    });
  };

  render() {
    const { formtype, userInfo, bankList } = this.state;
    return (
      <div className={style.bind_bank_card_page}>
        <STabs tabTit={tabBar} onChange={this.handleChangeTabs}>
          <FormContent formtype={formtype} userinfo={userInfo} banklist={bankList} />
          <FormContent formtype={formtype} userinfo={userInfo} banklist={bankList} />
        </STabs>
        <p className="protocol_tip" style={{ width: '6.2rem' }}>
          点击“确认绑定”，表示同意
          <a className="protocol_link" href=" ">
            《随行付快捷绑卡支付协议》
          </a>
        </p>
      </div>
    );
  }
}
