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
import { isMPOS } from 'utils/common'
import submit_btn1 from './img/btn_bg1.png'
import submit_btn2 from './img/btn_bg2.png'
import AwardShowMock from './components/AwardShowMock'
import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import { Modal } from 'antd-mobile'

const API = {
  couponActivity: '/temp/repeatUsrActivation'
}

const TipModal = (props) => {
  const { type, visible, tipOne, tipTwo, handleClose, goHome } = props
  return (
    <Modal
      visible={visible}
      transparent
      maskClosable={false}
    >
      <div className={styles.modal}>
        {/* <div className={styles.mask}></div> */}
        <div className={[styles.modalWrapper, styles.tipWrapper, type === 'button' && styles.buttonModal].join(' ')}>
          <div className={styles.tipText}>
            <span>{tipOne}</span><br />
            <span>{tipTwo}</span>
          </div>
          {
            type !== 'button' && <div className={styles.closeBtn} onClick={handleClose}></div>
          }
          {
            type === 'button' && <div className={styles.bottomBtn}>
              <span className={styles.button} onClick={handleClose}>取消</span>
              <span className={[styles.button, styles.color].join(' ')} onClick={goHome}>立即授信</span>
            </div>
          }
        </div>
      </div>
    </Modal>
  )
}

let token = ''
let tokenFromStorage = ''

@fetch.inject()
@withRouter
export default class coupon_activity_page extends PureComponent {
  constructor(props) {
    super(props)
    // 获取token
    token = Cookie.get('fin-v-card-token');
    tokenFromStorage = store.getToken();
    this.state = {
      showRuleModal: false,
      tipOne: '',
      tipTwo: '',
      tipModalType: 'default',
    }
  }

  componentDidMount() {
    const queryData = qs.parse(location.search, { ignoreQueryPrefix: true })
    if (queryData.entry) {
      // 根据不同入口来源埋点
      buriedPointEvent(activity.couponEntry, {
        entry: queryData.entry,
      })
    }
  }

  closeModal = () => {
    this.setState({
      showRuleModal: false
    })
  }

  closeTip = () => {
    this.setState({
      showTipInfo: false
    })
  }

  // mpos过来的逻辑判断
  goTo = () => {
    const queryData = qs.parse(location.search, { ignoreQueryPrefix: true })
    if (queryData.appId && queryData.token) {
      // 设置拉新活动标志
      store.setNewUserActivityFlag('NewUserActivityFlag')
      store.setCouponActivityFlag('CouponActivityFlag')
      this.props.history.push(`/mpos/mpos_middle_page${window.location.search}`)
      // this.props.history.push('/mpos/mpos_middle_page?h5Channel=MPOS_XYKHK&entry=banner&appId=APP20170000000271&token=6761b35fcc30436b84d04d3c4c5c3be3&telNo=cbc443ea4cbf7d2f84ace615690492e3&site=oldweb&scene=finance')
    } else {
      this.setState({
        showTipInfo: true,
        tipOne: '小主～',
        tipTwo: '先去登录才能参与活动哦～',
      })
    }
  }

  goHome = () => {
    this.props.history.push('/home/home')
  }

  selectCoupon = (value) => {
    if (!tokenFromStorage && !token) {
      this.props.toast.info('请先登录', 2, () => {
        this.props.history.push('/login');
      });
      return;
    }
    this.props.$fetch.post(API.couponActivity, {
      coupCode: value
    }).then(res => {
      if (res.msgCode === 'PTM0000') {
        this.setState({
          tipOne: '领取成功',
          tipTwo: '请到优惠券中查看',
          showTipInfo: true
        })
      } else if (res.msgCode === 'PTM20001') {
        this.setState({
          tipOne: '很抱歉',
          tipTwo: '请先授信才可以领取红包哦',
          showTipInfo: true,
          tipModalType: 'button'
        })
      } else {
        this.setState({
          tipOne: '很抱歉',
          tipTwo: res.msgInfo,
          showTipInfo: true
        })
      }
    })
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
      <div className={[styles.main, isMPOS() ? styles.mpos_bg : ''].join(' ')}>
        <div className={styles.rule} onClick={() => {
          this.setState({
            showRuleModal: true
          })
        }}>活动规则</div>
        {
          isMPOS() ? <div className={styles.buttonWrap}>
            <div className={styles.submitBtn} onClick={this.goTo}>
              <img src={submit_btn1} className={[styles.btn, styles.btn1].join(' ')} />
              <img src={submit_btn2} className={[styles.btn, styles.btn2].join(' ')} />
            </div>
          </div> :
            <div>
              <div className={styles.phoneWrap}>
                {/* <ul className={styles.slideWrap}>
                  <li className={styles.phoneText}>恭喜139****8763 获得30元红包</li>
                  <li className={styles.phoneText}>恭喜158****1951 获得5元红包</li>
                  <li className={styles.phoneText}>恭喜186****7327 获得50元红包</li>
                  <li className={styles.phoneText}>恭喜150****6713 获得15元红包</li>
                  <li className={styles.phoneText}>恭喜158****6357 获得88元红包</li>
                  <li className={styles.phoneText}>恭喜139****8763 获得30元红包</li>

                </ul> */}
                <AwardShowMock ></AwardShowMock>
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
          type={this.state.tipModalType}
          tipOne={this.state.tipOne}
          tipTwo={this.state.tipTwo}
          handleClose={this.closeTip}
          goHome={this.goHome}
        />
        <Modal
          visible={this.state.showRuleModal}
          transparent
          maskClosable={false}
        >
          <div className={styles.modal}>
            {/* <div className={styles.mask}></div> */}
            <div className={styles.modalWrapper}>
              <div>
                <h2>活动规则</h2>
                <ol className={styles.ruleWrap}>
                  <li>1.活动时间：2019年3月9日-2019年3月12日；</li>
                  <li>2.在还到借款还清一次及以上用户可参与；</li>
                  <li>3.用户提交授信后每天可抢1个红包，有效期7天，每日红包数量有限，抢完为止；</li>
                  <li>4.红包以减息券的形式发送至用户优惠券账户中，请在借款时使用；</li>
                  <li>5.本活动最终解释权归还到所有，如有疑问，请拨打客服热线：400-088-7626</li>
                </ol>
              </div>
              <div className={styles.closeBtn} onClick={this.closeModal}></div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}