import React, { Component } from 'react';
import { store } from 'utils/common';
import qs from 'qs';
const API = {
  getXMURL: '/auth/zmAuth',            // 芝麻认证之后的回调状态
};
export default class middle_page extends Component {
  componentWillMount() {
    //芝麻信用的回调
    const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    const params = query.params;
    const sign = query.sign;
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
    } else {
      this.goRouter()
    }
  }
  goRouter = () => {
    const moxieBackUrl = store.getMoxieBackUrl();
    if (moxieBackUrl) {
      store.removeMoxieBackUrl();
      window.location.href = moxieBackUrl;
    } else {
      this.props.history.push('/home/home')
    }
  }
  render() {
    return null;
  }
}
