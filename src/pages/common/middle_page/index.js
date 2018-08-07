import React, { Component } from 'react';
import { store } from 'utils/common';
import qs from 'qs';
import fetch from 'sx-fetch';
const API = {
  getXMURL: '/auth/zmAuth',            // 芝麻认证之后的回调状态
};
@fetch.inject()
export default class middle_page extends Component {
  componentWillMount() {
    //芝麻信用的回调
    const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    const params = query.params;
    const sign = query.sign;
    const taskType = query.taskType
    if (params && sign) {
      const data = {
        params,
        sign,
      };
      this.props.$fetch.post(`${API.getXMURL}`, data).then((res) => {
        if (res && res.data !== null && res.msgCode === 'PTM0000') {
          this.goRouter()
        } else {
          this.props.toast.info(res.msgInfo);
          this.goRouter()
        }
      });
    } else if (taskType) {
      this.props.$fetch.get(`/auth/updateCredStsForHandle/${taskType}`).then(res => {
        this.goRouter()
      }).catch(err => {
        console.log(err)
      })
    }
  }
  goRouter = () => {
    const moxieBackUrl = store.getMoxieBackUrl();
    if (moxieBackUrl) {
      store.removeMoxieBackUrl();
      window.location.href = moxieBackUrl;
    } else {
      this.props.push('/home/home')
    }
  }
  render() {
    return null;
  }
}
