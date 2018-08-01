import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import { Toast } from 'antd-mobile';
import STabs from 'components/tabs';
import FormContent from './form-content';
import style from './index.scss';

const API = {
  USER_INFO: '/my/getRealInfo', // 0204-绑定银行卡前,用户信息获取
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
      userInfo: {},
    };
  }

  componentWillMount() {
    this.requestUserInfo();
  }

  // 获取用户信息
  requestUserInfo = () => {
    this.props.$fetch.get(API.USER_INFO).then(res => {
      if (res.msgCode === 'PTM0000' && res.data !== null) {
        this.setState({
          userInfo: res.data,
        });
      } else {
        Toast.info(res.msgInfo);
      }
    });
  };

  render() {
    const { userInfo } = this.state;
    const { history } = this.props;
    return (
      <div className={style.bind_bank_card_page}>
        <STabs tabTit={tabBar} onChange={this.handleChangeTabs}>
          <FormContent formtype="C" userinfo={userInfo} history={history} />
          <FormContent formtype="D" userinfo={userInfo} history={history} />
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