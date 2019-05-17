import React, { PureComponent } from 'react';
import { SwipeAction } from 'antd-mobile';
import { store } from 'utils/store';
import { Modal, Icon } from 'antd-mobile';
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
      this.props.setTitle('选择银行卡');
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
        cardData = this.state.cardList.filter(item => item.agrNoList.includes(this.state.agrNo));
      }
      let cardDatas = {};
      // 如果是首页则多存一个参数为showModal的字段，以便首页弹框
      if (backUrlData === '/home/home') {
        cardDatas = { showModal: true, ...cardData[0] };
      } else {
        cardDatas = cardData[0];
      }
      if (cardDatas) {
        store.setCardData(cardDatas);
      }
    }
  };
  // 获取储蓄卡银行卡列表
  queryBankList = () => {
    this.props.$fetch
      .post(API.BANKLIST, {
        // agrNo:query.agrNo,
        type: '2', //所有储蓄卡列表
        corpBusTyp: '',
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
    const ele = (<div style={{ lineHeight: 3 }}>确认解绑该卡？</div>)
    Modal.alert('', ele, [
      { text: '取消', onPress: () => { } },
      { text: '确定', onPress: () => { this.unbindCard(params) } },
    ]);
  };

  // 解绑银行卡
  unbindCard = agrNo => {
    this.props.$fetch
      .get(`${API.UNBINDCARD}/${agrNo}`).then(
        res => {
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

  //存储现金分期卡信息
	storeCashFenQiCardData = (cardDatas) => {
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		const cashFenQiCardArr = store.getCashFenQiCardArr()
		//现金分期收、还款银行卡信息
		if (queryData.cardType === 'resave') {
      cashFenQiCardArr[0] = cardDatas
		} else if (queryData.cardType === 'pay') {
			cashFenQiCardArr[1] = cardDatas
    }
		store.setCashFenQiCardArr(cashFenQiCardArr)
	}

  // 选择银行卡
  selectCard = obj => {
    // if (backUrlData) {
    this.setState({
      // bankName: obj.bankName,
      // lastCardNo: obj.lastCardNo,
      // bankCode: obj.bankCode,
      agrNo: obj.agrNo,
    });
    this.props.history.goBack();
    let cardDatas = {};
    // 如果是首页则多存一个参数为showModal的字段，以便首页弹框
    if (backUrlData === '/home/home') {
      cardDatas = { showModal: true, ...obj };
    } else {
      cardDatas = obj;
    }
    this.storeCashFenQiCardData(cardDatas)
    store.setCardData(cardDatas);
    let paramVip = store.getParamVip() || {};
    Object.assign(paramVip, obj);
    store.setParamVip(paramVip);
    // }
  };

  // 新增授权卡
  addCard = () => {
    const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    if (backUrlData) {
      this.setState({ isClickAdd: true });
      if (backUrlData === '/mine/confirm_purchase_page') {
        this.props.history.replace('/mine/bind_bank_card')
      } else {
        this.props.history.replace(`/mine/bind_save_page${queryData.cardType ? `?cardType=${queryData.cardType}` : ''}`)
      }
    } else {
      this.setState({ isClickAdd: true });
      this.props.history.push(`/mine/bind_save_page${queryData.cardType ? `?cardType=${queryData.cardType}` : ''}`)
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
                    const isSelected = item.agrNoList.includes(this.state.agrNo);
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
                              <Icon type="check-circle-o" color='#5CE492' className={styles.selected_ico} />
                            ) : null
                          }
                        </li>
                      )
                    } else {
                      return (
                        <li
                          key={index}
                        >
                          {/* <SwipeAction
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
                          
                          </SwipeAction> */}
                          <span className={`bank_ico bank_ico_${item.bankCode}`}></span>
                          <span className={styles.bank_name}>{item.bankName}</span>
                          <span>···· {item.lastCardNo}</span>
                        </li>
                      )
                    }
                  })
                }
              </ul>
            </div>
            : null
        }
        <p onClick={this.addCard} className={styles.add_card}><i className={styles.add_ico}></i>绑定储蓄卡</p>
      </div>
    )
  }
}

