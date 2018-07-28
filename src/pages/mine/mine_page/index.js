import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import avatar from 'assets/images/mine/avatar.png';
import Lists from 'components/lists';
import styles from './index.scss';

const API = {
  VIPCARD: '/my/queryUsrMemSts', // 查询用户会员卡状态
  LOGOUT: '/signup/logout', // 用户退出登陆
  GETSTSW: '/my/getStsw', // 获取用户授信信息列表
};

const needDisplayOptions = ['idCheck'];

@fetch.inject()
export default class mine_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      stswData: [], // 用户授信信息列表
      userPhone: '152****6273',
      memberInf: { // 会员卡信息
        status: '',
        color: '',
      },
      jumpFlag: false, //  是否可以跳转页面
    };
  }
  componentWillMount() {
    this.checkAuth();
    this.queryVipCard();
  }
  // 查询用户会员卡状态
  queryVipCard = () => {

    this.props.$fetch.get(API.VIPCARD).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        switch (result.data.memSts) {
          case '0':
            this.setState({ memberInf: { status: '未购买', color: '#FF5A5A' } });
            break;
          case '1':
            this.setState({ memberInf: { status: '已购买', color: '#4CA6FF' } });
            break;
          case '2':
            this.setState({ memberInf: { status: '处理中', color: '#4CA6FF' } });
            break;
          default:
            break;
        }
      }
    });
  };
  // 查询是否实名认证
  checkAuth = () => {
    this.props.$fetch.get(`${API.GETSTSW}`).then(result => {
      if (result && result.data !== null) {
        this.setState({ stswData: result.data.filter(item => needDisplayOptions.includes(item.code)) });
        // 判断是否实名认证
        const isAllValid = this.state.stswData.every(item => item.stsw.dicDetailValue === '认证成功');
        if (isAllValid) {
          this.setState({ jumpFlag: true });
        }
      }
    });
  };

  // 退出
  logout = () => {
    this.props.$fetch.get(API.LOGOUT).then(result => {
      if (result && result.msgCode !== 'PTM0000') {
        result.msgInfo && this.props.toast.info(result.msgInfo);
        return;
      }
      this.props.history.push('/login')
      sessionStorage.clear();
      Cookie.remove('fin-v-card-token');
    }, err => {
      err.msgInfo && this.props.toast.info(err.msgInfo);
    });
  };
  // 第一组里的点击事件
  clickhandle = item => {
    if (this.state.jumpFlag) {
      this.props.history.push(item.jumpToUrl);
    } else {
      this.props.toast.info('请先进行实名认证', 2, () => {
        this.props.history.push('/authentication/real_name');
      })
    }
  };
  // 第二组里的点击事件
  clickhandle2 = item => {
    if (item.jumpToUrl == '/authentication/real_name') {
      this.props.history.push(item.jumpToUrl);
    } else {
      if (this.state.jumpFlag) {
        this.props.history.push(item.jumpToUrl);
      } else {
        this.props.toast.info('请先进行实名认证', 2, () => {
          this.props.history.push('/authentication/real_name');
        })
      }
    }

  };
  // 第三组里的点击事件
  clickhandle3 = item => {
    this.props.history.push(item.jumpToUrl);
  };
  render() {
    // 定义list所需的数据

    const listsArr = [
      {
        extra: {
          name: this.state.memberInf.status,
          color: this.state.memberInf.color,
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
          name: this.state.stswData[0] && this.state.stswData[0].stsw.dicDetailValue,
          color: this.state.stswData[0] && this.state.stswData[0].stsw.color,
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

