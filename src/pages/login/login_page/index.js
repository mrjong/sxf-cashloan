import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { Toast, InputItem } from 'antd-mobile';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store, getDeviceType, getFirstError } from 'utils/common';
import { validators } from 'utils/validator';
import style from './index.scss';
import { setBackGround } from '../../../utils/Background';
import { address } from 'utils/Address'

let timmer
const API = {
  smsForLogin: '/signup/smsForLogin',
  sendsms: '/cmm/sendsms',
};

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
    document.title = "登录和注册"
    // 移除cookie
    Cookie.remove('fin-v-card-token');
    sessionStorage.clear()
    console.log(this.props);
    this.props.form.getFieldProps('phoneValue');
    this.props.form.setFieldsValue({
      phoneValue: '',
    });
  }
  componentDidMount() {
    address()
  }

  componentWillUnmount() {
    clearInterval(timmer);
  }

  // 校验手机号
  validatePhone = (rule, value, callback) => {
    if (!validators.phone(value)) {
      callback('请输入正确手机号');
    } else {
      callback();
    }
  };

  //去登陆按钮
  goLogin = () => {
    const osType = getDeviceType();
    if (!this.state.smsJrnNo) {
      Toast.info('请先获取短信验证码')
      return
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.$fetch.post(API.smsForLogin, {
          mblNo: values.phoneValue, // 手机号
          smsJrnNo: this.state.smsJrnNo, // 短信流水号
          osType: osType, // 操作系统
          smsCd: values.smsCd, // IP地址
          usrCnl: sessionStorage.getItem('h5Channel') ? sessionStorage.getItem('h5Channel') : 'h5', // 用户渠道
          location: store.getPosition(), // 定位地址 TODO 从session取
        }).then(res => {
          if (res.msgCode !== 'PTM0000') {
            res.msgInfo && Toast.info(res.msgInfo);
            return;
          }
          Cookie.set('fin-v-card-token', res.data.tokenId, { expires: 365 });
          store.setToken(res.data.tokenId)
          this.props.history.replace('/home/home');
        }, err => {
          err.msgInfo && Toast.info(err.msgInfo);
        });
      } else {
        Toast.info(getFirstError(err));
      }
    });
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
    this.props.form.validateFields((err, values) => {
      if (err && err.smsCd) {
        delete (err.smsCd);
      }
      if (!err || JSON.stringify(err) === '{}') {
        // 发送验证码
        this.props.$fetch.post(API.sendsms, {
          type: '6',
          mblNo: values.phoneValue,
          osType: osType,
        }).then((result) => {
          if (result.msgCode !== 'PTM0000') {
            Toast.info(result.msgInfo);
            this.setState({ valueInputImgCode: '' });
            return false;
          } else {
            Toast.info('发送成功，请注意查收！');
            this.setState({ timeflag: false, smsJrnNo: result.data.smsJrnNo });
            timmer = setInterval(() => {
              this.setState({ flag: false, timers: i-- + '"' });
              if (i === -1) {
                clearInterval(timmer);
                this.setState({ timers: '重新获取', timeflag: true, flag: true });
              }
            }, 1000);

          }
        });
      } else {
        Toast.info(getFirstError(err));
      }
    });
  }
  // 跳转协议
  go = (url) => {
    this.props.history.push(`/protocol/${url}`)
  }
  render() {
    const { getFieldProps } = this.props.form;
    return (
      <div className={style.loginContent}>
        <div className={style.loginLog}>
          <div className={style.centent}>
            <InputItem
              maxLength="11"
              type="number"
              className={style.loginInput}
              placeholder='请输入您的手机号'
              {...getFieldProps('phoneValue', {
                rules: [
                  { required: true, message: '请输入正确手机号' },
                  { validator: this.validatePhone },
                ],
              })}
            />
            <InputItem
              type="number"
              maxLength="6"
              className={style.loginInput}
              placeholder='请输入短信验证码'
              {...getFieldProps('smsCd', {
                rules: [
                  { required: true, message: '请输入正确验证码' },
                ],
              })}
            />
            <div className={this.state.flag ? style.smsCode : style.smsCodeNumber} onClick={() => {
              this.state.timeflag ? this.getTime(59) : '';
            }}>
              {this.state.timers}
            </div>
            <div style={{ clear: 'both' }} />
            <div className={style.sureBtn} onClick={this.goLogin}>一键代还</div>

            <div className={style.agreement}>
              注册即视为同意 <span onClick={() => { this.go('register_agreement_page') }}>《注册及授信协议》</span><span onClick={() => { this.go('privacy_agreement_page') }}>《用户隐私协议》</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
