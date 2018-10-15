import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import { createForm } from 'rc-form';
import { List, InputItem } from 'antd-mobile';
import { store } from 'utils/store';
import ButtonCustom from 'components/button';
import CountDownButton from 'components/CountDownButton';
import { validators } from 'utils/validator';
import { buriedPointEvent } from 'utils/Analytins';
import { mine } from 'utils/AnalytinsType';
import { getFirstError } from 'utils/common';
import qs from 'qs';
import styles from './index.scss';

const API = {
  GETUSERINF: '/my/getRealInfo', // 获取用户信息
  GECARDINF: '/cmm/qrycardbin', // 绑定银行卡前,卡片信息查
  BINDCARD: '/withhold/card/bindConfirm', // 绑定银行卡
  GETCODE: '/withhold/card/bindApply', // 绑定银行卡短信验证码获取
};

let isFetching = false;

@fetch.inject()
@createForm()
export default class bind_save_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userName: '', // 持卡人姓名
      enable: true, // 计时器是否可用
      cardData: {}, // 绑定的卡的数据
    }
  }
  componentWillMount() {
    isFetching = false;
    this.queryUserInf();
  }
  componentWillUnmount() {
    isFetching = false;
    store.removeBackUrl(); // 清除session里的backurl的值
  }
  // 获取信用卡信息
  queryUserInf = () => {
    this.props.$fetch.get(API.GETUSERINF).then((result) => {
      if (result.data) {
        this.setState({ userName: result.data.usrNm })
      }
    }, (error) => {
      error.msgInfo && this.props.toast.info(error.msgInfo);
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
    this.props.$fetch.post(API.GECARDINF, params).then((result) => {
      if (result.msgCode === 'PTM0000' && result.data && result.data.bankCd && result.data.cardTyp !== 'C') {
        this.setState({ cardData: { cardNo: values.valueInputCarNumber, lastCardNo: values.valueInputCarNumber.slice(-4), ...result.data } })
        const params1 = {
          bankCd: result.data.bankCd,
          cardTyp: 'D', //卡类型。
          cardNo: values.valueInputCarNumber, //持卡人卡号
          mblNo: values.valueInputCarPhone, //预留手机号
          smsCd: values.valueInputCarSms, //短信验证码
        };
        this.bindSaveCard(params1);
      } else {
        isFetching = false;
        this.props.toast.info('请输入有效银行卡号');
        buriedPointEvent(mine.saveConfirm, {
          entry: store.getBackUrl() ? '绑定储蓄卡' : '储蓄卡管理',
          is_success: false,
          fail_cause: result.msgInfo,
        });
      }
    }, (error) => {
      error.msgInfo && this.props.toast.info(error.msgInfo);
    });
  };
  // 绑定储蓄卡
  bindSaveCard = params1 => {
    this.props.$fetch.post(API.BINDCARD, params1).then((data) => {
      // bindStorageConfirm()
      if (data.msgCode === 'PTM0000') {
        buriedPointEvent(mine.saveConfirm, {
          entry: store.getBackUrl() ? '绑定储蓄卡' : '储蓄卡管理',
          is_success: true,
        });
        let cardDatas = {};
        const backUrlData = store.getBackUrl();
        if (backUrlData) {
          // 如果是首页则多存一个参数为showModal的字段，以便首页弹框
          if (backUrlData === '/home/home') {
            cardDatas = { agrNo: data.data.agrNo, showModal: true, ...this.state.cardData };
          } else {
            cardDatas = { agrNo: data.data.agrNo, ...this.state.cardData };
          }
          // 首页不需要存储银行卡的情况，防止弹窗出现
          const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
          if (queryData && queryData.noBankInfo) {
            store.removeCardData();
          } else {
            store.setCardData(cardDatas);
          }
          store.removeBackUrl();
          // this.props.history.replace(backUrlData);
          // 如果是从四项认证进入，绑卡成功则回到首页
          if (store.getCheckCardRouter() === 'checkCardRouter') {
            this.props.history.push('/home/home');
          } else {
            this.props.history.goBack();
          }
        } else {
          // this.props.history.replace('/mine/select_save_page');
          this.props.history.goBack()
        }
        // if(sessionStorage.getItem('storageCardManagement')){
        //   this.props.history.push('/storageCardManagementOutside')
        // }else{
        //   const agrNo = qs.parse(this.props.location.search, {ignoreQueryPrefix: true}).agrNo
        //   if (!agrNo) {
        //     sessionStorage.getItem('storageCardSourceLenderAgain') === 'true' ?
        //     this.props.history.push('/backConfirmOutside') : this.props.history.push('/homeOutside')
        //   } else {
        //     this.props.history.replace(`/chooseStorageBankCardOutside?agrNo=${agrNo}`)
        //   }
        //   //storageCardSourceLenderAgain 再次借款标识
        // }
      } else {
        isFetching = false;
        buriedPointEvent(mine.saveConfirm, {
          entry: store.getBackUrl() ? '绑定储蓄卡' : '储蓄卡管理',
          is_success: false,
          fail_cause: data.msgInfo,
        });
        this.props.toast.info(data.msgInfo);
        this.setState({ valueInputCarSms: '' });
      }
    });
  };
  // 确认购买
  confirmBuy = () => {
    if (isFetching) {
      return;
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        isFetching = true;
        // 参数
        const params = {
          cardNo: values.valueInputCarNumber, //持卡人储蓄卡号
        };
        this.checkCard(params, values);
        //判断是否登录
        // const token = sessionStorage.getItem('tokenId');
        // if (token) {
        //   this.checkCard(params, values);
        // } else {
        //   this.props.toast.info('请先去登录');
        // }
      } else {
        if (!this.jsonIsNull(values)) {
          buriedPointEvent(mine.saveConfirm, {
            entry: store.getBackUrl() ? '绑定储蓄卡' : '储蓄卡管理',
            is_success: false,
            fail_cause: getFirstError(err),
          });
        }
        isFetching = false;
        // 如果存在错误，获取第一个字段的第一个错误进行提示
        this.props.toast.info(getFirstError(err));
      }
    });
  };
  // 判断json里的每一项是否为空
  jsonIsNull = values => {
    for (let val in values) {
      if (values[val] === undefined || values[val] === '') {
        return true;
      }
    }
    return false;
  };
  // 点击开始倒计时
  countDownHandler = fn => {
    const formData = this.props.form.getFieldsValue();
    if (!validators.bankCardNumber(formData.valueInputCarNumber)) {
      this.props.toast.info('请输入有效银行卡号');
      return;
    }
    if (!validators.phone(formData.valueInputCarPhone)) {
      this.props.toast.info('请输入银行卡绑定的有效手机号');
      return;
    }
    const params = {
      cardNo: formData.valueInputCarNumber, //持卡人储蓄卡号
    };
    this.props.$fetch.post(API.GECARDINF, params).then((result) => {
      if (result.msgCode === 'PTM0000' && result.data && result.data.bankCd && result.data.cardTyp !== 'C') {
        this.props.$fetch.post(API.GETCODE, {
          mblNo: formData.valueInputCarPhone,
          bankCd: result.data.bankCd,
          cardTyp: 'D', //卡类型。
          cardNo: formData.valueInputCarNumber, //持卡人卡号
        }).then((result) => {
          if (result.msgCode !== 'PTM0000') {
            this.props.toast.info(result.msgInfo)
            // return false
          } else {
            // bindStorageGetCode()
            this.props.toast.info('发送成功，请注意查收！');
            fn(true);
          }
        }, (error) => {
          error.retMsg && this.props.toast.info(error.retMsg);
        })
        // return true
      } else {
        this.props.toast.info('请输入有效银行卡号')
      }
    });
  };

  // 跳转到支持的银行
  supporBank = () => {
    this.props.history.push('/mine/support_save_page');
  };

  render() {
    const Item = List.Item;
    const { getFieldProps } = this.props.form;
    return (
      <div className={styles.bind_save_page}>
        <List>
          <Item extra={this.state.userName}>持卡人</Item>
          <InputItem
            maxLength="24"
            {...getFieldProps('valueInputCarNumber', {
              rules: [
                { required: true, message: '请输入有效银行卡号' },
                { validator: this.validateCarNumber },
              ],
            })}
            type="number"
            placeholder="请输入储蓄卡卡号"
          >
            储蓄卡卡号
          </InputItem>
          <InputItem
            maxLength="11"
            type="number"
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
              maxLength="6"
              {...getFieldProps('valueInputCarSms', {
                rules: [
                  { required: true, message: '请输入正确验证码' },
                ]
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
        <span className={styles.support_type} onClick={this.supporBank}>支持银行卡类型</span>
      </div>
    )
  }
}

