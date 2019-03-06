import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import qs from 'qs'
import { store } from 'utils/store'
import styles from './index.scss'
import wallet_img1 from './img/wallet_img1.png'
import wallet_img2 from './img/wallet_img2.png'
import wallet_img3 from './img/wallet_img3.png'
import submit_btn1 from './img/btn_bg1.png'
import submit_btn2 from './img/btn_bg2.png'
import activity_bg from './img/activity_bg.png'
import { buriedPointEvent } from 'utils/analytins'
import { activity } from 'utils/analytinsType';


@withRouter
export default class newUser_page extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showModal: false
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

  render() {
    return (
      <div className={styles.main}>
        <img src={activity_bg} className={styles.activity_bg} />
        <div className={styles.rule} onClick={() => {
          this.setState({
            showModal: true
          })
        }}>活动规则</div>
        <div className={styles.wallet}>
          <img src={wallet_img1} className={[styles.img, styles.img1].join(' ')} />
          <img src={wallet_img2} className={[styles.img, styles.img2].join(' ')} />
          <img src={wallet_img3} className={[styles.img, styles.img3].join(' ')} />
        </div>
        <div className={styles.submitBtn} onClick={this.goTo}>
          <img src={submit_btn1} className={[styles.btn, styles.btn1].join(' ')} />
          <img src={submit_btn2} className={[styles.btn, styles.btn2].join(' ')} />
        </div>
        {
          this.state.showLoginTip &&
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
          this.state.showModal ?
            <div className={styles.modal}>
              <div className={styles.mask}></div>
              <div className={styles.modalWrapper}>
                <div>
                  <h2>活动规则</h2>
                  <ol>
                    <li>1.活动时间：2019年3月6日-2019年3月8日；</li>
                    <li>2.活动对象：还到新注册用户；</li>
                    <li>3.活动内容：活动期间在此活动页注册的新用户可获得188元新手红包；</li>
                    <li>4.奖励发放：注册成功后红包以减息券形式发送至个人账户中，用于借款时使用，有效期3天；</li>
                  </ol>
                </div>
                <div className={styles.closeBtn} onClick={this.closeModal}></div>
              </div>
            </div> : null
        }
      </div>
    )
  }
}