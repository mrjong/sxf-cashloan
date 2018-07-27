import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import avatar from 'assets/images/mine/avatar.png';
import Lists from 'components/lists';
import styles from './index.scss';

const API = {
  VIPCARD: '/my/queryUsrMemSts', // 查询用户会员卡状态
};

@fetch.inject()
export default class mine_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userPhone: '152****6273',
    };
  }
  componentWillMount() {
    this.queryVipCard();
  }
  // 查询用户会员卡状态
  queryVipCard = () => {
    this.props.$fetch.post(API.VIPCARD).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        console.log(result);
      }
    });
  };
  // 退出
  logout = () => {
    alert('退出')
  };
  // 第一组里的点击事件
  clickhandle = item => {
    this.props.history.push(item.jumpToUrl)
  };
  // 第二组里的点击事件
  clickhandle2 = item => {
    this.props.history.push(item.jumpToUrl)
  };
  // 第三组里的点击事件
  clickhandle3 = item => {
    this.props.history.push(item.jumpToUrl)
  };
  render() {
    // 定义list所需的数据
    const listsArr = [
      {
        extra: {
          name: '未购买',
          color: '#FF5A5A',
        },
        label: {
          name: '会员卡',
          icon: require('assets/images/mine/menu_ico7.png')
        },
        jumpToUrl: '/membership_card/card_home',
      },
    ];
    const listsArr2 = [
      {
        extra: {
          name: '已认证',
          color: '#4CA6FF',
        },
        label: {
          name: '实名认证',
          icon: require('assets/images/mine/menu_ico.png')
        },
        jumpToUrl: '/authentication/real_name',
      },
      {
        label: {
          name: '信用加分',
          icon: require('assets/images/mine/menu_ico2.png')
        },
        jumpToUrl: '/mine/credit_extension_page',
      },
      {
        label: {
          name: '信用卡管理',
          icon: require('assets/images/mine/menu_ico3.png'),
        },
        jumpToUrl: '/mine/select_credit_page',
      },
      {
        label: {
          name: '储蓄卡管理',
          icon: require('assets/images/mine/menu_ico4.png'),
        },
        jumpToUrl: '/mine/select_save_page',
      },
    ];
    const listsArr3 = [
      {
        label: {
          name: '常见问题',
          icon: require('assets/images/mine/menu_ico5.png')
        },
        jumpToUrl: '',
      },
    ];
    const { userPhone } = this.state;
    return (
      <div className={styles.mine_page}>
        <div className={styles.user_inf}>
          <img src={avatar} alt="用户头像" />
          <span>{userPhone}</span>
        </div>
        <Lists clickCb={this.clickhandle} listsInf={listsArr} />
        <Lists clickCb={this.clickhandle2} listsInf={listsArr2} className={styles.common_margin} />
        <Lists clickCb={this.clickhandle3} listsInf={listsArr3} className={styles.common_margin} />
        <div onClick={this.logout} className={styles.logout}>退出登录</div>
      </div>
    )
  }
}

