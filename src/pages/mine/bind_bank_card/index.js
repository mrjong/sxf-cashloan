import React, { PureComponent } from 'react';
import STabs from 'components/tabs';
import CreditCard from './credit_card';
import SaveCard from './save_card';
import style from './index.scss';

export default class BindBankCardPage extends PureComponent {
  render() {
    const tabBar = [
      {
        title: '信用卡',
      },
      {
        title: '储蓄卡',
      },
    ];
    return (
      <div className={style.bind_bank_card_page}>
        <STabs tabTit={tabBar}>
          <CreditCard />
          <SaveCard />
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
