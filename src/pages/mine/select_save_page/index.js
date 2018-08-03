import React, { PureComponent } from 'react';
import { SwipeAction } from 'antd-mobile';
import { store } from 'utils/common';
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
export default class select_save_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      agrNo: '',
      cardList: [],
      isClickAdd: false, // 是否点击了添加授权卡
      // showMoudle: false, // 是否展示确认解绑的modal
      // unbindData: '', // 解绑卡的数据
    }
    backUrlData = store.getBackUrl();
  }
  componentWillMount() {
    // 改变title值
    if (!backUrlData) {
      this.props.setTitle('储蓄卡管理');
    }
    // 根据不同页面跳转过来查询不同接口
    if (backUrlData && backUrlData === '/mine/confirm_purchase_page') {
      this.queryVipBankList();
    } else {
      this.queryBankList();
    }
    // 设置跳转过来选中的效果
    const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    if (queryData.agrNo) {
      this.setState({
        agrNo: queryData.agrNo,
      });
    }
  }
  componentWillUnmount() {
    if (!this.state.isClickAdd) {
      store.removeBackUrl(); // 清除session里的backurl的值
    }
  }
  // 获取会员卡的银行列表
  queryVipBankList = () => {
    this.props.$fetch
      .post(API.VIPBANKLIST, {
        type: '5',
        corpBusTyp: '31',
      }).then(
        res => {
          if (res.msgCode === "PTM0000") {
            this.setState({
              cardList: res.data ? res.data : []
            })
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
  // 获取储蓄卡银行卡列表
  queryBankList = () => {
    this.props.$fetch
      .post(API.BANKLIST, {
        // agrNo:query.agrNo,
        type: '2', //所有储蓄卡列表
        corpBusTyp: '01', //01：银行卡鉴权
      }).then(
        res => {
          if (res.msgCode === "PTM0000") {
            this.setState({
              cardList: res.cardList ? res.cardList : []
            })
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

  // 点击解绑按钮
  unbindHandler = params => {
    Modal.alert('', '确认解绑该卡？', [
      { text: '取消', onPress: () => { } },
      { text: '确定', onPress: () => { this.unbindCard(params) } },
    ]);
    // this.setState({ showMoudle: true, unbindData: params })
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

  // 选择银行卡
  selectCard = obj => {
    console.log(backUrlData)
    // if (backUrlData) {
    this.setState({
      // bankName: obj.bankName,
      // lastCardNo: obj.lastCardNo,
      // bankCode: obj.bankCode,
      agrNo: obj.agrNo,
    });
    this.props.history.goBack();
    store.setCardData(obj);
    // }
  };
  // 新增授权卡
  addCard = () => {
    if (backUrlData && backUrlData === '/mine/confirm_purchase_page') {
      this.setState({ isClickAdd: true });
      this.props.history.replace('/mine/bind_bank_card')
    } else {
      this.setState({ isClickAdd: true });
      this.props.history.push('/mine/bind_save_page')
    }
  };

  render() {
    return (
      <div className={styles.select_save_page}>
        {
          this.state.cardList.length ?
            <div>
              <p className={styles.card_tit}>已绑定储蓄卡</p>
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
                            onOpen={() => console.log('global open')}
                            onClose={() => console.log('global close')}
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
        <p onClick={this.addCard} className={styles.add_card}><i className={styles.add_ico}></i>新增授权卡</p>
        {/* {this.state.showMoudle && <Moudles cb={this} logOut={this.unbindCard.bind(this, this.state.unbindData)} textCont="确认解绑该卡？" />} */}
      </div>
    )
  }
}

