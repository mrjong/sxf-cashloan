import React, { PureComponent } from 'react'
import qs from 'qs'
import styles from './index.scss'
import main_logo from './img/main.png'
import countdown_bg from './img/countdown.png'
import hd_logo from '../../../assets/images/common/black_logo.png'
import btn_bg from './img/btn_bg.png'
import coin_bg from './img/coin_bg.png'
import rule_bg from './img/rule_bg.png'
import { buriedPointEvent } from 'utils/analytins'
import { activity } from 'utils/analytinsType'
import SmsAlert from '../components/SmsAlert'
import Alert_mpos from 'pages/mpos/mpos_no_realname_alert_page';
import AwardShowMock from './AwardShowMock'
import RuleModal from '../components/RuleModal'
import { store } from '../../../utils/store';
import { checkEngaged, checkIsEngagedUser } from '../../../utils'
import { isMPOS } from 'utils/common';
import Cookie from 'js-cookie'
import fetch from 'sx-fetch';
import ACTipAlert from 'components/ACTipAlert';

const API = {
  queryUsrInfo: '/signup/getUsrSts'
}

@fetch.inject()
export default class funsisong_page extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      isSelProtocal: true
    }
  }

  componentDidMount() {
    const queryData = qs.parse(location.search, { ignoreQueryPrefix: true })
    if (queryData.entry) {
      buriedPointEvent(activity.jd618Entry, {
        entry: queryData.entry
      })
    }
  }

  // 跳转协议
  go = (url) => {
    this.props.history.push(`/protocol/${url}`);
  };

  // 进入首页
  goHomePage = async () => {
    let ischeckEngaged = await checkEngaged({
      $props: this.props,
      AcCode: 'AC20190618_618'
    });
    if (ischeckEngaged.msgCode === 'PTM0000') {
      let ischeckIsEngagedUser = await checkIsEngagedUser({
        $props: this.props,
        AcCode: 'AC20190618_618'
      });
      if (
        // 未参与
        ischeckIsEngagedUser.msgCode === 'PTM0000' &&
        ischeckIsEngagedUser.data &&
        ischeckIsEngagedUser.data.isEngagedUser === '1'
      ) {
        this.queryUsrInfo()

      } else if (
        //已参与
        ischeckIsEngagedUser.msgCode === 'PTM0000' &&
        ischeckIsEngagedUser.data &&
        ischeckIsEngagedUser.data.isEngagedUser === '0'
      ) {
        this.setState({
          ACTipAlertShow: true,
          alertDesc: '每位用户仅有1次参与机会，不要太贪心哦！'
        })
      }
    } else if (ischeckEngaged.msgCode === 'PTM1000') {
      this.props.toast.info(ischeckEngaged.msgInfo)
      setTimeout(() => {
        this.props.history.push('/login')
      }, 2000)
    } else {
      this.props.toast.info(ischeckEngaged.msgInfo)
    }
  }

  queryUsrInfo = () => {
    this.props.$fetch.post(API.queryUsrInfo).then(res => {
      if (res.msgCode === 'PTM0000' && !res.data.totBal) {
        store.setAC20190618(true)
        this.props.history.push('/home/home');
      } else {
        this.setState({
          ACTipAlertShow: true,
          alertDesc: '很抱歉,您没有活动参与资格~'
        })
      }
    })
  }

  closeBtnFunc = () => {
    this.setState({
      ACTipAlertShow: false,
    }, () => {
      this.props.history.push('/home/home');
      store.setAC20190618(true)
    })
  };

  joinNow = () => {
    buriedPointEvent(activity.jd618BtnClick);
    if (!this.state.isSelProtocal) {
      this.props.toast.info('请先勾选协议');
      return;
    }
    const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
    if (isMPOS()) {
      if (queryData.appId && queryData.token) {
        this.child.validateMposRelSts({
          smsProps_disabled: true,
          loginProps_disabled: true,
          loginProps_needLogin: true,
          otherProps_type: 'home'
        });
      } else {
        this.setState({
          showLoginTip: true
        });
      }
    } else if (Cookie.get('fin-v-card-token')) {
      store.setToken(Cookie.get('fin-v-card-token'));
      this.goHomePage();
    }
  }

  onRef = (ref) => {
    this.child = ref;
  };

  checkAgreement = () => {
    this.setState({
      isSelProtocal: !this.state.isSelProtocal
    });
  };

  closeTip = () => {
    this.setState({
      showLoginTip: false
    })
  }

  closeModal = () => {
    this.setState({
      showModal: false
    })
  }

  render() {
    const { showLoginTip, isSelProtocal, showBoundle, ACTipAlertShow, alertDesc } = this.state;
    return (
      <div className={styles.pinpai}>
        <SmsAlert
          onRef={this.onRef}
          goSubmitCb={{
            PTM0000: (res, getType) => {
              this.goHomePage();
            },
            URM0008: (res, getType) => { },
            others: (res, getType) => {
              this.props.toast.info(res.msgInfo);
            }
          }}
          goLoginCb={{
            PTM0000: (res, getType) => {
              this.goHomePage();
            },
            URM0008: (res, getType) => { },
            others: (res, getType) => {
              this.props.toast.info(res.msgInfo);
            }
          }}
          validateMposCb={{
            PTM9000: (res, getType) => {
              this.props.history.replace('/mpos/mpos_ioscontrol_page');
            },
            others: (res, getType) => {
              this.setState({
                showBoundle: true
              });
            }
          }}
          chkAuthCb={{
            authFlag0: (res, getType) => { },
            authFlag1: (res, getType) => {
              this.goHomePage();
            },
            authFlag2: (res, getType) => {
              // this.props.toast.info('暂无活动资格');
            },
            others: (res, getType) => { }
          }}
          doAuthCb={{
            authSts00: (res, getType) => {
              this.goHomePage();
            },
            others: (res, getType) => { }
          }}
        />
        <div className={styles.hd_logo_wrap}>
          <img src={hd_logo} alt="" className={styles.hd_logo} />
          <span>还到 | 怕预期用还到</span>
        </div>
        <div className={styles.ruleBtn} onClick={() => {
          this.setState({
            showModal: true
          })
        }}>活动规则</div>
        <img src={main_logo} className={styles.main_logo} />
        <div className={styles.scrollWrap}>
          <h3>过关勇士名单</h3>
          <AwardShowMock />
          <img src={coin_bg} alt="" className={styles.coin_bg} />
        </div>

        <img src={countdown_bg} className={styles.countdown_bg} />
        <img src={btn_bg} onClick={this.joinNow} className={styles.entryBtn} alt="按钮" />
        <img src={rule_bg} className={styles.rule_bg} />
        <div className={styles.protocolBox}>
          <i
            className={isSelProtocal ? styles.checked : `${styles.checked} ${styles.nochecked}`}
            onClick={this.checkAgreement}
          />
          <span className={styles.specailColor}>阅读并接受</span>
          <span
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
        </div>
        {
          showLoginTip &&
          <div className={styles.modal}>
            <div className={styles.mask}></div>
            <div className={[styles.modalWrapper, styles.tipWrapper].join(' ')}>
              <div className={styles.tipText}>
                <span>小主～</span><br />
                <span>先去登录才能参与活动哦～</span>
              </div>
              <div className={styles.closeBtn} onClick={this.closeTip}></div>
            </div>
          </div>
        }
        <ACTipAlert
          ACTipAlertShow={ACTipAlertShow}
          resetProps={{
            title: '温馨提示',
            desc: alertDesc,
            closeBtnFunc: this.closeBtnFunc
          }}
        />
        <RuleModal
          visible={this.state.showModal}
          actTime={'2019年6月18日-6月20日'}
          actObject={'所有未获得额度的还到用户'}
          actRules={[
            '活动期间，用户通过活动页面在规定时间内成功完成借款（借款金额≧3000元， 且借款期限≧3个月），可获得100元现金奖励，每位用户仅可参与一次',
          ]}
          handleClose={this.closeModal}
        />
        {
          showBoundle ? <Alert_mpos /> : null
        }
      </div>
    )
  }
}