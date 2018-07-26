import React, { PureComponent } from 'react';
import { List, Picker, DatePicker, InputItem } from 'antd-mobile';
import { createForm } from 'rc-form';
import ButtonCustom from 'components/button';
import CountDownButton from 'components/CountDownButton'
import styles from './index.scss';

@createForm()
export default class confirm_purchase_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      cardData: [], // 支付银行卡的数据
      cardVisible: false, // 联系人是否显示
      cardValue: [], // 选中的银行卡
      periodValue: '', // 有效期的选中值
      payMoney: '158.00',
    }
  }
  // 确认购买
  confirmBuy = () => {
    alert('点击')
  };
  // 点击开始倒计时
  countDownHandler = fn => {
    fn(true);
  };

  // 获取item中支付银行卡显示用的label
  getCardLabel = () => {
    const { cardData, cardValue } = this.state;
    return cardValue.map(item => {
      const rel = cardData.find(it => it.value === item);
      if (rel) return rel.name;
    });
  };

  // 支付银行卡点击
  handleCardItemClick = () => {
    let { cardData, cardValue } = this.state;
    this.setState({ cardVisible: true });
    if (!cardData || !cardData.length) return;

    if (!cardValue || !cardValue.length) {
      const firstProv = cardData[0];
      cardValue = [firstProv.value];
      this.setState({ cardValue });
    }
  };
  // 格式化显示有效期
  formatDate = date => {
    const pad = n => {
      return n < 10 ? `0${n}` : n;
    };
    const yearStr = `${date.getFullYear()}`.substring(2);
    const dateStr = `${yearStr}／${pad(date.getMonth() + 1)}`;
    return dateStr;
  }

  render() {
    const Item = List.Item;
    const { getFieldProps } = this.props.form;
    return (
      <div className={styles.confirm_purchase_page}>
        <List>
          <Picker
            title="选择支付银行卡"
            cols={1}
            data={[
              { value: '01', label: '招商银行' },
              { value: '02', label: '工商银行' },
              { value: '03', label: '建设银行' },
              { value: '04', label: '北京银行' },
            ]}
            {...getFieldProps('bankCard', {
              initialValue: this.state.cardValue,
            })}
          >
            <Item
              extra={this.getCardLabel()}
              arrow="horizontal"
              onClick={this.handleCardItemClick}
            >
              支付银行卡
              </Item>
          </Picker>
          <Item extra={`${this.state.payMoney}元`}>支付金额</Item>
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
            placeholder="请输入信用卡背后3位数字"
          >
            安全码
          </InputItem>
          <DatePicker
            mode="month"
            title="选择有效期"
            extra={<span style={{ color: '#C7C6CC' }}>年／月</span>}
            value={this.state.periodValue}
            onChange={date => this.setState({ periodValue: date })}
            format={val => this.formatDate(val)}
          >
            <Item arrow="horizontal">有效期</Item>
          </DatePicker>
          <div className={styles.time_container}>
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
            <div className={styles.count_btn}>
              <CountDownButton enable={`${true}`} onClick={this.countDownHandler} timerActiveTitle={['', '"']} />
            </div>
          </div>
        </List>
        <ButtonCustom onClick={this.confirmBuy} className={styles.confirm_btn}>确认购买</ButtonCustom>
        <p className={styles.tips}>
          点击“确认绑定”，表示同意<a href="">《随行付会员服务协议》</a>
        </p>
      </div>
    )
  }
}

