import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { List, InputItem, Picker, DatePicker, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';
import fetch from 'sx-fetch';
import { validators } from 'utils/validator';
import { store, getFirstError } from 'utils/common';
import ButtonCustom from 'components/button';
import CountDownButton from 'components/CountDownButton';
import styles from '../index.scss';
const { Item } = List;

const API = {
  BANK_LIST_URL: '/rcm/qrySurportBank', // 0104-银行卡列表查询(通用)
  VERIFY_CODE_URL: '/my/quickpay/signSms', // 0307-会员卡购买-快捷支付获取验证码
  BIND_CARD_URL: '/my/quickpay/sign', // 0308-会员卡购买-快捷支付验证码确认
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
      idCard: '12310802983010172',
      bank: '',
      safeCode: '',
      validityDate: '',
      phoneNo: '',
      verifyCode: '',
      smsJrnNo: '', // 短信流水号
      bankList: [],
    };
  }

  static propTypes = {
    children: PropTypes.node,
    formtype: PropTypes.string,
    userinfo: PropTypes.object,
    history: PropTypes.object,
  };

  static defaultProps = {
    children: '',
    formtype: 'C',
    userinfo: {},
    history: {},
  };

  // 确认购买
  confirmBuy = () => {
    alert('点击');
  };

  componentWillMount() {
    this.requestBankList({
      cardTyp: this.props.formtype,
      corpBusTyp: '31',
    });
  }

  // 获取银行卡列表
  requestBankList = params => {
    this.props.$fetch.post(API.BANK_LIST_URL, params).then(res => {
      if (res.msgCode === 'PTM0000' && res.data !== null) {
        const formatData = res.data.map(item => ({
          value: item.bankCd,
          label: item.bankNm,
          ...item,
        }));
        this.setState({
          bankList: formatData,
        });
      } else {
        Toast.info(res.msgInfo);
      }
    });
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

  // 验证安全码为数字
  verifyNumber = (rule, value, callback) => {
    if (!validators.number(value)) {
      callback('格式不对，请输入数字');
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

  // 点击发送验证码
  countDownHandler = fn => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.requestVerifyCode(fn);
      } else {
        let errorFieldList = [];
        for (let i in err) {
          errorFieldList.push(i);
        }
        // 这里必须通过长度限制，因为 for 循环不保证顺序
        if (errorFieldList.length === 1 && errorFieldList[0] === 'verifyCode') {
          this.requestVerifyCode(fn);
        } else {
          Toast.info(getFirstError(err));
        }
      }
    });
  };

  // 发送验证码
  requestVerifyCode = fn => {
    const { formtype, userinfo } = this.props;
    const { getFieldsValue } = this.props.form;
    const formData = getFieldsValue();
    const { bank, validityDate, bankCardNo, phoneNo, safeCode } = formData;
    let params = {
      mblNo: phoneNo,
      cardNo: bankCardNo,
      bankCd: bank[0],
      cardTyp: formtype,
    };
    if (formtype === 'C') {
      params.cvv2 = safeCode;
      params.expDt = formatDate(validityDate).replace(/\s+/g, '');
    }
    this.props.$fetch.post(API.VERIFY_CODE_URL, params).then(result => {
      if (result && result.msgCode === 'PTM0000') {
        this.setState({
          smsJrnNo: result.data.smsJrnNo,
          agrNo: result.data.smsJrnNo,
        });
        fn(true);
      } else {
        Toast.info(result.msgInfo);
      }
    })
  };

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.requestBindBankCard();
      } else {
        Toast.info(getFirstError(err));
      }
    });
  };

  // 绑定银行卡请求
  requestBindBankCard = () => {
    const { smsJrnNo } = this.state;
    const { getFieldsValue } = this.props.form;
    const formData = getFieldsValue();
    const { verifyCode } = formData;
    const params = {
      smsCd: verifyCode, // 短信验证码
      smsJrnNo, // 短信流水号
    };
    this.props.$fetch.post(API.BIND_CARD_URL, params).then(
      result => {
        if (result && result.msgCode === 'PTM0000') {
          // TODO: 保存数据给下个页面
          this.passDataToNextPage();
          this.props.history.push('/mine/confirm_purchase_page');
        } else {
          Toast.info(result.msg);
        }
      },
      err => {
        console.log(err);
      },
    );
  };

  // 保存数据给下个页面
  passDataToNextPage = () => {
    const { formtype } = this.props;
    const { bankList, agrNo } = this.state;
    const { getFieldsValue } = this.props.form;
    const formData = getFieldsValue();
    const { bank, bankCardNo } = formData;
    let paramVip = store.getParamVip() || {};
    const passParams = {
      // money: paramVip.money,
      // memPrdId: 'paramVip.memPrdId',
      bankName: bankList.filter(item => item && item.value === bank[0])[0].label,
      agrNo,
      cardTyp: formtype,
      lastCardNo: bankCardNo.slice(-4),
      bankCode: bankList.filter(item => item && item.value === bank[0])[0].value,
    };
    Object.assign(paramVip, passParams);
    store.setParamVip(paramVip);
  };

  render() {
    const { bankList } = this.state;
    const { formtype, userinfo } = this.props;
    const { getFieldProps } = this.props.form;
    return (
      <div className={styles.bind_bank_card_child}>
        <List>
          <InputItem value={userinfo.usrNm} editable={false}>
            姓名
          </InputItem>
          <InputItem value={userinfo.idNoHid} editable={false}>
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
            type="number"
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
              type="number"
              {...getFieldProps('safeCode', {
                rules: [
                  { required: true, message: '请输入信用卡背后3位数字' },
                  { validator: this.verifyNumber },
                  { validator: this.verifySafeCode },
                ],
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
            type="number"
            {...getFieldProps('phoneNo', {
              rules: [{ required: true, message: '请输入银行卡预留手机号' }, { validator: this.verifyPhoneNum }],
            })}
          >
            手机号
          </InputItem>

          <div className={styles.time_container}>
            <InputItem
              maxLength="6"
              type="number"
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
