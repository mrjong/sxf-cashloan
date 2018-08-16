import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import { store } from 'utils/common';
import fetch from 'sx-fetch';
import avatar from 'assets/images/mine/avatar.png';
import { logoutAppHandler } from 'utils/common';
import Lists from 'components/lists';
import styles from './index.scss';
const API = {
  VIPCARD: '/my/queryUsrMemSts', // 查询用户会员卡状态
  LOGOUT: '/signup/logout', // 用户退出登陆
  GETSTSW: '/my/getStsw', // 获取用户授信信息列表
  USERSTATUS: '/signup/getUsrSts', // 用户状态获取
};

@fetch.inject()
export default class mine_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // showMoudle: false, // 是否展示确认退出的modal
      realNmFlg: false, // 用户是否实名
      mblNoHid: '',
      memberInf: { // 会员卡信息
        status: '',
        color: '',
      },
    };
  }
  componentWillMount() {
    // 清除订单缓存
    store.removeBackData()
    // 移除会员卡出入口
    store.removeVipBackUrl()
    // 判断session里是否存了用户信息，没有调用接口，有的话直接从session里取
    if (Cookie.get('authFlag')) {
      this.setState({ mblNoHid: store.getUserPhone(), realNmFlg: Cookie.get('authFlag') === '1' ? true : false });
    } else {
      this.getUsrInfo();
    }
    // 判断session是否存了购买会员卡的状态，没有调用接口，有的话直接从session里取
    // if (Cookie.get('VIPFlag')) {
    //   switch (Cookie.get('VIPFlag')) {
    //     case '0':
    //       this.setState({ memberInf: { status: '未购买', color: '#FF5A5A' } });
    //       break;
    //     case '1':
    //       this.setState({ memberInf: { status: '已购买', color: '#4CA6FF' } });
    //       break;
    //     case '2':
    //       this.setState({ memberInf: { status: '处理中', color: '#4CA6FF' } });
    //       break;
    //     default:
    //       break;
    //   }
    // } else {
    //   this.queryVipCard();
    // }
  }
  // 获取用户信息
  getUsrInfo = () => {
    this.props.$fetch.get(API.USERSTATUS).then(res => {
      if (res.msgCode !== 'PTM0000') {
        res.msgInfo && this.props.toast.info(res.msgInfo);
        return
      }
      store.setUserPhone(res.mblNoHid);
      // store.setAuthFlag(res.realNmFlg);
      let inOnwMinute = new Date(new Date().getTime() + 1 * 15 * 1000);
      Cookie.set('authFlag', res.realNmFlg, {
        expires: inOnwMinute,
      });
      store.setUserInfo(res);
      this.setState({ mblNoHid: res.mblNoHid, realNmFlg: res.realNmFlg === '1' ? true : false });
      //TODO ...
    }, err => {
      err.msgInfo && this.props.toast.info(err.msgInfo);
    })
  };
  // 查询用户会员卡状态
  queryVipCard = () => {
    this.props.$fetch.get(API.VIPCARD).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        // store.setVIPFlag(result.data.memSts);
        let inOnwMinute = new Date(new Date().getTime() + 1 * 15 * 1000);
        Cookie.set('VIPFlag', result.data.memSts, {
          expires: inOnwMinute,
        });
        store.setVIPInfo(result.data)
        store.setVipBackUrl('/mine/mine_page')
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
      } else {
        this.props.toast.info(result.msgInfo);
      }
    });
  };

  // 退出

  // 第一组里的点击事件
  clickhandle = item => {
    const { mblNoHid, realNmFlg } = this.state;
    if (mblNoHid && realNmFlg && Cookie.get('VIPFlag') !== '2') {
      this.props.history.push(item.jumpToUrl);
    }
    if (!mblNoHid) {
      this.props.toast.info('用户未登录', 2, () => {
        this.props.history.push('/login');
      })
    }
    if (!realNmFlg) {
      this.props.toast.info('请先进行实名认证', 2, () => {
        // let isWx=this.is_weixn()
        // if (isWx) {
        //     //在微信中打开
        //     this.props.history.replace('/wxName')
        // }
        //else{
        this.props.history.push('/home/real_name')
        //}
      })
    }
  };
  // 第二组里的点击事件
  clickhandle2 = item => {
    if (item.jumpToUrl === '/home/real_name' || item.jumpToUrl === '/mine/credit_extension_page?isShowCommit=false' || item.jumpToUrl === '/mine/fqa_page') {
      this.props.history.push(item.jumpToUrl);
    } else {
      const { mblNoHid, realNmFlg } = this.state;
      if (mblNoHid && realNmFlg) {
        this.props.history.push(item.jumpToUrl);
      }
      if (!mblNoHid) {
        this.props.toast.info('用户未登录', 2, () => {
          this.props.history.push('/login');
        })
      }
      if (!realNmFlg) {
        this.props.toast.info('请先进行实名认证', 2, () => {
          // let isWx=this.is_weixn()
          // if (isWx) {
          //     //在微信中打开
          //     this.props.history.replace('/wxName')
          // }
          //else{
          this.props.history.push('/home/real_name')
          //}
        })
      }
    }
  };
  // 第三组里的点击事件
  clickhandle3 = item => {
    this.props.history.push(item.jumpToUrl);
  };
  // 点击退出登录后弹框
  logoutHandler = () => {
    logoutAppHandler()
  };

  render() {
    const { mblNoHid, realNmFlg } = this.state;
    // 定义list所需的数据
    const listsArr = [
      // {
      //   extra: {
      //     name: this.state.memberInf.status,
      //     color: this.state.memberInf.color,
      //   },
      //   label: {
      //     name: '会员卡',
      //     icon: require('assets/images/mine/menu_ico7.png')
      //   },
      //   jumpToUrl: '/mine/membership_card_page',
      // },
    ];
    const listsArr2 = [
      {
        extra: {
          name: mblNoHid && realNmFlg ? '已认证' : '未认证',
          color: mblNoHid && realNmFlg ? '#4CA6FF' : '#FF5A5A',
        },
        label: {
          name: '实名认证',
          icon: require('assets/images/mine/menu_ico.png')
        },
        jumpToUrl: '/home/real_name',
      },
      {
        label: {
          name: '信用加分',
          icon: require('assets/images/mine/menu_ico2.png')
        },
        jumpToUrl: '/mine/credit_extension_page?isShowCommit=false',
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
      {
        label: {
          name: '常见问题',
          icon: require('assets/images/mine/menu_ico5.png')
        },
        jumpToUrl: '/mine/fqa_page',
      },
    ];
    return (
      <div className={styles.mine_page}>
        <div className={styles.user_inf}>
          <img src={avatar} alt="用户头像" />
          <span>{mblNoHid}</span>
        </div>
        <Lists clickCb={this.clickhandle} listsInf={listsArr} />
        <Lists clickCb={this.clickhandle2} listsInf={listsArr2} className={styles.common_margin} />
        {/* <Lists clickCb={this.clickhandle3} listsInf={listsArr3} className={styles.common_margin} /> */}
        <div
          onClick={this.logoutHandler}
          className={styles.logout}
        >
          退出登录
        </div>
        {/* {mblNoHid && showMoudle && <Moudles cb={this} logOut={this.logout} textCont="确认退出登录？" />} */}
      </div>
    )
  }
}

