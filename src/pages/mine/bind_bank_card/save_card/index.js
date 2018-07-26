import React, { PureComponent } from 'react';
import { List, InputItem, Picker, DatePicker, Toast } from 'antd-mobile';
import fetch from 'sx-fetch';
import common from 'utils/common.js';
import ButtonCustom from 'components/button';
import CountDownButton from 'components/CountDownButton';
import styles from '../index.scss';
const { Item } = List;

const VERIFY_CODE_URL = '/user/sendSms';
const BIND_CARD_URL = '/front/card/bindCard';
const USER_INFO = '/front/auth/getUserInfo';
const BANK_LIST = '/front/card/getBankList';

function formatDate(date) {
  const pad = n => (n < 10 ? `0${n}` : n);
  const dateStr = `${date
    .getFullYear()
    .toString()
    .slice(-2)} / ${pad(date.getMonth() + 1)}`;
  return dateStr;
}

@fetch.inject()
export default class SaveCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userName: '张三',
      idCard: '12310802983010172',
      bank: '',
      phoneNo: '',
      verifyCode: '',
    };
  }

  // 确认购买
  confirmBuy = () => {
    alert('点击');
  };
  // 点击开始倒计时
  countDownHandler = fn => {
    fn(true);
  };

  // 选择银行
  handleChangeBank = value => {
    this.setState({
      bank: value,
    });
  };

  // 银行卡号输入
  handleInputBankCardNum = value => {
    this.setState({
      bankCardNo: value,
    });
  };

  // 手机号输入
  handleInputPhoneNo = value => {
    this.setState({
      phoneNo: value,
    });
  };

  // 验证码输入
  handleInputVerifyCode = value => {
    this.setState({
      verifyCode: value,
    });
  };

  // 验证是否选择银行
  verifyBankChoise(value) {
    let isVerify = false;
    if (!value || !value[0]) {
      Toast.info('请选择银行');
      isVerify = false;
    } else {
      isVerify = true;
    }
    return isVerify;
  }

  // 验证银行卡号
  verifyBankNum(value) {
    let isVerify = false;
    if (!value) {
      Toast.info('请输入银行卡号');
      isVerify = false;
    } else if (!common.isAvailableFun.bankCardSimple(value.replace(/\s+/g, ''))) {
      Toast.info('银行卡号不正确');
      isVerify = false;
    } else {
      isVerify = true;
    }
    return isVerify;
  }

  // 验证手机号码
  verifyPhoneNum(value) {
    let isVerify = false;
    if (!value || value.length === 0) {
      Toast.info('手机号码不能为空');
      isVerify = false;
    } else if (!common.isAvailableFun.phone(value.replace(/\s+/g, ''))) {
      Toast.info('手机号码格式不正确');
      isVerify = false;
    } else {
      isVerify = true;
    }
    return isVerify;
  }

  // 验证验证码
  verifyVerifyCode(value) {
    let isVerify = false;
    if (!value) {
      Toast.info('请输入验证码');
      isVerify = false;
    } else {
      isVerify = true;
    }
    return isVerify;
  }

  handleSubmit = () => {
    const { userName, idCard, bank, bankCardNo, phoneNo, verifyCode } = this.state;

    this.verifyBankChoise(bank) &&
      this.verifyBankNum(bankCardNo) &&
      this.verifyPhoneNum(phoneNo) &&
      this.verifyVerifyCode(verifyCode) &&
      this.requestBindBankCard();
  };

  // 绑定银行卡请求
  requestBindBankCard = formData => {
    const { userInfo, smsJrnNo } = this.state;
    const { nameEnc, certNoEnc } = userInfo;
    const { userName, idCard, bank, bankCardNo, phoneNo, verifyCode } = formData;
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
    const { userName, idCard, bank, bankCardNo, phoneNo, verifyCode } = this.state;
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
          <Picker value={bank} extra="请选择银行" cols={1} data={bankList} onChange={this.handleChangeBank}>
            <Item arrow="horizontal">银行</Item>
          </Picker>
          <InputItem
            type="bankCard"
            value={bankCardNo}
            placeholder="请输入银行卡卡号"
            onChange={this.handleInputBankCardNum}
          >
            卡号
          </InputItem>
          <InputItem
            type="phone"
            value={phoneNo}
            placeholder="请输入银行卡预留手机号"
            onChange={this.handleInputPhoneNo}
          >
            手机号
          </InputItem>

          <div className={styles.time_container}>
            <InputItem value={verifyCode} placeholder="请输入短信验证码" onChange={this.handleInputVerifyCode}>
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
