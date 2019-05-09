import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import { Icon } from 'antd-mobile'
import qs from 'qs'
import { setBackGround } from 'utils/background'
import styles from './index.scss'
import { buriedPointEvent } from 'utils/analytins'
import { activity } from 'utils/analytinsType';
import AwardShowMock from './components/AwardShowMock'
import { isMPOS } from 'utils/common';
import fetch from 'sx-fetch';
import SmsAlert from '../components/SmsAlert';
import Cookie from 'js-cookie';
import LoginAlert from './components/LoginAlert';
import { store } from 'utils/store';

const API = {
  joinActivity: '/jjp/join', // 参加活动 里面会判断用户有没有资格
};

@withRouter
@setBackGround('#FFC45E')
@fetch.inject()
export default class juPei_page extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showRuleModal: false,
      isShowLogin: false, // 公众号显示登陆弹框
      showLoginTip: false, // mpos开屏进入时是否登陆弹框
    }
  }

  componentDidMount() {
    const queryData = qs.parse(location.search, { ignoreQueryPrefix: true })
    if (queryData.entry) {
      buriedPointEvent(activity.jjpEntry, {
        entry: queryData.entry
      })
    }
  }

  closeRuleModal = () => {
    this.setState({
      showRuleModal: false
    })
  }

  goTo = () => {
    const queryData = qs.parse(location.search, { ignoreQueryPrefix: true })
    if (queryData.entry) {
      buriedPointEvent(activity.jjpGetBtn, {
        entry: queryData.entry
      })
    }
    if (isMPOS() && !Cookie.get('fin-v-card-token')) {
      if (queryData.appId && queryData.token) {
				this.getStatus();
			} else {
				this.setState({
					showLoginTip: true
				});
			}
    } else if (Cookie.get('fin-v-card-token')) {
			store.setToken(Cookie.get('fin-v-card-token'));
			this.goHomePage();
		} else {
      this.setState({
        isShowLogin: true
      })
    }
  }

  getStatus = () => {
		this.child.validateMposRelSts({
			smsProps_disabled: true,
			loginProps_disabled: true,
			loginProps_needLogin: true,
			otherProps_type: 'home'
		});
  };

  goHomePage = () => {
    this.props.$fetch
    .get(API.joinActivity)
    .then((res) => {
      if (res && res.msgCode === 'PTM0000') {
        this.props.toast.info('参与成功', 2 ,() => {
          this.props.history.push('/home/home');
        });
        
      } else if (res && res.msgCode === 'JJP0001') { // 用户参加过拒就赔活动
        this.props.toast.info('参与成功', 2 ,() => {
          this.props.history.push('/home/home');
        });
      }  else if (res && res.msgCode === 'JJP0004') { // 用户没有资格参加拒就赔活动
        // 暂无参与资格
        this.props.toast.info('暂无参与资格', 2 ,() => {
          this.props.history.push('/home/home');
        });
      } else if(res && (res.msgCode === 'PTM0100' || res.msgCode === 'PTM1000')) {
        this.props.toast.info(res.msgInfo, 2 ,()=>{
          Cookie.remove('fin-v-card-token');
          sessionStorage.clear();
          localStorage.clear();
          this.goTo();
        });
      }
    });
  }
  
  onRef = (ref) => {
		this.child = ref;
  };
  
  // mpos中输入手机号弹框，点击确定按钮
  confirmHandler = () => {
    const queryData = qs.parse(location.search, { ignoreQueryPrefix: true })
		if (queryData.entry) {
			buriedPointEvent(activity.jjpMposConfirmBtn, {
				entry: queryData.entry
			})
		}
  }

  closeTip = () => {
		this.setState({
			showLoginTip: false
		});
  };

  closeLoginModal = () => {
		this.setState({
			isShowLogin: false
		});
  };
  
  // 跳转协议
	go = (url) => {
		this.props.history.push(`/protocol/${url}`);
  };

  render() {
    const { isShowLogin, showLoginTip  } = this.state;
    return (
      <div className={styles.main}>
        <SmsAlert
          onRef={this.onRef}
          isShowMobModal={true}
					goSubmitCb={{
						PTM0000: (res, getType) => {
							this.goHomePage();
						},
						URM0008: (res, getType) => {},
						others: (res, getType) => {}
					}}
					goLoginCb={{
						PTM0000: (res, getType) => {
							this.goHomePage();
						},
						URM0008: (res, getType) => {},
						others: (res, getType) => {}
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
						authFlag0: (res, getType) => {},
						authFlag1: (res, getType) => {
							this.goHomePage();
						},
						authFlag2: (res, getType) => {
							// this.props.toast.info('暂无活动资格');
						},
						others: (res, getType) => {}
					}}
					doAuthCb={{
						authSts00: (res, getType) => {
							this.goHomePage();
						},
						others: (res, getType) => {}
          }}
          modalBtnBuryPoint={this.confirmHandler}
				/>
        {
          isShowLogin && <LoginAlert smsSuccess={this.goHomePage} closeModal={this.closeLoginModal} />
        }
        <div className={styles.rule} onClick={() => {
          this.setState({
            showRuleModal: true
          })

        }}>活动规则</div>
        <div className={styles.buttonWrapper}>
          <div className={styles.button} onClick={this.goTo}></div>
          <p className={styles.protocolBox}>
            注册即视为同意
            <span 
              onClick={() => {
                this.go('register_agreement_page');
              }}>
              《用户注册协议》
            </span>
            <span onClick={() => {
              this.go('privacy_agreement_page');
            }}>
              《用户隐私政策》
            </span>
          </p>
        </div>
        <div className={styles.scrollWrapper}>
          <AwardShowMock ></AwardShowMock>
        </div>
        {
          this.state.showRuleModal ?
            <div className={styles.modal}>
              <div className={styles.mask}></div>
              <div className={styles.modalWrapper}>
                <Icon type='cross' color='#333' className={styles.closeBtn} onClick={this.closeRuleModal} />
                <h2>活动规则</h2>
                <div className={styles.rulesCont}>
                  <h3>活动时间：</h3>
                  <p>2019年5月15日-2019年5月19</p>
                  <h3>活动对象：</h3>
                  <p>未提交授信且无逾期行为用户</p>
                  <h3>活动规则：</h3>
                  <p>1.用户在活动期间通过活动渠道申请还到授信额度，且所提交材料合法真实有效正规，但审批未通过的，则获得一个随机现金红包，现金金额最高188元；</p>
                  <p>2.获得188元条件：每日第5000名被拒用户可得；</p>
                  <p>3.每日拒就赔现金红包数量有限，先到先得，以当天审批时间为准；</p>
                  <p>4.满足拒就赔条件的用户，在授信申请被拒后24小时内会收到拒就赔红包的短信通知，请注意查收；</p>
                  <p>5.现金红包的有效期为30天，自还到向用户发放现金后的30天内，用户未提现到银行卡的，红包失效；</p>
                  <p>6.任何恶意刷奖行为，一经查实，所有奖励不予兑现。</p>
                  <p style={{textAlign: 'center'}}>*活动最终解释权归随行付-还到所有*</p>
                </div>
              </div>
            </div> : null
        }
        {showLoginTip && (
					<div className={styles.modal}>
						<div className={styles.mask} />
						<div className={[ styles.modalWrapper, styles.tipWrapper ].join(' ')}>
							<div className={styles.tipText}>
								<span>小主～</span>
								<br />
								<span>活动火热进行中，快前往「还到」参与！</span>
							</div>
							<div className={styles.closeBtnStyle} onClick={this.closeTip} />
						</div>
					</div>
				)}
      </div>
    )
  }
}