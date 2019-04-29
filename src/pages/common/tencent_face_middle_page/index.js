import React, { Component } from 'react';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import { getNextStr, getDeviceType } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import style from './index.scss'
import faceImg from './face.png'
import { SXFToast } from 'utils/SXFToast';


const API = {
  getFaceDetect: '/auth/faceDetect', // 人脸认证之后的回调状态
  getFace: '/auth/getTencentFaceidData' // 人脸识别认证跳转URL
};
@fetch.inject()
export default class tencent_face_middle_page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authStatus: true
    };
  }
  componentWillMount() {
    const osType = getDeviceType()
    //人脸识别的回调
    this.props.$fetch
      .post(`${API.getFaceDetect}`, {
        osType
      })
      .then((res) => {
        if (res.msgCode !== 'PTM0000') {
          this.props.toast.info(res.msgInfo);
          buriedPointEvent(home.faceAuthResult, {
            is_success: false,
            fail_cause: res.msgInfo
          });
          this.setState({
            authStatus: false
          })
          return;
        }
        this.setState({
          authStatus: true
        })
        buriedPointEvent(home.faceAuthResult, {
          is_success: true,
          fail_cause: ''
        });
        if (store.getNeedNextUrl()) {
          getNextStr({
            $props: this.props
          });
        } else {
          this.goRouter();
        }
      })
      .catch((err) => {
        this.setState({
          authStatus: false
        });
      });
  }

  goFaceAuth = () => {
    SXFToast.loading('加载中...', 0);
    this.props.$fetch
      .post(`${API.getFace}`, {})
      .then((result) => {
        if (result.msgCode === 'PTM0000' && result.data) {
          setTimeout(() => {
            // 人脸识别第三方直接返回的问题
            store.setCarrierMoxie(true);
            SXFToast.hide()
            window.location.href = result.data
          }, 3000);
        }
      })
  }

  goBack = () => {
    this.goRouter()
  }

  goRouter = () => {
    const moxieBackUrl = store.getMoxieBackUrl();
    if (moxieBackUrl) {
      store.removeMoxieBackUrl();
      this.props.history.replace(moxieBackUrl);
    } else {
      this.props.history.replace('/home/home');
    }
  };

  render() {
    return (
      <div>
        {
          !this.state.authStatus && <div className={style.face_wrap}>
            <h2>验证失败</h2>
            <p>视频中人脸检测不到</p>
            <p>录制时，确保人脸清晰完整</p>
            <div className={style.tip_title}>请保持脸部完整</div>
            <img src={faceImg} alt="" className={style.face_img} />
            <button onClick={this.goBack} className={style.button}>退出验证</button>
            <button onClick={this.goFaceAuth} className={[style.button, style.active_btn].join(' ')}>重新验证</button>
          </div>
        }
      </div>
    )
  }
}
