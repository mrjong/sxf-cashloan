import React, { PureComponent } from 'react';
import { List, InputItem } from 'antd-mobile';
import ButtonCustom from 'components/button';
import styles from './index.scss';

export default class bind_credit_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userName: '张三',
    }
  }
  // 确认购买
  confirmBuy = () => {
    alert('点击')
  };

  render() {
    const Item = List.Item;
    return (
      <div className={styles.bind_credit_page}>
        <List>
          <Item extra={this.state.userName}>持卡人</Item>
          <InputItem
            // {...getFieldProps('account', {
            //   // initialValue: 'little ant',
            //   rules: [
            //     { required: true, message: 'Please input account' },
            //     { validator: this.validateAccount },
            //   ],
            // })}
            // clear
            // error={!!getFieldError('account')}
            // onErrorClick={() => {
            //   alert(getFieldError('account').join('、'));
            // }}
            placeholder="请输入信用卡卡号"
          >
            信用卡卡号
          </InputItem>
        </List>
        <p className={styles.tips}>借款资金将转入您绑定代信用卡中，请注意查收</p>
        <ButtonCustom onClick={this.confirmBuy} className={styles.confirm_btn}>确认购买</ButtonCustom>
        <span className={styles.support_type}>支持银行卡类型</span>
      </div>
    )
  }
}

