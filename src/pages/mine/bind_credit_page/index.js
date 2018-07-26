import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import { createForm } from 'rc-form';
import { List, InputItem, Toast } from 'antd-mobile';
import ButtonCustom from 'components/button';
import { validators } from 'utils/validator';
import styles from './index.scss';

@fetch.inject()
@createForm()
export default class bind_credit_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      userName: '',
    };
  }

  componentWillMount() {
    // 获取信用卡信息
    this.props.$fetch.get(`/my/getRealInfo`)
      .then((result) => {
        this.setState({ userName: result.data.usrNm })
      }, (error) => {
        error.msgInfo && Toast.info(error.msgInfo);
      })
  }

  // 校验信用卡卡号
  validateCarNumber = (rule, value, callback) => {
    if (!validators.bankCardNumber(value)) {
      callback('请输入合法的持卡人卡号');
    } else {
      callback();
    }
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
        // values中存放的是经过 getFieldProps 包装的表单元素的值
        console.log(values);
        //判断是否登录
        const token = sessionStorage.getItem("tokenId");
        if (token) {
          // 通过输入的银行卡号 查出查到卡banCd
          this.props.$fetch.post(`/cmm/qrycardbin`, params).then((result) => {
            if (result.bankCd===null || result.bankCd==='' || result.cardTyp==='D') {
              Toast.info('请输入正确的信用卡号')
            } else {
              const params1= {
                bankCd: result.bankCd,
                cardTyp: 'C', //卡类型。
                cardNo: values.valueInputCarNumber, //持卡人卡号
              }
              this.props.$fetch.post(`/withhold/card/bindConfirm`, params1).then((result) => {
                if (result.msgCode === 'PTM0000') {
                  // bindCreditConfirm()
                  if (sessionStorage.getItem('creditCardManagement')) {
                    this.props.history.push('/creditCardManagement')
                  } else {
                    //提交申请 判断是否绑定信用卡和储蓄卡
                    this.props.$fetch.post('/my/chkCard').then(result=>{
                        if(result.msgCode==="PTM2003"){
                            this.props.history.push('/storageCard')
                        } else {
                            sessionStorage.getItem('storageCardSourceLenderAgain') ?
                            this.props.history.push('/backConfirm') : this.props.history.push('/home')
                        }
                    })
                  }
                } else {
                  Toast.info(result.msgInfo)
                }
              })
            }
          }, (error) => {
            error.msgInfo  && Toast.info(error.msgInfo );
          })
        } else {
          Toast.info('请先去登录');
        }
        // TODO 发送请求等操作
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
      <div className={styles.bind_credit_page}>
        <List>
          <Item extra={this.state.userName}>持卡人</Item>
          <InputItem
            {...getFieldProps('valueInputCarNumber', {
              rules: [
                { required: true, message: '请输入信用卡卡号' },
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
        <ButtonCustom onClick={this.confirmBuy} className={styles.confirm_btn}>确认购买</ButtonCustom>
        <span className={styles.support_type}>支持银行卡类型</span>
      </div>
    )
  }
}

