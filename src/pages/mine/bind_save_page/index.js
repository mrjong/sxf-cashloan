import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import { createForm } from 'rc-form';
import { List, InputItem, Toast } from 'antd-mobile';
import ButtonCustom from 'components/button';
import CountDownButton from 'components/CountDownButton';
import { validators } from 'utils/validator';
import qs from 'qs';
import styles from './index.scss';

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
    this.props.$fetch.get(`/my/getRealInfo`).then((result) => {
        this.setState({ userName: result.data.usrNm })
    }, (error) => {
        error.msgInfo  && Toast.info(error.msgInfo );
    })
  }

  // 校验储蓄卡卡号
  validateCarNumber = (rule, value, callback) => {
    if (!validators.bankCardNumber(value)) {
      callback('请输入合法的持卡人卡号');
    } else {
      callback();
    }
  };
  // 校验手机号
  validateCarPhone = (rule, value, callback) => {
    if (!validators.phone(value)) {
      callback('请输入合法的手机号');
    } else {
      callback();
    }
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
          this.props.$fetch.post(`/cmm/qrycardbin`, params).then((result) => {
              const params1 = {
                bankCd: result.bankCd,
                cardTyp: 'D', //卡类型。
                cardNo: values.valueInputCarNumber, //持卡人卡号
                mblNo: values.valueInputCarPhone, //预留手机号
                smsCd: values.valueInputCarSms, //短信验证码
              };
              this.props.$fetch.post(`/withhold/card/bindConfirm`, params1).then((data) => {
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
                  Toast.info(data.msgInfo);
                  this.setState({ valueInputCarSms: '' });
                }
              });
          }, (error) => {
              error.msgInfo && Toast.info(error.msgInfo );
          });
        } else {
          Toast.info('请先去登录');
        }
      } else {
        // 如果存在错误，获取第一个字段的第一个错误进行提示
        const keys = Object.keys(err);
        if (keys && keys.length) {
          const errs = err[keys[0]].errors;
          if (errs && errs.length) {
            const errMessage = errs[0].message;
            Toast.info(errMessage);
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
        this.props.$fetch.post(`/cmm/qrycardbin`, params).then((result) => {
          if(result.bankCd===null || result.bankCd==='' || result.cardTyp==='C'){
            Toast.info('请输入正确的储蓄卡号')
          }
          else{
            this.props.$fetch.post(`/withhold/card/bindApply`,{
                mblNo:values.valueInputCarPhone,
                bankCd:result.bankCd,
                cardTyp:"D",//卡类型。
                cardNo:values.valueInputCarNumber, //持卡人卡号
            }).then((result)=> {
                if(result.msgCode !== 'PTM0000'){
                    Toast.info(result.msgInfo)
                    // return false
                } else {
                    // bindStorageGetCode()
                    fn(true);
                }
            },(error)=> {
                error.retMsg  && Toast.info(error.retMsg );
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
            Toast.info(errMessage);
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
                { required: true, message: '请输入储蓄卡卡号' },
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
                { required: true, message: '请输入银行卡预留手机号' },
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

