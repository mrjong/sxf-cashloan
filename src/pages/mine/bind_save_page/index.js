import React, { PureComponent } from 'react';
import { List, InputItem } from 'antd-mobile';
import ButtonCustom from 'components/button';
import styles from './index.scss';

export default class bind_save_page extends PureComponent {
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
      <div className={styles.bind_save_page}>
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
            placeholder="请输入储蓄卡卡号"
          >
            储蓄卡卡号
          </InputItem>
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
            placeholder="请输入银行卡预留手机号"
          >
            手机号
          </InputItem>
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
            placeholder="请输入短信验证码"
          >
            验证码
          </InputItem>
        </List>
        <p className={styles.tips}>*储蓄卡将作您的还款银行卡，还款日当天系统将自动扣款</p>
        <ButtonCustom onClick={this.confirmBuy} className={styles.confirm_btn}>确认</ButtonCustom>
        <span className={styles.support_type}>支持银行卡类型</span>
      </div>
    )
  }
}

