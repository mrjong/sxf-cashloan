import React, { PureComponent } from 'react';
import { store } from 'utils/common';
import fetch from 'sx-fetch';
import styles from './index.scss';

const API = {
  BANKLIST: '/my/card/list', // 银行卡列表
  UNBINDCARD: '/my/card/unbind', // 解出银行卡绑定
}

const backUrlData = store.getBackUrl(); // 从除了我的里面其他页面进去

@fetch.inject()
export default class select_credit_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      agrNo: '', // 银行卡协议号
      cardList: [],
    }
  }
  componentWillMount() {
    this.queryBankList();
  }

  // 获取银行卡列表
  queryBankList = () => {
    this.props.$fetch
      .post(API.BANKLIST, {
        // agrNo:query.agrNo,
        type: '4', //所有信用卡列表
        corpBusTyp: '01', //01：银行卡鉴权
      }).then(
        res => {
          if (res.msgCode === "PTM0000") {
            this.setState({
              cardList: res.cardList ? res.cardList : []
            })
          } else {
            if(res.msgCode === 'PTM3021') {
              this.setState({
                cardList: []
              });
              return ;
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
    if (backUrlData) {
      this.setState({
        // bankName: obj.bankName,
        // lastCardNo: obj.lastCardNo,
        // bankCode: obj.bankCode,
        agrNo: obj.agrNo,
      });
    }

  };
  // 新增授权卡
  addCard = () => {
    this.props.history.push('/mine/bind_credit_page')
  };

  render() {
    return (
      <div className={styles.select_credit_page}>
        {
          this.state.cardList.length ?
            <div>
              <p className={styles.card_tit}>已绑定信用卡</p>
              <ul className={styles.card_list}>
                {
                  this.state.cardList.map((item, index) => {
                    const isSelected = this.state.agrNo === item.agrNo;
                    return (
                      <li
                        className={isSelected ? styles.active : ''}
                        key={index}
                        onClick={
                          this.selectCard.bind(this, {
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
                          backUrlData ?
                            isSelected ? (
                              <i className={styles.selected_ico}></i>
                            ) : null
                            :
                            <button className={styles.unbind_btn} onClick={this.unbindCard.bind(this, item.agrNo)}>解绑</button>
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

