import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import qs from 'qs';
import styles from './index.scss';

const API = {
  CREDCARDLIST: '/index/usrCredCardList', // 银行卡列表
  CARDAUTH: '/auth/cardAuth', // 0404-信用卡授信
  CACHECREDCARD: '/index/cacheCredCard', // 后台缓存信用卡
}

let backUrlData = ''; // 从除了我的里面其他页面进去

@fetch.inject()
export default class credit_list_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      autId: '', // 账单id
      cardList: [],
    };
    backUrlData = store.getBackUrl();
  }
  componentWillMount() {
    // store.setHistoryRouter(window.location.pathname);
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
    this.props.$fetch.get(`${API.CACHECREDCARD}/${autId}`).then(
      res => {
        if (res.msgCode === "PTM0000") {
          if (jumpFlag) {
            this.props.history.replace(backUrlData);
          }
        } else {
          res.msgInfo && this.props.toast.info(res.msgInfo)
        }
      },
      error => {
        error.msgInfo && this.props.toast.info(error.msgInfo);
      },
    );
  };
    // 新增授权卡
	goToNewMoXie = () => {
        const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
        if (queryData.autId) {
          store.setMoxieBackUrl(`/mine/credit_list_page?autId=${queryData.autId}`);
        } else {
          store.setMoxieBackUrl('/mine/credit_list_page');
        }
      
		this.props.history.push({ pathname: '/home/moxie_bank_list_page' });
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
        <p onClick={this.goToNewMoXie} className={styles.add_card}><i className={styles.add_ico}></i>新增授权卡</p>
      </div>
    )
  }
}
