import React, { PureComponent } from 'react';
import Lists from 'components/lists';
import ButtonCustom from 'components/button';
import styles from './index.scss';

export default class bind_credit_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      
    }
  }
  // 确认购买
  confirmBuy = () => {
    alert('点击')
  };

  render() {
    const listsArr = [
      {
        arrowHide: true,
        extra: {
          name: '张三',
          color: '#333333',
        },
        label: {
          name: '持卡人',
        },
      },
      {
        arrowHide: true,
        label: {
          name: '信用卡卡号',
        },
      },
    ];
    return (
      <div className={styles.bind_credit_page}>
        <Lists listsInf={listsArr} className={styles.common_margin} />
        <p className={styles.tips}>借款资金将转入您绑定代信用卡中，请注意查收</p>
        <ButtonCustom onClick={this.confirmBuy} className={styles.confirm_btn}>确认购买</ButtonCustom>
        <span className={styles.support_type}>支持银行卡类型</span>
      </div>
    )
  }
}

