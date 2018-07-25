import React, {PureComponent } from 'react';
import { setBackGround } from '../../../utils/Background';
import vipIcon from '../../../assets/images/menbership_card/组 5.png';
import style from './index.scss'

@setBackGround('#fff')

export default class card_home extends PureComponent {
  state = {};

  componentWillMount() {

  }

  componentDidMount() {

  }

  render() {
    return (
      <div>
        <div className={style.cardHome}>
          <div className={style.cardMoney}>
            68 <span className={style.icon}>￥</span>
          </div>
          <div className={style.cardTitle}>
            30天明星产品1次使用权  刷卡优惠超值套餐
          </div>
          <div className={style.cardTitle}>
            有效期4个月
          </div>

          {/*<div className={style.cardNumber}>*/}
            {/*8888 **** **** 8888*/}
          {/*</div>*/}
          {/*<div className={style.cardTitle}>*/}
            {/*30天明星产品1次使用权  刷卡优惠超值套餐*/}
          {/*</div>*/}
          {/*<div className={style.cardTitle}>*/}
            {/*有效期至2018/8/1*/}
          {/*</div>*/}

        </div>

        <div className={style.sureBtn} >
          确认购买
        </div>

        <div className={style.vipIcon}>
          <img src={vipIcon}/>
        </div>

        <div className={style.productList}>
          <p>1.30天明星产品专属使用权，还款更灵活</p>
          <p>2.极速放款通道，放款更快一步</p>
          <p>3.刷卡优惠券超值套餐，刷卡无担忧</p>
          <p>4.精彩活动优先通知，福利不错过</p>
          <p>更多专属特权即将上线，敬请期待吧！</p>
        </div>
        <div className={style.prompt}>
          特别提醒：刷卡超值优惠券将在7天内完成发放，可于“MPOS-我的-优惠券”进行查看，且有效期为30天请及时使用
        </div>
      </div>
    );
  }
}
