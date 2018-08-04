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
import qs from 'qs';
const { Item } = List;

const API = {
  BANK_LIST_URL: '/rcm/qrySurportBank', // 0104-银行卡列表查询(通用)
  VERIFY_CODE_URL: '/my/quickpay/signSms', // 0307-会员卡购买-快捷支付获取验证码
  BIND_CARD_URL: '/my/quickpay/sign', // 0308-会员卡购买-快捷支付验证码确认
};

function formatDate(date) {
  const pad = n => (n < 10 ? `0${n}` : n);
  const dateStr = `${pad(date.getMonth() + 1)} / ${date
    .getFullYear()
    .toString()
    .slice(-2)}`;
  return dateStr;
}

@fetch.inject()
@createForm()
export default class CreditCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      smsJrnNo: '', // 短信流水号
      bankList: [],
    };
  }

  static propTypes = {
    children: PropTypes.node,
    formtype: PropTypes.string,
    userinfo: PropTypes.object,
    history: PropTypes.object,
    handledismiss: PropTypes.func,
  };

  static defaultProps = {
    children: '',
    formtype: 'C',
    userinfo: {},
    history: {},
    handledismiss: () => {
      console.log('picker 取消事件');
    },
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
      callback('请输入正确的银行卡号');
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
      callback('请输入正确的手机号');
    } else {
      callback();
    }
  };

  // 验证验证码
  verifyVerifyCode = (rule, value, callback) => {
    if (value && value.length !== 6) {
      callback('请输入正确验证码');
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
          smsJrnNo: result.data.payMsgId,
          agrNo: result.data.agrNo,
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
          // 如果第一次没有绑卡就是replace，其他情况都是goback
          const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
          if (queryData && queryData.firstBind) {
            this.props.history.replace('/mine/confirm_purchase_page');
          } else {
            // this.props.history.replace('/mine/confirm_purchase_page');
            this.props.history.goBack();
          }
        } else {
          Toast.info(result.msgInfo);
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
            onVisibleChange={value => {
              this.props.handledismiss(value);
            }}
            {...getFieldProps('bank', {
              rules: [{ required: true, message: '请选择银行' }, { validator: this.verifyBankChoise }],
            })}
          >
            <Item arrow="horizontal">银行</Item>
          </Picker>
          <InputItem
            placeholder="请输入银行卡卡号"
            maxLength="24"
            type="number"
            {...getFieldProps('bankCardNo', {
              rules: [{ required: true, message: '请输入正确的银行卡号' }, { validator: this.verifyBankNum }],
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
              extra={<div style={{ color: '#C7C6CC' }}>月 / 年</div>}
              format={val => formatDate(val)}
              onVisibleChange={value => {
                this.props.handledismiss(value);
              }}
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
              rules: [{ required: true, message: '请输入正确的手机号' }, { validator: this.verifyPhoneNum }],
            })}
          >
            手机号
          </InputItem>

          <div className={styles.time_container}>
            <InputItem
              maxLength="6"
              type="number"
              {...getFieldProps('verifyCode', {
                rules: [{ required: true, message: '请输入正确验证码' }, { validator: this.verifyVerifyCode }],
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
