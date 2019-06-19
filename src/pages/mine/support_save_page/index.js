import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import styles from './index.scss';
import qs from 'qs';
import { store } from '../../../utils/store';

const API = {
  SUPPORTBANKLIST: '/withhold/binkLists', // 银行卡列表
}
let queryData = ''

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
		queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
  }

  // 获取银行卡列表
  queryBankList = () => {
    const insuranceFlag = store.getInsuranceFlag();

		const sendParams = insuranceFlag ? {
      cardTyp: 'D',
      corpBusTyp: '',
      supportType: 'ZY', // JR随行付金融 XD随行付小贷 ZY中元保险
    } : {
      cardTyp: 'D',
      corpBusTyp: '',
    }
    this.props.$fetch
      .post(API.SUPPORTBANKLIST, sendParams).then(
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

  handleItemSelect = (name) => {
    if(queryData.isClick !== '0') return
    store.setDepositBankName(name)
    this.props.history.goBack()
  }

  render() {
    return (
      <div className={styles.support_save_page}>
        {
          this.state.cardList.length ?
            <ul className={styles.card_list}>
              {
                this.state.cardList.map((item, index) => {
                  return (
                    <li key={index} onClick={()=>{this.handleItemSelect(item.corpOrgSnm)}}>
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
