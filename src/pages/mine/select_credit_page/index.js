import React, { PureComponent } from 'react';
import { SwipeAction } from 'antd-mobile';
import { store } from 'utils/store';
import { Modal } from 'antd-mobile';
import fetch from 'sx-fetch';
import qs from 'qs';
import styles from './index.scss';

const API = {
  BANKLIST: '/my/card/list', // 银行卡列表
  UNBINDCARD: '/my/card/unbind', // 解出银行卡绑定
  VIPBANKLIST: '/my/quickpay/cardList', // 会员卡的银行卡列表
}

let backUrlData = ''; // 从除了我的里面其他页面进去

@fetch.inject()
export default class select_credit_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      agrNo: '', // 银行卡协议号
      cardList: [],
      isClickAdd: false, // 是否点击了添加授权卡
      isVipEnter: false, // 是否是会员卡页面进入
      // showMoudle: false, // 是否展示确认解绑的modal
      // unbindData: '', // 解绑卡的数据
    }
    backUrlData = store.getBackUrl();
  }
  componentWillMount() {
    if (!backUrlData) {
      this.props.setTitle('信用卡管理');
    }
    if (backUrlData && backUrlData === '/mine/confirm_purchase_page') {
      this.queryVipBankList();
      this.props.setTitle('选择银行卡');
      this.setState({ isVipEnter: true });
    } else {
      this.queryBankList();
    }
    const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    if (queryData.agrNo) {
      this.setState({
        agrNo: queryData.agrNo,
      });
    }
  }
  componentDidMount() {
    // 改变body的背景色
    if (backUrlData) {
      document.getElementsByTagName('body')[0].className = 'white';
    } else {
      document.getElementsByTagName('body')[0].className = '';
    }
  }
  componentWillUnmount() {
    document.getElementsByTagName('body')[0].className = '';
    // 如果点击的不是添加授权卡则清掉session里的backurl的值
    if (!this.state.isClickAdd) {
      store.removeBackUrl(); // 清除session里的backurl的值
    }
  }

  // 获取会员卡的信用卡银行列表
  queryVipBankList = () => {
    this.props.$fetch
      .post(API.VIPBANKLIST, {
        type: '5',
        corpBusTyp: '31'
      }).then(
        res => {
          if (res.msgCode === 'PTM0000') {
            this.setState({
              cardList: res.data ? res.data : []
            });
            this.getSelectedData();
          } else {
            res.msgInfo && this.props.toast.info(res.msgInfo)
          }
        },
        error => {
          error.msgInfo && this.props.toast.info(error.msgInfo);
        }
      )
  };

  // 获取选中的银行卡数据
  getSelectedData = () => {
    // 进入组件时默认存入选中的一项
    if (backUrlData) {
      let cardData = [];
      if (this.state.cardList.length) {
        cardData = this.state.cardList.filter(item => item.agrNo === this.state.agrNo);
      }
      store.setCardData(cardData[0]);
    }
  };

  // 获取信用卡银行卡列表
  queryBankList = () => {
    this.props.$fetch
      .post(API.BANKLIST, {
        // agrNo:query.agrNo,
        type: '4', //所有信用卡列表
        corpBusTyp: '01', //01：银行卡鉴权
      }).then(
        res => {
          if (res.msgCode === 'PTM0000') {
            this.setState({
              cardList: res.cardList ? res.cardList : []
            });
            this.getSelectedData();
          } else {
            if (res.msgCode === 'PTM3021') {
              this.setState({
                cardList: []
              });
              return;
            }
            res.msgInfo && this.props.toast.info(res.msgInfo)
          }
        },
        error => {
          error.msgInfo && this.props.toast.info(error.msgInfo);
        }
      )
  };

  // 解绑银行卡
  unbindCard = agrNo => {
    this.props.$fetch
      .get(`${API.UNBINDCARD}/${agrNo}`).then(
        res => {
          // this.setState({ showMoudle: false, unbindData: '' })
          if (res.msgCode === "PTM0000") {
            this.queryBankList();
          } else {
            res.msgInfo && this.props.toast.info(res.msgInfo)
          }
        },
        error => {
          error.msgInfo && this.props.toast.info(error.msgInfo);
        }
      )
  };

  // 点击解绑按钮
  unbindHandler = params => {
    Modal.alert('', '确认解绑该卡？', [
      { text: '取消', onPress: () => { } },
      { text: '确定', onPress: () => { this.unbindCard(params) } },
    ]);
    // this.setState({ showMoudle: true, unbindData: params })
  };

  // 选择银行卡
  selectCard = obj => {
    // if (backUrlData) {
    this.setState({
      // bankName: obj.bankName,
      // lastCardNo: obj.lastCardNo,
      // bankCode: obj.bankCode,
      agrNo: obj.agrNo,
    });
    // this.props.history.replace(backUrlData);
    this.props.history.goBack();
    store.setCardData(obj);
    let paramVip = store.getParamVip() || {};
    Object.assign(paramVip, obj);
    store.setParamVip(paramVip);
    // }

  };
  // 新增授权卡
  addCard = () => {
    if (backUrlData) {
      this.setState({ isClickAdd: true });
      if (backUrlData === '/mine/confirm_purchase_page') {
        this.props.history.replace('/mine/bind_bank_card');
      } else {
        this.props.history.replace('/mine/bind_save_page')
      }
    } else {
      this.setState({ isClickAdd: true });
      this.props.history.push('/mine/bind_credit_page')
    }
  };

  render() {
    return (
      <div className={styles.select_credit_page}>
        {
          this.state.cardList.length ?
            <div>
              <p className={styles.card_tit}>{this.state.isVipEnter ? '已绑定银行卡' : '已绑定信用卡'}</p>
              <ul className={styles.card_list}>
                {
                  this.state.cardList.map((item, index) => {
                    const isSelected = this.state.agrNo === item.agrNo;
                    if (backUrlData) {
                      return (
                        <li
                          className={isSelected ? styles.active : ''}
                          key={index}
                          onClick={
                            () => this.selectCard({
                              bankName: item.bankName,
                              lastCardNo: item.lastCardNo,
                              bankCode: item.bankCode,
                              agrNo: item.agrNo
                            })
                          }
                        >
                          <span className={`bank_ico bank_ico_${item.bankCode}`}></span>
                          <span className={styles.bank_name}>{item.bankName}</span>
                          <span>···· {item.lastCardNo}</span>
                          {
                            isSelected ? (
                              <i className={styles.selected_ico}></i>
                            ) : null
                          }
                        </li>
                      )
                    } else {
                      return (
                        <li
                          key={index}
                        >
                          <SwipeAction
                            autoClose
                            right={[
                              {
                                text: '解绑',
                                onPress: () => { this.unbindHandler(item.agrNo) },
                                style: { backgroundColor: '#FF5A5A', color: 'white' },
                              },
                            ]}
                            onOpen={() => {}}
                            onClose={() => {}}
                          >
                          <span className={`bank_ico bank_ico_${item.bankCode}`}></span>
                          <span className={styles.bank_name}>{item.bankName}</span>
                          <span>···· {item.lastCardNo}</span>
                          </SwipeAction>
                        </li>
                      )
                    }
                  })
                }
              </ul>
            </div>
            : null
        }
        <p onClick={this.addCard} className={styles.add_card}><i className={styles.add_ico}></i>{this.state.isVipEnter ? '绑定银行卡' : '绑定信用卡'}</p>
        {/* {this.state.showMoudle && <Moudles cb={this} logOut={this.unbindCard.bind(this, this.state.unbindData)} textCont="确认解绑该卡？" />} */}
      </div>
    )
  }
}

