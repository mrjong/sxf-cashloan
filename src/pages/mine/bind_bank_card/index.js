import React, { PureComponent } from 'react';
import STabs from 'components/tabs';
import FormContent from './form-content';
import style from './index.scss';

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

export default class BindBankCardPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      formtype: 'C',
    };
  }
  handleChangeTabs = (tab, index) => {
    this.setState({
      formtype: tab.value,
    });
  };

  render() {
    const { formtype } = this.state;
    return (
      <div className={style.bind_bank_card_page}>
        <STabs tabTit={tabBar} onChange={this.handleChangeTabs}>
          <FormContent formtype={formtype} />
          <FormContent formtype={formtype} />
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
