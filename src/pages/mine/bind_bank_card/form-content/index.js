import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { List, InputItem, Picker, DatePicker, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';
import fetch from 'sx-fetch';
import { validators } from 'utils/validator';
import { getFirstError } from 'utils/common';
import ButtonCustom from 'components/button';
import CountDownButton from 'components/CountDownButton';
import styles from '../index.scss';
const { Item } = List;

const API = {
  VERIFY_CODE_URL: '/quickpay/paySms', // 0309-会员卡购买-快捷支付获取验证码
  BIND_CARD_URL: '/my/quickpay/pay', // 0310-会员卡购买-快捷支付验证码确认
};

function formatDate(date) {
  const pad = n => (n < 10 ? `0${n}` : n);
  const dateStr = `${date
    .getFullYear()
    .toString()
    .slice(-2)} / ${pad(date.getMonth() + 1)}`;
  return dateStr;
}

@fetch.inject()
@createForm()
export default class CreditCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userName: '张三',
      idCard: '12310802983010172',
      bank: '',
      safeCode: '',
      validityDate: '',
      phoneNo: '',
      verifyCode: '',
      smsJrnNo: '', // 短信流水号
    };
  }

  static propTypes = {
    children: PropTypes.node,
    formtype: PropTypes.string,
  };

  static defaultProps = {
    children: '',
    formtype: '信用卡',
  };

  // 确认购买
  confirmBuy = () => {
    alert('点击');
  };

  // 验证是否选择银行
  verifyBankChoise = (rule, value, callback) => {
    if (!value || !value[0]) {
      callback('请选择银行');
    } else {
      callback();
    }
  };

  // 验证银行卡号
  verifyBankNum = (rule, value, callback) => {
    if (!validators.bankCardNumber(value)) {
      callback('银行卡号不正确');
    } else {
      callback();
    }
  };

  // 验证安全码
  verifySafeCode = (rule, value, callback) => {
    if (value && value.length !== 3) {
      callback('安全码格式不对，为三位');
    } else {
      callback();
    }
  };

  // 验证有效期
  verifyValidityDate(value) {
    let isVerify = false;
    if (!value) {
      Toast.info('请选择有效期');
      isVerify = false;
    } else {
      isVerify = true;
    }
    return isVerify;
  }

  // 验证手机号码
  verifyPhoneNum = (rule, value, callback) => {
    if (!validators.phone(value)) {
      callback('手机号码格式不正确');
    } else {
      callback();
    }
  };

  // 验证验证码
  verifyVerifyCode = (rule, value, callback) => {
    if (value && value.length !== 6) {
      callback('验证码格式不正确');
    } else {
      callback();
    }
  };

  handleSubmit = () => {
    const { userName, idCard, bank, bankCardNo, safeCode, validityDate, phoneNo, verifyCode } = this.state;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log(values, 'values');
      } else {
        Toast.info(getFirstError(err))
      }
    })
  };

  // 点击发送验证码
  countDownHandler = fn => {
    this.requestVerifyCode(fn);
  };

  // 发送验证码
  requestVerifyCode = fn => {
    const { getFieldsValue } = this.props.form;
    const formData = getFieldsValue();
    const { phoneNo } = formData;
    const params = {
      phoneNo
    };
    this.props.$fetch.get(API.VERIFY_CODE_URL).then(result => {
      if (result && result.msgCode === 'PTM0000') {
        console.log(result, 'result');
        this.setState({
          smsJrnNo: result.data,
        });
        fn(true);
      } else {
        Toast.info(result.msgInfo);
      }
    })
  };

  // 绑定银行卡请求
  requestBindBankCard = formData => {
    const { userInfo, smsJrnNo } = this.state;
    const { nameEnc, certNoEnc } = userInfo;
    const { userName, idCard, bank, bankCardNo, safeCode, validityDate, phoneNo, verifyCode } = formData;
    const params = {
      name: userName, // 姓名密文
      certNo: certNoEnc, // 身份证号密文
      cardNo: bankCardNum.replace(/\s+/g, ''), // 卡号
      mblNo: phoneNum.replace(/\s+/g, ''), // 手机号
      checkCode: verifyCode, // 验证码
      bankCode: bank[0], // 银行代码
      smsJrnNo, // 短信流水号
    };
    this.props.$fetch.post(BIND_CARD_URL, params).then(
      result => {
        if (result && result.data !== null) {
          console.log(result.data, 'result.data');
        } else {
          Toast.info(result.msg);
        }
      },
      err => {
        console.log(err);
      },
    );
  };

  render() {
    const { userName, idCard, bank, bankCardNo, safeCode, validityDate, phoneNo, verifyCode } = this.state;
    const { formtype } = this.props;
    const { getFieldProps } = this.props.form;
    const bankList = [
      {
        label: '招商',
        value: '11',
      },
      {
        label: '建设',
        value: '22',
      },
    ];
    return (
      <div className={styles.bind_bank_card_child}>
        <List>
          <InputItem value={userName} editable={false}>
            姓名
          </InputItem>
          <InputItem value={idCard} editable={false}>
            身份证
          </InputItem>
          <Picker
            extra="请选择银行"
            cols={1}
            data={bankList}
            {...getFieldProps('bank', {
              rules: [{ required: true, message: '请选择银行' }, { validator: this.verifyBankChoise }],
            })}
          >
            <Item arrow="horizontal">银行</Item>
          </Picker>
          <InputItem
            placeholder="请输入银行卡卡号"
            maxLength="25"
            {...getFieldProps('bankCardNo', {
              rules: [{ required: true, message: '请输入银行卡卡号' }, { validator: this.verifyBankNum }],
            })}
          >
            卡号
          </InputItem>

          {formtype === 'C' ? (
            <InputItem
              placeholder="请输入信用卡背后3位数字"
              maxLength="3"
              {...getFieldProps('safeCode', {
                rules: [{ required: true, message: '请输入信用卡背后3位数字' }, { validator: this.verifySafeCode }],
              })}
            >
              安全码
            </InputItem>
          ) : null}

          {formtype === 'C' ? (
            <DatePicker
              mode="month"
              title="选择日期"
              extra="年／月"
              format={val => formatDate(val)}
              {...getFieldProps('validityDate', {
                rules: [{ required: true, message: '请选择日期' }],
              })}
            >
              <List.Item arrow="horizontal">有效期</List.Item>
            </DatePicker>
          ) : null}

          <InputItem
            placeholder="请输入银行卡预留手机号"
            maxLength="11"
            {...getFieldProps('phoneNo', {
              rules: [{ required: true, message: '请输入银行卡预留手机号' }, { validator: this.verifyPhoneNum }],
            })}
          >
            手机号
          </InputItem>

          <div className={styles.time_container}>
            <InputItem
              maxLength="6"
              {...getFieldProps('verifyCode', {
                rules: [{ required: true, message: '请输入短信验证码' }, { validator: this.verifyVerifyCode }],
              })}
            >
              验证码
            </InputItem>
            <div className={styles.count_btn}>
              <CountDownButton enable={`${true}`} onClick={this.countDownHandler} timerActiveTitle={['', '"']} />
            </div>
          </div>
        </List>
        <ButtonCustom onClick={this.handleSubmit} className={styles.confirm_btn}>
          确认
        </ButtonCustom>
      </div>
    );
  }
}
