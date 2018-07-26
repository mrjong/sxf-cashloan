import React, { PureComponent } from 'react';
import log from '../../../assets/images/login/22@2x.png';
import phone from '../../../assets/images/login/phone.png';
import code from '../../../assets/images/login/code.png';
import imgCode from '../../../assets/images/login/1.png';
import number from '../../../assets/images/login/number.png';
import style from './index.scss';
import { setBackGround } from '../../../utils/Background';
import ButtonCustom from 'components/button';

@setBackGround('#fff')

export default class LoginPage extends PureComponent {
  constructor(props) {
    super(props);
  }


  render() {
    return (
      <div className={style.loginContent}>
        <div className={style.loginLog}>
          <img src={log}/>
        </div>

        <div className={style.inputItem}>
          <img src={phone} className={style.phone} />
          <input className={style.input} placeholder='请输入手机号'/>
        </div>

        <div className={style.inputItem}>
          <img src={code} className={style.phone} />
          <input className={style.input} placeholder='请输入图形码'/>
          <span className={style.imgCode}>
           <img src={imgCode}/>
          </span>
        </div>

        <div className={style.inputItem}>
          <img src={number} className={style.phone} />
          <input className={style.input} placeholder='请输入验证码'/>
          <span className={style.inline}>

          </span>
          <span className={style.smsCode}>
            获取验证码
          </span>
        </div>

        <ButtonCustom className={style.sureBtn}>一键代还</ButtonCustom>
      </div>
    )
  }
}

