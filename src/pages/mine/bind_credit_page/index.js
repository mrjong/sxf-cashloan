import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import { createForm } from 'rc-form';
import { List, InputItem } from 'antd-mobile';
import ButtonCustom from 'components/button';
import { validators } from 'utils/validator';
import { store, getFirstError } from 'utils/common';
import styles from './index.scss';
import qs from 'qs';

const API = {
  GETUSERINF: '/my/getRealInfo', // 获取用户信息
  GECARDINF: '/cmm/qrycardbin', // 绑定银行卡前,卡片信息查
  BINDCARD: '/withhold/card/bindConfirm', // 绑定银行卡
  CHECKCARD: '/my/chkCard', // 是否绑定了一张信用卡一张储蓄卡
};

@fetch.inject()
@createForm()
export default class bind_credit_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      userName: '', // 持卡人姓名
      cardData: {}, // 绑定的卡的数据
    };
  }

  componentWillMount() {
    this.queryUserInf();
  }

  // 获取信用卡信息
  queryUserInf = () => {
    this.props.$fetch.get(API.GETUSERINF)
      .then((result) => {
        if (result.data) {
          this.setState({ userName: result.data.usrNm })
        }
      }, (error) => {
        error.msgInfo && this.props.toast.info(error.msgInfo);
      })
  };

  // 校验信用卡卡号
  validateCarNumber = (rule, value, callback) => {
    if (!validators.bankCardNumber(value)) {
      callback('请输入有效银行卡号');
    } else {
      callback();
    }
  };
  // 绑定银行卡
  bindConfirm = params1 => {
    this.props.$fetch.post(API.BINDCARD, params1).then((result) => {
      if (result.msgCode === 'PTM0000') {
        // bindCreditConfirm()
        const backUrlData = store.getBackUrl();
        const cardDatas = { agrNo: result.data && result.data.agrNo ? result.data.agrNo : '', ...this.state.cardData }
        if (backUrlData) {
          // 提交申请 判断是否绑定信用卡和储蓄卡
          this.props.$fetch.get(API.CHECKCARD).then(result => {
            if (result.msgCode === "PTM2003") {
              // 进入绑定储蓄卡页面，如何不需要存银行卡（防止弹窗出现）则加一个noBankInfo
              const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
              if (queryData && queryData.noBankInfo) {
                this.props.history.replace({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
              }else{
                this.props.history.replace('/mine/bind_save_page');
              }
            } else {
              // 首页不需要存储银行卡的情况，防止弹窗出现
              const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
              if (queryData && queryData.noBankInfo) {
                store.removeCardData();
              } else {
                store.setCardData(cardDatas);
              }
              store.removeBackUrl();
              // this.props.history.push(backUrlData);
              // 如果是从四项认证进入，绑卡成功则回到首页
              if (store.getCheckCardRouter() === 'checkCardRouter') {
                this.props.history.push('/home/home');
              } else {
                this.props.history.goBack();
              }
            }
          })
        } else {
          // this.props.history.replace('/mine/select_credit_page');
          this.props.history.goBack()
        }
      } else {
        this.props.toast.info(result.msgInfo)
      }
    })
  };
  // 通过输入的银行卡号 查出查到卡banCd
  checkCard = (params, values) => {
    this.props.$fetch.post(API.GECARDINF, params).then((result) => {
      this.setState({ cardData: { cardNo: values.valueInputCarNumber, lastCardNo: values.valueInputCarNumber.slice(-4), ...result.data } })
      if (result.msgCode === 'PTM0000' && result.data && result.data.bankCd && result.data.cardTyp !== 'D') {
        const params1 = {
          bankCd: result.data.bankCd,
          cardTyp: 'C', //卡类型。
          cardNo: values.valueInputCarNumber, //持卡人卡号
        }
        this.bindConfirm(params1);
      } else {
        this.props.toast.info('请输入有效银行卡号')
      }
    }, (error) => {
      error.msgInfo && this.props.toast.info(error.msgInfo);
    })
  };
  // 确认购买
  confirmBuy = () => {
    // e.preventDefault();
    const { loading } = this.state;
    if (loading) return; // 防止重复提交

    this.props.form.validateFields((err, values) => {
      if (!err) {
        const params = {
          cardNo: values.valueInputCarNumber,
        }
        this.checkCard(params, values);
        // TODO 发送请求等操作
      } else {
        this.props.toast.info(getFirstError(err));
      }
    });
  };

  // 跳转到支持的银行
  supporBank = () => {
    this.props.history.push('/mine/support_credit_page');
  };

  render() {
    const Item = List.Item;
    const { getFieldProps } = this.props.form;
    return (
      <div className={styles.bind_credit_page}>
        <List>
          <Item extra={this.state.userName}>持卡人</Item>
          <InputItem
            maxLength="24"
            type="number"
            {...getFieldProps('valueInputCarNumber', {
              rules: [
                { required: true, message: '请输入有效银行卡号' },
                { validator: this.validateCarNumber },
              ],
            })}
            // clear
            // error={!!getFieldError('account')}
            // onErrorClick={() => {
            //   alert(getFieldError('account').join('、'));
            // }}
            placeholder="请输入信用卡卡号"
          >
            信用卡卡号
          </InputItem>
        </List>
        <p className={styles.tips}>借款资金将转入您绑定代信用卡中，请注意查收</p>
        <ButtonCustom onClick={this.confirmBuy} className={styles.confirm_btn}>确认</ButtonCustom>
        <span className={styles.support_type} onClick={this.supporBank}>支持银行卡类型</span>
      </div>
    )
  }
}

