import React, { Component } from 'react';
import qs from 'qs';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { isBugBrowser } from 'utils';
import style from './index.scss';

const API = {
  isAccessLogin: '/gateway/anydoor', // 是否有登录的权限
};
@fetch.inject()
export default class auth_page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorInf: ''
    };
  }
  componentWillMount() {
    const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    const { accessId } = query;
    if (accessId) {
      this.props.$fetch.get(`${API.isAccessLogin}/${accessId}`).then(res => {
        if (res && res.msgCode === 'PTM0000') {
          this.goRouter(res.data.tokenId);
        } else {
          this.setState({ errorInf: res.msgInfo });
        }
      });
    } else {
      this.setState({ errorInf: '暂无权限' });
    }
  }
  goRouter = token => {
    Cookie.set('fin-v-card-token', token, { expires: 365 });
    // TODO: 根据设备类型存储token
    if (isBugBrowser()) {
      store.setToken(token);
    } else {
      store.setTokenSession(token);
    }
    this.props.history.replace('/home/home');
  };
  render() {
    return (
      this.state.errorInf ? <div className={style.auth_page}>{this.state.errorInf}</div> : null
    );
  }
}
