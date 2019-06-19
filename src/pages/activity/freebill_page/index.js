import React, { PureComponent } from 'react'
import qs from 'qs'
import styles from './index.scss'
import title_bg from './img/title_bg.png'
import btn_bg from './img/btn_bg.png'
import { buriedPointEvent } from 'utils/analytins'
import { activity } from 'utils/analytinsType'
import SmsAlert from '../components/SmsAlert'
import Alert_mpos from 'pages/mpos/mpos_no_realname_alert_page';
import RuleModal from '../components/RuleModal'
import { Icon, Carousel } from 'antd-mobile'
import { generateRandomPhone, saveUserInfoEngaged } from '../../../utils'
import fetch from 'sx-fetch';
import main_bg from './img/main_bg.png'
import Cookie from 'js-cookie';

const rewardList = [
  {
    user: '188****4219喜获',
    money: '¥34,00.00'
  },
  {
    user: '138****0169喜获',
    money: '¥34,00.00'
  },
  {
    user: '185****4323喜获',
    money: '¥34,00.00'
  },
  {
    user: '150****1489喜获',
    money: '¥34,00.00'
  },
  {
    user: '136****4165喜获',
    money: '¥34,00.00'
  }
]

let timer = null
@fetch.inject()
export default class funsisong_page extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showLoginTip: false,
      showDelLine: true,
      showRowScroll: true
    }
  }

  componentDidMount() {
    const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData.entry) {
			buriedPointEvent(activity.freebillEntry, {
				entry: queryData.entry
			});
		}
    timer = setInterval(() => {
      this.setState({
        showRowScroll: !this.state.showRowScroll
      }, () => {
        if (this.state.showRowScroll) {
          this.setState({
            rewarded: generateRandomPhone(),
            rowScrollMoney: this.generateRandomMoney()
          })
        }
      })
    }, 8000)
  }

  componentWillUnmount() {
    clearInterval(timer)
  }

  // 进入首页
  goHomePage = () => {
    saveUserInfoEngaged({
      $props: this.props,
      AcCode: 'AC20190618_mianxi'
    }).then(res => {
      if (res.msgCode === 'PTM0000') {
        this.props.history.push('/home/home');
      } else if (res.msgCode === 'PTM1000') {
        this.props.toast.info(res.msgInfo)
        setTimeout(() => {
          this.props.history.push('/login')
        }, 2000)
      } else {
        this.props.toast.info(res.msgInfo)
      }
    })
  }

  joinNow = () => {
    buriedPointEvent(activity.freeBillBtnClick);
		if (Cookie.get('fin-v-card-token')) {
			store.setToken(Cookie.get('fin-v-card-token'));
			this.goHomePage();
		} else {
			this.props.history.replace('/common/wx_middle_page?NoLoginUrl="/login"');
    }
  }

  onRef = (ref) => {
    this.child = ref;
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

  showDelLine = () => {
    this.setState({
      showDelLine: true,
    })
  }

  hideDelLine = () => {
    this.setState({
      showDelLine: false,
      colScrollPhone: generateRandomPhone(),
      colScrollMoney: this.generateRandomMoney()
    })
  }

  generateRandomMoney = () => {
    return (Math.floor((Math.random() * 45000 + 5000) / 100) * 100).toFixed(2)
  }

  render() {
    const { showLoginTip, showBoundle, showRowScroll, rewarded, colScrollPhone, colScrollMoney, rowScrollMoney } = this.state;
    return (
      <div className={styles.freebill}>
        <img src={main_bg} alt="" className={styles.main_bg} />
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
        <div className={styles.ruleBtn} onClick={() => {
          this.setState({
            showModal: true
          })
        }}>活动规则 <Icon type='right' className={styles.rule_arrow} /></div>
        <img src={title_bg} className={styles.title_bg} />
        <div className={styles.red_bag_wrap}>
          <img src={btn_bg} onClick={this.joinNow} className={styles.entryBtn} alt="按钮" />
        </div>

        <div className={styles.col_scroll_wrap}>
          <Carousel
            vertical
            autoplay
            dots={false}
            autoplayInterval={3000}
            infinite
            beforeChange={this.hideDelLine}
            afterChange={this.showDelLine}
          >
            {
              rewardList.map((item, idx) => (
                <div className={styles.inner} key={idx}>
                  <p className={styles.col_scroll_text}>{colScrollPhone ? colScrollPhone : '150****1489'}喜获</p>
                  <div className={styles.square}> <i className={styles.free_bg}></i>
                    <em className={styles.del_money}>{colScrollMoney ? colScrollMoney : '34000,00'}
                      {
                        this.state.showDelLine && <i className={styles.del_line}></i>
                      }
                    </em>
                  </div>
                </div>
              ))
            }
          </Carousel>
        </div>
        {
          showRowScroll && <div className={styles.row_scroll_wrap}>
            <p className={styles.row_scroll_text}>{rewarded ? rewarded : '188****4219'}喜获<span className={styles.number_bg}>{rowScrollMoney ? rowScrollMoney : '20000,00'}</span>元免单！</p>
          </div>
        }

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
        <RuleModal
          visible={this.state.showModal}
          actTime={'2019年6月18日'}
          actObject={'活动期间成功借款的用户即可参与'}
          actRules={[
            '1.活动期间，在每日成功借款的用户中抽取第88位、第188位、第288位、第388位、第488位，依此类推，用户获得免费还账单免利息福利，相关数据以随行付还到后台记录为准；',
            '2.获奖用户将享受在还到的本笔获奖借款账单利息全免福利，奖励将以还款券的形式下发到用户账户中，仅限本笔订单还款时抵扣利息使用，不可转让或赠与；',
            '3.同一用户，活动期间仅能享受1次免费还账单福利，免费还账单数量有限，先到先得；',
            '4.若用户活动期间存在退款行为，将无法获得免费还账单返息奖励。',
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
