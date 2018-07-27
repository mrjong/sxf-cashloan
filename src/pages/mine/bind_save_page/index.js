import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import { createForm } from 'rc-form';
import { List, InputItem } from 'antd-mobile';
import ButtonCustom from 'components/button';
import CountDownButton from 'components/CountDownButton';
import { validators } from 'utils/validator';
import qs from 'qs';
import styles from './index.scss';

const API = {
  GETUSERINF: '/my/getRealInfo', // 获取用户信息
  GECARDINF: '/cmm/qrycardbin', // 绑定银行卡前,卡片信息查
  BINDCARD: '/withhold/card/bindConfirm', // 绑定银行卡
  GETCODE: '/withhold/card/bindApply', // 绑定银行卡短信验证码获取
};

@fetch.inject()
@createForm()
export default class bind_save_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      enable: true,
    }
  }
  componentWillMount() {
    this.queryUserInf();
  }
  // 获取信用卡信息
  queryUserInf = () => {
    this.props.$fetch.get(API. GETUSERINF).then((result) => {
      if(result.data){
        this.setState({ userName: result.data.usrNm })
      }
    }, (error) => {
      error.msgInfo  && this.props.toast.info(error.msgInfo );
    })
  };

  // 校验储蓄卡卡号
  validateCarNumber = (rule, value, callback) => {
    if (!validators.bankCardNumber(value)) {
      callback('请输入有效银行卡号');
    } else {
      callback();
    }
  };
  // 校验手机号
  validateCarPhone = (rule, value, callback) => {
    if (!validators.phone(value)) {
      callback('请输入银行卡绑定的有效手机号');
    } else {
      callback();
    }
  };
  // 绑卡之前进行校验
  checkCard = (params, values) => {
    this.props.$fetch.post(API. GECARDINF, params).then((result) => {
      const params1 = {
        bankCd: result.bankCd,
        cardTyp: 'D', //卡类型。
        cardNo: values.valueInputCarNumber, //持卡人卡号
        mblNo: values.valueInputCarPhone, //预留手机号
        smsCd: values.valueInputCarSms, //短信验证码
      };
      this.bindSaveCard(params1);
    }, (error) => {
        error.msgInfo && this.props.toast.info(error.msgInfo );
    });
  };
  // 绑定储蓄卡
  bindSaveCard = params1 => {
    this.props.$fetch.post(API.BINDCARD, params1).then((data) => {
      // bindStorageConfirm()
      if ( data.msgCode === 'PTM0000') {
        if(sessionStorage.getItem('storageCardManagement')){
          this.props.history.push('/storageCardManagementOutside')
        }else{
          const agrNo = qs.parse(this.props.location.search, {ignoreQueryPrefix: true}).agrNo
          if (!agrNo) {
            sessionStorage.getItem('storageCardSourceLenderAgain') === 'true' ?
            this.props.history.push('/backConfirmOutside') : this.props.history.push('/homeOutside')
          } else {
            this.props.history.replace(`/chooseStorageBankCardOutside?agrNo=${agrNo}`)
          }
          //storageCardSourceLenderAgain 再次借款标识
        }
      } else {
        this.props.toast.info(data.msgInfo);
        this.setState({ valueInputCarSms: '' });
      }
    });
  };
  // 确认购买
  confirmBuy = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // 参数
        const params = {
          cardNo: values.valueInputCarNumber, //持卡人储蓄卡号
        };
        //判断是否登录
        const token = sessionStorage.getItem('tokenId');
        if (token) {
          this.checkCard(params, values);
        } else {
          this.props.toast.info('请先去登录');
        }
      } else {
        // 如果存在错误，获取第一个字段的第一个错误进行提示
        const keys = Object.keys(err);
        if (keys && keys.length) {
          const errs = err[keys[0]].errors;
          if (errs && errs.length) {
            const errMessage = errs[0].message;
            this.props.toast.info(errMessage);
          }
        }
      }
    });
  };
  // 点击开始倒计时
  countDownHandler = fn => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const params = {
          cardNo: values.valueInputCarNumber, //持卡人储蓄卡号
        };
        this.props.$fetch.post(API.GECARDINF, params).then((result) => {
          if(result.bankCd===null || result.bankCd==='' || result.cardTyp==='C'){
            this.props.toast.info('请输入有效银行卡号')
          }
          else{
            this.props.$fetch.post(API.GETCODE,{
                mblNo: values.valueInputCarPhone,
                bankCd: result.bankCd,
                cardTyp: 'D', //卡类型。
                cardNo: values.valueInputCarNumber, //持卡人卡号
            }).then((result)=> {
                if(result.msgCode !== 'PTM0000'){
                    this.props.toast.info(result.msgInfo)
                    // return false
                } else {
                    // bindStorageGetCode()
                    fn(true);
                }
            },(error)=> {
                error.retMsg  && this.props.toast.info(error.retMsg );
            })
            // return true
          }
        })
      } else {
        // 如果存在错误，获取第一个字段的第一个错误进行提示
        const keys = Object.keys(err);
        if (keys && keys.length) {
          const errs = err[keys[0]].errors;
          if (errs && errs.length) {
            const errMessage = errs[0].message;
            this.props.toast.info(errMessage);
          }
        }
      }
    });
  };

  render() {
    const Item = List.Item;
    const { getFieldProps } = this.props.form;
    return (
      <div className={styles.bind_save_page}>
        <List>
          <Item extra={this.state.userName}>持卡人</Item>
          <InputItem
            {...getFieldProps('valueInputCarNumber', {
              rules: [
                { required: true, message: '请输入有效银行卡号' },
                { validator: this.validateCarNumber },
              ],
            })}
            placeholder="请输入储蓄卡卡号"
          >
            储蓄卡卡号
          </InputItem>
          <InputItem
            {...getFieldProps('valueInputCarPhone', {
              rules: [
                { required: true, message: '请输入银行卡绑定的有效手机号' },
                { validator: this.validateCarPhone },
              ],
            })}
            placeholder="请输入银行卡预留手机号"
          >
            手机号
          </InputItem>
          <div className={styles.time_container}>
            <InputItem
              {...getFieldProps('valueInputCarSms', {
                rules: [
                  { required: true, message: '请输入正确的短信验证码' },
                ],
              })}
              placeholder="请输入短信验证码"
            >
              验证码
            </InputItem>
            <div className={styles.count_btn}>
              <CountDownButton enable={this.state.enable} onClick={this.countDownHandler} timerActiveTitle={['', '"']} />
            </div>
          </div>
        </List>
        <p className={styles.tips}>*储蓄卡将作您的还款银行卡，还款日当天系统将自动扣款</p>
        <ButtonCustom onClick={this.confirmBuy} className={styles.confirm_btn}>确认</ButtonCustom>
        <span className={styles.support_type}>支持银行卡类型</span>
      </div>
    )
  }
}

