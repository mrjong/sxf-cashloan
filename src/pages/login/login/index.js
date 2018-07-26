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
  state = {
    timers: '获取验证码',
    timeflag: true,
    flag: true,
  };

  //获得手机验证码
  getTime(i) {
    if (!this.getSmsCode(i)) {
      return;
    }
  }

  getSmsCode(i) {
    let timmer = setInterval(() => {
      this.setState({ flag: false, timers: i-- + '"' });
      if (i === -1) {
        clearInterval(timmer);
        this.setState({ timers: '重新获取', timeflag: true, flag: true });
      }
    }, 1000);

    // if(!this.state.valueInputPhone){
    //   this.props.toast.info('请输入手机号');
    //   return false
    // }
    // // 发送验证码
    // this.props.$fetch.post(`/cmm/sendsms`,{
    //   type:'1',
    //   mblNo:this.state.valueInputPhone,
    //   imgCode:this.state.valueInputImgCode
    // }).then((result)=> {
    //   if(result.msgCode !== 'PTM0000'){
    //     this.props.toast.info(result.msgInfo)
    //     this.setState({valueInputImgCode:''})
    //     this.getImgCode()
    //     return false
    //   } else {
    //     this.setState({timeflag:false})
    //     let timmer = setInterval(()=> {
    //       this.setState({flag:false,timers:i--+'"'});
    //       if(i === -1) {
    //         clearInterval(timmer);
    //         this.setState({timers:"重新获取",timeflag:true,flag:true});
    //         this.getImgCode()
    //       }
    //     }, 1000);
    //   }
    // })
  }


  render() {
    return (
      <div className={style.loginContent}>
        <div className={style.loginLog}>
          <img src={log}/>
        </div>

        <div className={style.inputItem}>
          <img src={phone} className={style.phone}/>
          <input className={style.input} placeholder='请输入手机号'/>
        </div>

        <div className={style.inputItem}>
          <img src={code} className={style.phone}/>
          <input className={style.input} placeholder='请输入图形码'/>
          <span className={style.imgCode}>
           <img src={imgCode}/>
          </span>
        </div>

        <div className={style.inputItem}>
          <img src={number} className={style.phone}/>
          <input className={style.input} placeholder='请输入验证码'/>
          <span className={style.inline}/>
          <span className={this.state.flag ?style.smsCode:style.smsCodeNumber} onClick={() => {
            this.state.timeflag ? this.getTime(59) : '';
          }}>
            {this.state.timers}
          </span>
        </div>

        <ButtonCustom className={style.sureBtn}>一键代还</ButtonCustom>
      </div>
    );
  }
}

