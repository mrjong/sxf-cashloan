import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import styles from './index.scss';

const API = {
  SUPPORTBANKLIST: '/withhold/binkLists', // 银行卡列表
}

@fetch.inject()
export default class support_save_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      cardList: []
    }
  }
  componentWillMount() {
    this.queryBankList();
  }

  // 获取银行卡列表
  queryBankList = () => {
    this.props.$fetch
      .post(API.SUPPORTBANKLIST, {
        cardTyp: 'D',
        corpBusTyp: '01',
      }).then(
        res => {
          if (res.msgCode === 'PTM0000') {
            this.setState({
              cardList: res.data ? res.data : []
            })
          } else {
            res.msgInfo && this.props.toast.info(res.msgInfo)
          }
        },
        error => {
          error.msgInfo && this.props.toast.info(error.msgInfo);
        }
      )
  };

  render() {
    return (
      <div className={styles.support_save_page}>
        {
          this.state.cardList.length ?
            <ul className={styles.card_list}>
              {
                this.state.cardList.map((item, index) => {
                  return (
                    <li key={index}>
                      <span className={`bank_ico bank_ico_${item.corpOrgId}`}></span>
                      <span className={styles.bank_name}>{item.corpOrgSnm}</span>
                    </li>
                  )
                })
              }
            </ul> : null
        }
      </div>
    )
  }
}