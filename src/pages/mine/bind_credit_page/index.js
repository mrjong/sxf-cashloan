import React from 'react';
import parentComponent from 'pages/common/parentComponent';
import Lists from 'components/lists';
import ButtonCustom from 'components/button';
import styles from './index.scss';

export default class BindCreditPage extends parentComponent {
  constructor(props) {
    super(props);
    this.state = {
      userPhone: '152****6273'
    }
  }

  logout = () => {
    alert('退出')
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
      <div className={styles.creditContainer}>
        <Lists listsInf={listsArr} className={styles.commonMargin} />
        <p className={styles.tips}>借款资金将转入您绑定代信用卡中，请注意查收</p>
        <ButtonCustom onClick={this.handleButtonClick} className={styles.confirmBtn}>确认购买</ButtonCustom>
        <span className={styles.supportType}>支持银行卡类型</span>
      </div>
    )
  }
}

