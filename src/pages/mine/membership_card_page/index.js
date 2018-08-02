import React, { PureComponent } from 'react';
import fetch from "sx-fetch"
import { setBackGround } from 'utils/Background';
import vipIcon from 'assets/images/menbership_card/vipIcon.png';
import styles from './index.scss'
import ButtonCustom from 'components/button';
import { store } from 'utils/common';
@setBackGround('#fff')
@fetch.inject()
export default class card_home extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      status: false,
      cardState: ''
    };
  }

  componentWillMount() {
    let cardInfo = store.getVIPInfo()
    if (cardInfo && cardInfo.memSts === '1') {
      this.setState({
        cardInfo,
        status: true,
        cardState: '1'
      })
    } else {
      this.getProCard()
    }
  }

  // 获取会员卡产品信息
  getProCard = () => {
    this.props.$fetch.post('/my/quickpay/queryMemPrdInfo').then(res => {
      if (res.msgCode === "PTM0000") {
        this.setState({
          data: res.data,
          status: true,
          cardState: '0',
          select: res.data[0].memPrdId,
          money: res.data[0].price
        })
      } else {
        this.props.toast.info(res.msgInfo)
      }
    })
  }
  // 选择会员卡
  selectOne = (id, money) => {
    this.setState({
      select: id,
      money
    })
  }
  // 立即购买
  buy = () => {
    this.checkoutCard()
  }
  // 校验是否绑卡
  checkoutCard = () => {
    this.props.$fetch.post("/my/quickpay/cardList", {
      type: '5',
      corpBusTyp: '31'
    }).then(
      res => {
        if (res.msgCode === "PTM3021") {
          let param = {
            money: this.state.money,
            memPrdId: this.state.select
          }
          store.setParamVip(param)
          this.props.history.push("/mine/bind_bank_card")
        } else if (res.msgCode === "PTM0000") {
          let param = {
            money: this.state.money,
            memPrdId: this.state.select,
            bankName: res.data[0].bankName,
            agrNo: res.data[0].agrNo,
            cardTyp: res.data[0].cardTyp,
            lastCardNo: res.data[0].lastCardNo,
            bankCode: res.data[0].bankCode
          }
          store.setParamVip(param)
          this.props.history.push("/mine/confirm_purchase_page")
        } else {
          this.props.toast.info(res.msgInfo)
        }
      },
      err => {
        console.log(err)
      }
    )
  }
  render() {
    const { data } = this.state
    return (
      <div className={styles.membership_card_page} >
        {
          this.state.status && this.state.cardState === '0' ? data && data.map((item, index) => {
            return (<div key={index} onClick={() => {
              this.selectOne(item.memPrdId, item.price)
            }} className={styles.cardHome}>
              <div className={styles.cardMoney}>
                {item.price} <span className={styles.icon}>￥</span>
              </div>
              <div className={styles.cardTitle}>
                <span className={styles.left}>
                  {item.memPrdDes && item.memPrdDes.split("|")[0]}
                </span>
                <span className={styles.right}>
                  {item.memPrdDes && item.memPrdDes.split("|")[1]}
                </span>
              </div>
              <div className={styles.cardTitle}>
                有效期{item.menTerm || 0}个月
            </div>
            </div>)
          }) : null
        }{
          this.state.status && this.state.cardState === '1' ? cardInfo && cardInfo.memList && cardInfo.memList.map((item, index) => {
            return (<div key={index} onClick={() => {
              this.selectOne(item.memPrdId, item.price)
            }} className={styles.cardHome}>
              <div className={styles.cardMoney}>
                {item.price} <span className={styles.icon}>￥</span>
              </div>
              <div className={styles.cardTitle}>
                <span className={styles.left}>
                  {item.memPrdDes && item.memPrdDes.split("|")[0]}
                </span>
                <span className={styles.right}>
                  {item.memPrdDes && item.memPrdDes.split("|")[1]}
                </span>
              </div>
              <div className={styles.cardTitle}>
                有效期至2018/8/1
            </div>
            </div>)
          }) : null
        }

        < div className={styles.btn} >
          <ButtonCustom onClick={this.buy} className={styles.sureBtn}>确认购买</ButtonCustom>
        </div >

        <div className={styles.vipIcon}>
          <img src={vipIcon} />
        </div>

        <div className={styles.productList}>
          <p>1.30天明星产品专属使用权，还款更灵活</p>
          <p>2.极速放款通道，放款更快一步</p>
          <p>3.刷卡优惠券超值套餐，刷卡无担忧</p>
          <p>4.精彩活动优先通知，福利不错过</p>
          <p>更多专属特权即将上线，敬请期待吧！</p>
        </div>
        <div className={styles.prompt}>
          特别提醒：刷卡超值优惠券将在7天内完成发放，可于“MPOS-我的-优惠券”进行查看，且有效期为30天请及时使用
        </div>
      </div >
    );
  }
}
