import React, { PureComponent } from 'react';
import { store } from 'utils/common';
import fetch from 'sx-fetch';
import qs from 'qs';
import styles from './index.scss';
const noRouterBack = require('utils/noRouterBack');

const API = {
  CREDCARDLIST: '/index/usrCredCardList', // 银行卡列表
  CARDAUTH: '/auth/cardAuth', // 0404-信用卡授信
}

const backUrlData = store.getBackUrl(); // 从除了我的里面其他页面进去

@fetch.inject()
export default class credit_list_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      autId: '', // 账单id
      cardList: [],
      showMoudle: false, // 是否展示确认解绑的modal
      unbindData: '', // 解绑卡的数据
    }
  }
  componentWillMount() {
    store.setHistoryRouter(window.location.pathname);
    noRouterBack(); // 禁用浏览器返回
    this.queryBankList();
    const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    if (queryData.autId) {
      this.setState({
        autId: queryData.autId,
      });
      this.sendSelectedCard(queryData.autId, false);
    }
  }
  componentWillUnmount() {
    store.removeBackUrl();
  }

  // 获取信用卡银行卡列表
  queryBankList = () => {
    this.props.$fetch
      .post(API.CREDCARDLIST).then(
        res => {
          if (res.msgCode === "PTM0000") {
            this.setState({
              cardList: res.data ? res.data : []
            })
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

  // 选择银行卡
  selectCard = obj => {
    // if (backUrlData) {
    this.setState({
      // bankName: obj.bankName,
      // lastCardNo: obj.lastCardNo,
      // bankCode: obj.bankCode,
      autId: obj.autId,
    });
    this.sendSelectedCard(obj.autId, true);
    // this.props.$fetch.get(`/index/cacheCredCard/${obj.autId}`).then(() => {
    //   this.props.history.replace(backUrlData);
    // })
    // 如果选择的是同一张卡则不清除session里的RepaymentModalData
    const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    if (queryData.autId && queryData.autId !== obj.autId) {
      store.removeRepaymentModalData();
    }
    // store.setCardData(obj);
    // }
  };
  // 告诉后台选中的是哪张卡
  sendSelectedCard = (autId, jumpFlag) => {
    this.props.$fetch.get(`/index/cacheCredCard/${autId}`).then(() => {
      if (jumpFlag) {
        this.props.history.replace(backUrlData);
      }
    });
  };
  // 新增授权卡
  addCard = () => {
    this.props.$fetch.post(API.CARDAUTH).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
        store.setMoxieBackUrl(`/mine/credit_list_page?autId=${queryData.autId}`);
        window.location.href = result.data.url;
      } else {
        this.props.toast.info(result.msgInfo);
      }
    });
  };

  render() {
    return (
      <div className={styles.credit_list_page}>
        {
          this.state.cardList.length ?
            <div>
              <p className={styles.card_tit}>已绑定信用卡</p>
              <ul className={styles.card_list}>
                {
                  this.state.cardList.map((item, index) => {
                    const isSelected = this.state.autId === item.autId;
                    const icoClass = item.autSts === '2' ? `bank_ico bank_ico_${item.bankNo}` : `bank_ico black_logo`;
                    return (
                      <li
                        className={isSelected ? styles.active : ''}
                        key={index}
                        onClick={
                          this.selectCard.bind(this, item)
                        }
                      >
                        <span className={icoClass}></span>
                        {
                          item.autSts === '1' ?
                            <span className={`${styles.bank_name} ${styles.pending}`}>审核中 ····</span>
                            : item.autSts === '3' ?
                              <span className={`${styles.bank_name} ${styles.failed}`}>审核失败</span>
                              :
                              <span className={styles.bank_name}>{item.bankName}</span>
                        }
                        {
                          item.autSts === '2' ?
                            <span>···· {item.last}</span>
                            : null
                        }
                        {
                          isSelected ? (
                            <i className={styles.selected_ico}></i>
                          ) : null
                        }
                      </li>
                    )
                  })
                }
              </ul>
            </div>
            : null
        }
        <p onClick={this.addCard} className={styles.add_card}><i className={styles.add_ico}></i>新增授权卡</p>
      </div>
    )
  }
}
