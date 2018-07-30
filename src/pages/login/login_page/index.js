import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { Toast } from 'antd-mobile';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import fetchinit from "utils/FetchInit"
import { getDeviceType, getFirstError } from 'utils/common';
import { validators } from 'utils/validator';
import log from '../../../assets/images/login/22@2x.png';
import phone from '../../../assets/images/login/phone.png';
import number from '../../../assets/images/login/number.png';
import style from './index.scss';
import { setBackGround } from '../../../utils/Background';
import ButtonCustom from '../../../components/button';
let timmer
const API = {
  smsForLogin: '/signup/smsForLogin',
  sendsms: '/cmm/sendsms'
}
@setBackGround('#fff')
@fetch.inject()
@createForm()
export default class login_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      timers: '获取验证码',
      timeflag: true,
      flag: true,
      smsJrnNo: '', // 短信流水号
    };
  }

  componentWillMount() {
    // 移除cookie
    Cookie.remove('fin-v-card-token');
    console.log(this.props)
    this.props.form.getFieldProps('phoneValue');
    this.props.form.setFieldsValue({
      phoneValue: '18500214321'
    });
  }
  componentWillUnmount() {
    clearInterval(timmer)
  }

  // 校验手机号
  validatePhone = (rule, value, callback) => {
    if (!validators.phone(value)) {
      callback('请输入合法的手机号');
    } else {
      callback();
    }
  };

  //去登陆按钮
  goLogin = () => {
    const osType = getDeviceType();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.$fetch.post(API.smsForLogin, {
          mblNo: values.phoneValue, // 手机号
          smsJrnNo: this.state.smsJrnNo, // 短信流水号
          osType: osType, // 操作系统
          smsCd: values.smsCd, // IP地址
          usrCnl: sessionStorage.getItem('h5Channel') ? sessionStorage.getItem('h5Channel') : 'h5', // 用户渠道
          location: this.props.locationAddress, // 定位地址
        }).then(res => {
          if (res.msgCode !== 'PTM0000') {
            res.msgInfo && Toast.info(res.msgInfo);
            return
          }
          sessionStorage.setItem('authorizedNotLoginStats', true)
          Cookie.set('fin-v-card-token', res.data.tokenId);
          sessionStorage.setItem('userId', res.data.userId);
          fetch.defaults.headers['fin-v-card-token'] = res.data.tokenId;
          setTimeout(() => {
            sessionStorage.getItem("active") === 'active' ? this.props.history.replace('/activePage') : this.props.history.replace('/home/home');
          }, 0);
        }, err => {
          err.msgInfo && Toast.info(err.msgInfo);
        });
      } else {
        Toast.info(getFirstError(err))
      }
    })
  };

  //获得手机验证码
  getTime(i) {
    if (!this.getSmsCode(i)) {
      return;
    }
  }

  // 获得手机验证码
  getSmsCode(i) {
    const osType = getDeviceType();
    // let timmer = setInterval(() => {
    //   this.setState({ flag: false, timers: i-- + '"' });
    //   if (i === -1) {
    //     clearInterval(timmer);
    //     this.setState({ timers: '重新获取', timeflag: true, flag: true });
    //   }
    // }, 1000);
    this.props.form.validateFields((err, values) => {
      if (err && err.smsCd) {
        delete (err.smsCd)
      }
      if (!err || JSON.stringify(err) === "{}") {
        // 发送验证码
        this.props.$fetch.post(API.sendsms, {
          type: '6',
          mblNo: values.phoneValue,
          osType: osType
        }).then((result) => {
          if (result.msgCode !== 'PTM0000') {
            Toast.info(result.msgInfo)
            this.setState({ valueInputImgCode: '' })
            // this.getImgCode()
            return false
          } else {
            Toast.info('发送成功，请注意查收！')
            this.setState({ timeflag: false, smsJrnNo: result.data.smsJrnNo })
            timmer = setInterval(() => {
              this.setState({ flag: false, timers: i-- + '"' });
              if (i === -1) {
                clearInterval(timmer);
                this.setState({ timers: "重新获取", timeflag: true, flag: true });
                // this.getImgCode()
              }
            }, 1000);
          }
        })
      } else {
        Toast.info(getFirstError(err))
      }
    })
  }


  render() {
    const { getFieldProps } = this.props.form;
    return (
      <div className={style.loginContent}>
        <div className={style.loginLog}>
          <img src={log} />
        </div>

        <div className={style.inputItem}>
          <img src={phone} className={style.phone} />
          <input
            maxLength="11"
            className={style.input}
            placeholder='请输入手机号'
            {...getFieldProps('phoneValue', {
              rules: [
                { required: true, message: '请输入手机号' },
                { validator: this.validatePhone },
              ],
            })}
          />
        </div>


        <div className={style.inputItem}>
          <img src={number} className={style.phone} />
          <input
            className={style.input}
            placeholder='请输入验证码'
            maxLength="6"
            {...getFieldProps('smsCd', {
              rules: [
                { required: true, message: '请输入验证码' },
              ],
            })}
          />
          <span className={style.inline} />
          <span className={this.state.flag ? style.smsCode : style.smsCodeNumber} onClick={() => {
            this.state.timeflag ? this.getTime(59) : '';
          }}>
            {this.state.timers}
          </span>
        </div>

        <ButtonCustom className={style.sureBtn} onClick={this.goLogin}>一键代还</ButtonCustom>
      </div>
    );
  }
}

