import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import selectedImg from 'assets/images/mine/selectCard/selected_ico.png';
import addCardImg from 'assets/images/mine/selectCard/add_icon.png';
import styles from './index.scss';

const API = {
  BANKLIST: '/rcm/qrySurportBank', // 银行卡列表
}

@fetch.inject()
export default class select_save_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      agrNo: '1',
      cardList: [
        // {
        //   bankName: '建设银行',
        //   lastCardNo: '2345',
        //   bankCode: 'CCB',
        //   agrNo: '1',
        // },
        // {
        //   bankName: '工商银行',
        //   lastCardNo: '2345',
        //   bankCode: 'ICBC',
        //   agrNo: '2',
        // },
      ]
    }
  }
  componentWillMount() {
    this.queryBankList();
  }

  // 获取储蓄卡银行卡列表
  queryBankList = () => {
    this.props.$fetch
    .post(API.BANKLIST, {
      cardTyp: 'D',
      corpBusTyp: "02"
    }).then(
      res => {
        if (res.msgCode === "PTM0000") {
          this.props.toast.info(res.msgInfo)
          this.setState({
            cardList: res.data
          })
        } else {
          res.msgInfo && this.props.toast.info(res.msgInfo)
        }
      },
      err => {
        console.log(err)
      }
    )
  }

  // 选择银行卡
  selectCard = obj => {
    this.setState({
      // bankName: obj.bankName,
      // lastCardNo: obj.lastCardNo,
      // bankCode: obj.bankCode,
      agrNo: obj.agrNo,
    });
  };
  // 新增授权卡
  addCard = () => {
    this.props.history.push('/mine/bind_save_page')
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
                return (
                  <li
                    className={isSelected ? styles.active : ''}
                    key={index}
                    onClick={
                      this.selectCard.bind(this,{
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
                    { isSelected ? (
                      <img
                        className={styles.selected_ico}
                        src={selectedImg}
                        alt=""
                      />
                    ) : null}
                  </li>
                )
              })
            }
            </ul>
          </div>
          : null
        }
        <p onClick={this.addCard} className={styles.add_card}><img src={addCardImg} alt=""/>新增授权卡</p>
      </div>
    )
  }
}

