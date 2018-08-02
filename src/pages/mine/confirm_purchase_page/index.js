import React, { PureComponent } from 'react';
import { List, DatePicker, InputItem } from 'antd-mobile';
import { createForm } from 'rc-form';
import ButtonCustom from 'components/button';
import CountDownButton from 'components/CountDownButton'
import styles from './index.scss';
import fetch from 'sx-fetch';
import { store, getFirstError } from 'utils/common';

@createForm()
@fetch.inject()
export default class confirm_purchase_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      periodValue: '', // 有效期的选中值
      money: '',
      twice: true,
      cardTyp: 'C'
    }
  }
  componentWillMount() {
    // 获取缓存
    let paramVip = store.getParamVip('paramVip')
    if (paramVip && paramVip.money) {
      this.setState({
        money: paramVip.money,
        memPrdId: paramVip.memPrdId,
        bankName: paramVip.bankName,
        agrNo: paramVip.agrNo,
        cardTyp: paramVip.cardTyp,
        lastCardNo: paramVip.lastCardNo,
        bankCode: paramVip.bankCode
      })
    }

  }
  // 确认购买
  confirmBuy = () => {
    this.props.form.validateFields((err, values) => {
      console.log(err, values)
      if (!err) {
        this.props.$fetch
          .post("/my/quickpay/pay", {
            userId: "",
            mblNo: "",
            agrNo: this.state.agrNo,
            smsJrnNo: this.state.smsJrnNo,
            smsCd: values.yzmCode,
            txAmt: Number(this.state.money),
            payType: "01",
            memCardNo: this.state.memCardNo
          })
          .then(
            res => {
              if (res.msgCode === "PTM0000" || res.msgCode === "PTM3016") {
                res.msgInfo && this.props.toast.info(res.msgInfo)
                const backUrlData = store.getBackUrl();
                setTimeout(() => {
                  this.props.history.replace(backUrlData)
                }, 3000)
              } else {
                if (this.state.cardTyp === "C") {
                  this.setState({
                    twice: true
                  })
                }
                this.setState({
                  yzmCode: ""
                })
                res.msgInfo && this.props.toast.info(res.msgInfo)
              }
            },
            err => {
              console.log(err)
            }
          )
      } else {
        this.props.toast.info(getFirstError(err));
      }
    })
  };
  // 获取验证码
  countDownHandler = fn => {
    this.props.form.validateFields((err, values) => {
      if (err && err.yzmCode) {
        delete err.yzmCode
      }
      const obj = {
        userId: "",
        mblNo: "",
        agrNo: this.state.agrNo,
        txAmt: Number(this.state.money),
        payType: "01",
        memPrdId: this.state.memPrdId
      }
      if (this.state.twice && this.state.cardTyp === 'C') {
        obj.expDt = this.formatDate(values.expDt).replace(/\s+/g, '')
        obj.cvv2 = values.cvv2
      }
      if (!err || JSON.stringify(err) === '{}') {
        this.props.$fetch.post("/my/quickpay/paySms", obj).then(
          res => {
            if (res.msgCode === "PTM0000") {
              this.props.toast.info('发送成功');
              fn(true);
              this.setState({
                smsJrnNo: res.data.smsJrnNo
              })
            } else {
              res.msgInfo && this.props.toast.info(res.msgInfo)
            }
          },
          err => {
            console.log(err)
          }
        )
      } else {
        this.props.toast.info(getFirstError(err));
      }
    })
  };

  // 支付银行卡点击
  handleCardItemClick = () => {
    store.setBackUrl('/mine/confirm_purchase_page');
    if (this.state.cardTyp === 'C') {
      this.props.history.push(`/mine/select_credit_page?agrNo=${this.state.agrNo}`)
    } else {
      this.props.history.push(`/mine/select_save_page?agrNo=${this.state.agrNo}`)
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
          <Item
            extra={`${this.state.bankName}(${this.state.lastCardNo})`}
            arrow="horizontal"
            onClick={this.handleCardItemClick}
          >
            支付银行卡
              </Item>
          <Item extra={`${this.state.money}元`}>支付金额</Item>
          {
            this.state.twice && this.state.cardTyp === "C" ? <div>
              <InputItem
                type="number"
                maxLength="3"
                {...getFieldProps('cvv2', {
                  rules: [
                    { required: true, message: '请输入信用卡背后3位数字' },
                    { validator: this.validateAccount },
                  ],
                })}
                placeholder="请输入信用卡背后3位数字"
              >
                安全码
         </InputItem>
              <DatePicker
                mode="month"
                title="选择有效期"
                {...getFieldProps('expDt', {
                  rules: [
                    { required: true, message: '请选择有效期' }
                  ],
                })}
                extra={<span style={{ color: '#C7C6CC' }}>年／月</span>}
                format={val => this.formatDate(val)}
              >
                <Item arrow="horizontal">有效期</Item>
              </DatePicker>
            </div> : null
          }
          <div className={styles.time_container}>
            <InputItem
              type="number"
              maxLength="6"
              {...getFieldProps('yzmCode', {
                rules: [
                  { required: true, message: '请输入短信验证码' },
                ],
              })}
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

