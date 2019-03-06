import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import qs from 'qs'
import { store } from 'utils/store'
import styles from './index.scss'
import { buriedPointEvent } from 'utils/analytins'
import { activity } from 'utils/analytinsType'
import coupon5 from './img/coupon_bg5.png'
import coupon15 from './img/coupon_bg15.png'
import coupon30 from './img/coupon_bg30.png'
import coupon50 from './img/coupon_bg50.png'
import coupon88 from './img/coupon_bg88.png'
import stepImg from './img/step_bg.png'
import { isMPOS } from 'utils/common'
import submit_btn1 from './img/btn_bg1.png'
import submit_btn2 from './img/btn_bg2.png'

const TipModal = (props) => {
  const { type, visible, tipInfo, handleClose, goHome } = props
  return (
    <div>
      {
        visible ?
          <div className={styles.modal}>
            <div className={styles.mask}></div>
            <div className={[styles.modalWrapper, styles.tipWrapper].join(' ')}>
              <div className={styles.tipText}>
                <span>小主～</span><br />
                <span>{tipInfo}</span>
              </div>
              {
                type !== 'button' && <div className={styles.closeBtn} onClick={handleClose}></div>
              }
              {
                type === 'button' && <div className={styles.bottomBtn}>
                  <span className={styles.button} onClick={handleClose}>取消</span>
                  <span className={styles.button} onClick={goHome}>去授权</span>
                </div>
              }
            </div>
          </div> : null
      }
    </div>
  )
}


@withRouter
export default class coupon_activity_page extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showModal: false,
      tipInfo: '先去登录才能参与活动哦～'
    }
  }

  componentDidMount() {
    const queryData = qs.parse(location.search, { ignoreQueryPrefix: true })
    if (queryData.entry && queryData.h5Channel) {
      // 根据不同入口来源埋点
      buriedPointEvent(activity.couponEntry, {
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
      showTipInfo: false
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
        showTipInfo: true
      })
    }
  }

  goHome = () => {
    this.props.history.push('/home/home')
  }

  selectCoupon = (value) => {
    console.log(value)
  }

  render() {
    const couponList = [
      {
        src: coupon5,
        value: 5
      },
      {
        src: coupon15,
        value: 15
      },
      {
        src: coupon30,
        value: 30
      },
      {
        src: coupon50,
        value: 50
      },
      {
        src: coupon88,
        value: 88
      }
    ]
    return (
      <div className={[styles.main, !isMPOS() ? styles.mpos_bg : ''].join(' ')}>
        <div className={styles.rule} onClick={() => {
          this.setState({
            showModal: true
          })
        }}>活动规则</div>
        {
          !isMPOS() ? <div className={styles.buttonWrap}>
            {/* <img src={stepImg} className={styles.stepImg} /> */}
            <div className={styles.submitBtn} onClick={this.goTo}>
              <img src={submit_btn1} className={[styles.btn, styles.btn1].join(' ')} />
              <img src={submit_btn2} className={[styles.btn, styles.btn2].join(' ')} />
            </div>
          </div> :
            <div>
              <div className={styles.phoneWrap}>
                <ul className={styles.slideWrap}>
                  <li className={styles.phoneText}>恭喜139****8763 获得30元红包</li>
                  <li className={styles.phoneText}>恭喜158****1951 获得5元红包</li>
                  <li className={styles.phoneText}>恭喜186****7327 获得50元红包</li>
                  <li className={styles.phoneText}>恭喜150****6713 获得15元红包</li>
                  <li className={styles.phoneText}>恭喜158****6357 获得88元红包</li>
                  <li className={styles.phoneText}>恭喜139****8763 获得30元红包</li>

                </ul>
              </div>
              <div className={styles.couponWrap}>
                {
                  couponList.map(item => (
                    <img className={styles.couponItem} src={item.src} onClick={() => {
                      this.selectCoupon(item.value)
                    }} key={item.value} />
                  ))
                }
              </div>
            </div>
        }
          <TipModal
            visible={this.state.showTipInfo}
            type='button'
            tipInfo={this.state.tipInfo}
            handleClose={this.closeTip}
            goHome={this.goHome}
          />
        {
          this.state.showModal ?
            <div className={styles.modal}>
              <div className={styles.mask}></div>
              <div className={styles.modalWrapper}>
                <div>
                  <h2>活动规则</h2>
                  <ol>
                    <li>1.活动时间：2019年3月9日-2019年3月12日；</li>
                    <li>2.在还到借款还清一次及以上用户可参与；</li>
                    <li>3.用户提交授信后每天可抢1个红包，有效期7天，每日红包数量有限，抢完为止；</li>
                    <li>4.红包以减息券的形式发送至用户优惠券账户中，请在借款时使用；</li>
                    <li>5.本活动最终解释权归还到所有，如有疑问，请拨打客服热线：400-088-7626</li>
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