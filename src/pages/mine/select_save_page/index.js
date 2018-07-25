import React, { PureComponent } from 'react';
import selectedImg from 'assets/images/mine/selectCard/selected_ico.png';
import addCardImg from 'assets/images/mine/selectCard/add_icon.png';
import styles from './index.scss';

export default class select_save_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      agrNo: '1',
      cardList: [
        {
          bankName: '建设银行',
          lastCardNo: '2345',
          bankCode: 'CCB',
          agrNo: '1',
        },
        {
          bankName: '工商银行',
          lastCardNo: '2345',
          bankCode: 'ICBC',
          agrNo: '2',
        },
      ]
    }
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
        <p onClick={this.addCard} className={styles.add_card}><img src={addCardImg} alt=""/>新增授权卡</p>
      </div>
    )
  }
}

