import React, { Component } from 'react';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import { getNextStr, getDeviceType } from 'utils';
import Blank from 'components/Blank';

const API = {
  getFaceDetect: '/auth/faceDetect', // 人脸认证之后的回调状态
};
@fetch.inject()
export default class tencent_face_middle_page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorInf: ''
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
          this.setState({
            errorInf:
              '加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
          });
          return;
        }
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
          errorInf: '加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
        });
      });
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
    return <Blank errorInf={this.state.errorInf} />;
  }
}
