import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import avatar from 'assets/images/mine/avatar.png';
import Lists from 'components/lists';
import Moudles from 'components/moudles';
import styles from './index.scss';

const API = {
  VIPCARD: '/my/queryUsrMemSts', // 查询用户会员卡状态
  LOGOUT: '/signup/logout', // 用户退出登陆
  GETSTSW: '/my/getStsw', // 获取用户授信信息列表
  USERSTATUS: '/signup/getUsrSts', // 用户状态获取
};


@fetch.inject()
export default class fqa_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  componentWillMount() {
  }

  render() {
    return (
      <div className={styles.fqa_page} >
        <iframe
          className={styles.container}
          src="/disting/#/fqa"
          name="fqa"
          id="fqa"
          width="100%"
          height="100%"
          frameBorder="0"
        />
      </div>

    )
  }
}

