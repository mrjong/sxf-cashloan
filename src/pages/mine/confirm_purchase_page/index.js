import React, { PureComponent } from 'react';
import { List, DatePicker, InputItem } from 'antd-mobile';
import Cookie from 'js-cookie';
import { createForm } from 'rc-form';
import ButtonCustom from 'components/button';
import CountDownButton from 'components/count_down_button'
import styles from './index.scss';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { getFirstError, handleInputBlur } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { membership } from 'utils/analytinsType';

const API = {
  pay: '/my/quickpay/pay',
  paySms: '/my/quickpay/paySms'
}

@createForm()
@fetch.inject()
export default class confirm_purchase_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      periodValue: '', // 有效期的选中值
      money: '',
      twice: false,
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
  componentWillUnmount() {
    store.removeCardData()
  }
  // 确认购买
  confirmBuy = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.$fetch
          .post(API.pay, {
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
                // 埋点-会员卡购买-确认购买页-确认购买按钮
                buriedPointEvent(membership.confirmBuy, {
                  is_success: true,
                });
                res.msgInfo && this.props.toast.info(res.msgInfo)
                const backUrlData = store.getVipBackUrl();
                Cookie.remove('VIPFlag');
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
                // 埋点-会员卡购买-确认购买页-确认购买按钮
                buriedPointEvent(membership.confirmBuy, {
                  is_success: false,
                  fail_cause: res.msgInfo
                });
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
        this.props.$fetch.post(API.paySms, obj).then(
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
    // 都跳转到选择信用卡的一个页面，然后在里面判断
    this.props.history.push(`/mine/select_credit_page?agrNo=${this.state.agrNo}`);
    // if (this.state.cardTyp === 'C') {
    //   this.props.history.push(`/mine/select_credit_page?agrNo=${this.state.agrNo}`)
    // } else {
    //   this.props.history.push(`/mine/select_save_page?agrNo=${this.state.agrNo}`)
    // }
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
                onBlur={() => {handleInputBlur()}}
                maxLength="3"
                {...getFieldProps('cvv2', {
                  rules: [
                    { required: true, message: '请输入信用卡背后3位数字' },
                    { validator: this.validateAccount },
                  ],
                })}
                placeholder="请输入信用卡背后3位数字"
                onBlur={() => {handleInputBlur()}}
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
              onBlur={() => {handleInputBlur()}}
              maxLength="6"
              {...getFieldProps('yzmCode', {
                rules: [
                  { required: true, message: '请输入正确验证码' },
                ],
              })}
              placeholder="请输入短信验证码"
              onBlur={() => {handleInputBlur()}}
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
          点击“确认绑定”，表示同意<a onClick={() => { this.props.history.push('/protocol/club_vip_service_page') }}>《随行付VIP俱乐部会员服务协议》</a>
        </p>
      </div>
    )
  }
}

