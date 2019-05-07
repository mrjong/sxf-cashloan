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
	queryQuestionnaire: '/activeConfig/queryQuestionnaire/QA001', // 用户是否参与过免息
	saveQuestionnaire: '/activeConfig/saveQuestionnaire'
};

@withRouter
@setBackGround('#FFC45E')
@fetch.inject()
export default class newUser_page extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showRuleModal: false,
      isShowLogin: false, // 公众号显示登陆弹框
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
      this.getStatus();
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
    .post(API.saveQuestionnaire, {
      actId: 'QA001',
    })
    .then((res) => {
      if (res.msgCode === 'PTM0000') {
        this.props.history.push('/home/home');
      } else if(res.msgCode === 'PTM0100' || res.msgCode === 'PTM1000'){
        this.props.toast.info(res.msgInfo,2,()=>{
          Cookie.remove('fin-v-card-token');
          sessionStorage.clear();
          localStorage.clear();
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

  render() {
    const { isShowLogin } = this.state;
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
          isShowLogin && <LoginAlert smsSuccess={this.goHomePage} />
        }
        <div className={styles.rule} onClick={() => {
          this.setState({
            showRuleModal: true
          })

        }}>活动规则</div>
        <div className={styles.buttonWrapper}>
          <div className={styles.button} onClick={this.goTo}></div>
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
                  <p>3.15日-3.31日</p>
                  <h3>活动对象：</h3>
                  <p>首次申请还信用卡用户</p>
                  <h3>活动规则：</h3>
                  <p>1.用户在活动期间通过活动渠道申请还到授信额度，且所提交材料合法真实有效正规，但借款审批未通过的，则获得一个现金红包最高188元；</p>
                  <p>2.每日最多发放10000个拒就赔现金红包，先到先得，以当天审批时间为准；</p>
                  <p>3.任何恶意刷奖行为，一经查实，所有奖励不予兑现；</p>
                  <p>4.奖励领取方式：</p>
                  <p>（1）满足拒就赔条件的用户，在授信申请被拒后24小时内收到“拒就赔”红包的短信领取通知</p>
                  <p>（2）短信下发，现金红包实时到账，最高188元，现金红包可通过还到-我的钱包，提现到银行卡</p>
                  <p>（3）拒就赔现金红包的有效期为30天，自还到向用户发送领取短信后的30天内，用户未提现到银行卡的，红包失效；</p>
                  <p>5.活动最终解释权归随行付-还到所有。</p>
                </div>
              </div>
            </div> : null
        }
      </div>
    )
  }
}