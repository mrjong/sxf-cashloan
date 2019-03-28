import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import qs from 'qs'
import { store } from 'utils/store'
import styles from './index.scss'
// import wallet_img1 from './img/wallet_img1.png'
// import wallet_img2 from './img/wallet_img2.png'
// import wallet_img3 from './img/wallet_img3.png'
import activity_bg from './img/activity_bg.png'
import coupon_bg from './img/coupon_bg.png'
import get_coupon_btn from './img/get_coupon_btn.png'
import tit_bg from './img/title_bg.png'
import award_list from './img/award_list.png'
import coupon_price from './img/coupon_price.png'
import check_btn from './img/check_btn.png'
import modal_bg from './img/modal_bg.png'
import { buriedPointEvent } from 'utils/analytins'
import { activity } from 'utils/analytinsType'
import ButtonCustom from 'components/ButtonCustom'
import { Carousel } from 'antd-mobile'


@withRouter
export default class funsisong_page extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showModal: false,
      awardList: [ // 获奖名单
        {
          mobile: '183****7898',
          award: '20元现金'
        },
        {
          mobile: '183****1234',
          award: '2元现金'
        },
        {
          mobile: '183****5678',
          award: '15元现金'
        },
        {
          mobile: '183****3456',
          award: '10元现金'
        },
      ],
      showLoginTip: false, // 是否登陆弹框
      showAwardModal: false, // 获奖弹框
      showNoAwardModal: false, // 无领取资格弹框
    }
  }

  componentDidMount() {
    const queryData = qs.parse(location.search, { ignoreQueryPrefix: true })
    if (queryData.entry && queryData.h5Channel) {
      // 根据不同入口来源埋点
      buriedPointEvent(activity.newUserEntry, {
        entry: queryData.entry,
        h5Channel: queryData.h5Channel
      })
    }
  }

  closeModal = () => {
    this.setState({
      showModal: false
    })
  }
  closeTip = () => {
    this.setState({
      showLoginTip: false
    })
  }

  goTo = () => {
    const queryData = qs.parse(location.search, { ignoreQueryPrefix: true })
    if (queryData.appId && queryData.token) {
      // 设置拉新活动标志
      store.setNewUserActivityFlag('NewUserActivityFlag')
      this.props.history.push(`/mpos/mpos_middle_page${window.location.search}`)
    } else {
      this.setState({
        noLogin: true,
        showLoginTip: true
      })
    }
  }

  getRedBag = () => {
    
  }

  // 跳转协议
	go = (url) => {
		this.props.history.push(`/protocol/${url}`);
  };
  
  // 关闭奖品弹框
  closeAwardModal = () => {
    this.setState({
      showAwardModal: false
    })
  }

  // 关闭暂无领取资格弹框
  closeNoAwardModal = () => {
    this.setState({
      showNoAwardModal: false
    })
  }

  // 进入首页
  goHomePage = () => {
    this.props.history.push('/home/home');
  }

  // 领取优惠劵
  getCoupon = () => {
    this.setState({
      showAwardModal: true,
    })
  }

  render() {
    const { awardList, showModal, showAwardModal, showLoginTip, showNoAwardModal } = this.state;
    return (
      <div className={styles.main}>
        <img src={activity_bg} className={styles.activity_bg} />
        <div className={styles.rule} onClick={() => {
          this.setState({
            showModal: true
          })
        }}>活动规则</div>
        <div className={styles.couponContainer}>
          <div className={styles.couponBox}>
            <h3 className={styles.couponTit}>
              <span>【新用户专享】</span>
              先领券再借款，更省费用
            </h3>
            <div className={styles.imgContainer}>
              <img src={coupon_bg} className={styles.couponBg} alt="coupon_bg" />
              <img src={get_coupon_btn} onClick={this.getCoupon} className={styles.getBtn} alt="get_coupong_btn" />
            </div>
          </div>
        </div>
        <div className={styles.redBagCont}>
          <img src={tit_bg} alt="tit_bg" className={styles.titBg} />
          <p className={styles.price}>
            <img src={coupon_price} alt="coupon_price" />元
          </p>
          <p className={styles.tipText}>支持提现，借得多得的多</p>
          <ButtonCustom className={styles.jumpBtn} onClick={this.getRedBag}>还信用卡赚现金</ButtonCustom>
          <img src={award_list} alt="award_list" className={styles.awardList} />
          <Carousel className={styles.awardCarousel}
            vertical
            dots={false}
            dragging={false}
            swiping={false}
            autoplay
            infinite
            // frameOverflow='auto'
          >
            {awardList.map((item, index) => {
              return (
                <div key={index} className={styles.carouselItem}>
                  {item.mobile}<span>{item.award}</span>
                </div>
              )
            })}
          </Carousel>
          <p class={styles.protocolBox}>
            参与即同意<span 
              onClick={() => {
                this.go('register_agreement_page');
              }}>
              《随行付金融用户注册协议》
            </span>
            <span onClick={() => {
              this.go('privacy_agreement_page');
            }}>
            《随行付用户隐私权政策》
            </span>
          </p>
        </div>
        {/* <div className={styles.wallet}>
          <img src={wallet_img1} className={[styles.img, styles.img1].join(' ')} />
          <img src={wallet_img2} className={[styles.img, styles.img2].join(' ')} />
          <img src={wallet_img3} className={[styles.img, styles.img3].join(' ')} />
        </div>
        <div className={styles.submitBtn} onClick={this.goTo}>
          <img src={submit_btn1} className={[styles.btn, styles.btn1].join(' ')} />
          <img src={submit_btn2} className={[styles.btn, styles.btn2].join(' ')} />
        </div> */}
        {
          showLoginTip &&
          <div className={styles.modal}>
            <div className={styles.mask}></div>
            <div className={[styles.modalWrapper, styles.tipWrapper].join(' ')}>
              <div className={styles.tipText}>
                <span>小主～</span><br/>
                <span>先去登录才能参与活动哦～</span>
              </div>
              <div className={styles.closeBtn} onClick={this.closeTip}></div>
            </div>
          </div>
        }
        {
          showModal ?
            <div className={styles.modal}>
              <div className={styles.mask}></div>
              <div className={styles.modalWrapper}>
                <div>
                  <h2>活动规则</h2>
                  <ol>
                    <li>1.活动时间：2019年3月27日—2019年4月3日；</li>
                    <li>2.活动对象：本活动仅限还到用户参与；</li>
                    <li>3.奖励规则：</li>
                    <li>1）活动期间成功注册还到的用户可获得668元减息券，有效期7天；</li>
                    <li>2）活动期间借款3个月及以上期限的用户，可获得现金返现奖励，借款额度越高，返现金额越大，888元封顶（可提现）；</li>
                    <li>3）现金奖励于借款成功之日实时下发，您可到随行付还到—我的—我的钱包中查看；</li>
                    <li>4.提现手续费0.2元／笔，由用户自行承担；</li>
                    <li>5.现金奖励自下发之日起8天有效，未在有效期提现，视为放弃；</li>
                    <li>6.本活动最终解释权归还到所有，客服电话：400-088-7626。</li>
                  </ol>
                </div>
                <div className={styles.closeBtn} onClick={this.closeModal}></div>
              </div>
            </div> : null
        }
        {
          showAwardModal ?
            <div className={styles.modal}>
              <div className={styles.mask}></div>
              <div className={`${styles.modalWrapper} ${styles.modalWrapper2}`}>
                <div className={styles.awardModalCont}>
                  <img src={modal_bg} className={styles.modalBg} alt="modal_bg" />
                  <img src={check_btn} className={styles.checkBtn} onClick={this.goHomePage} alt="check_btn" />
                </div>
                <div className={styles.closeBtn} onClick={this.closeAwardModal}></div>
              </div>
            </div> : null
        }
        {
          showNoAwardModal ?
            <div className={styles.modal}>
              <div className={styles.mask}></div>
              <div className={`${styles.modalWrapper} ${styles.modalWrapper3}`}>
                <div className={styles.noAwardModalCont}>
                  <h3 className={styles.title}>您已注册，暂无领取资格</h3>
                  <p className={styles.contText}>完成借款，最高送888元现金，快去参与！</p>
                  <ButtonCustom className={styles.joinBtn} onClick={this.goHomePage}>立即参与</ButtonCustom>
                </div>
                <div className={styles.closeIcon} onClick={this.closeNoAwardModal}></div>
              </div>
            </div> : null
        }
      </div>
    )
  }
}