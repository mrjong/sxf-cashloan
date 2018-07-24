import React from 'react';
import parentComponent from 'pages/common/parentComponent';
import Footer from 'components/footer';
import avatar from 'assets/images/mine/avatar.png';
import Lists from 'components/lists';
import styles from './index.scss';

export default class MinePage extends parentComponent {
  constructor(props) {
    super(props);
    this.state = {
      userPhone: '152****6273'
    }
  }

  logout = () => {
    alert('退出')
  };

  render() {
    const listsArr = [
      {
        extra: {
          name: '已认证',
          color: '#4CA6FF',
        },
        label: {
          name: '实名认证',
          icon: require('assets/images/mine/menu_ico.png')
        },
      },
      {
        label: {
          name: '信用加分',
          icon: require('assets/images/mine/menu_ico2.png')
        },
        clickCb: () => {
          alert(11);
        },
      },
    ];
    const listsArr2 = [
      {
        label: {
          name: '信用卡管理',
          icon: require('assets/images/mine/menu_ico3.png')
        },
      },
      {
        label: {
          name: '储蓄卡管理',
          icon: require('assets/images/mine/menu_ico4.png')
        },
      },
    ];
    const listsArr3 = [
      {
        label: {
          name: '常见问题',
          icon: require('assets/images/mine/menu_ico5.png')
        },
      },
      {
        label: {
          name: '账号安全',
          icon: require('assets/images/mine/menu_ico6.png')
        },
      },
    ];
    return (
      <div className={styles.mineContainer}>
        <div className={styles.userInf} >
          <img src={avatar} alt="用户头像" />
          <span>{this.state.userPhone}</span>
        </div>
        <Lists listsInf={listsArr} className={styles.commonMargin} />
        <Lists listsInf={listsArr2} className={styles.commonMargin} />
        <Lists listsInf={listsArr3} className={styles.commonMargin} />
        <div onClick = {this.logout} className={styles.logout}>退出登录</div>
        <Footer />
      </div>
    )
  }
}

