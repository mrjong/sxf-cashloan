import React, { PureComponent } from 'react';
import qs from 'qs';
import { store } from 'utils/store';
import styles from './index.scss';
import activity_bg from './img/activity_bg.png';
import btn_img from './img/btn_img.png';
import main_bg from './img/main_bg.png';
import reason_img from './img/reason_img.png';
import rule_bg from './img/rule_bg.png';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
import { setBackGround } from 'utils/background';
import RuleShow from './components/RuleShow';
import ModalWrap from './components/ModalWrap';
import WinPrize from './components/WinPrize';
import { rules } from './rulesData'

@setBackGround('#9235D4')
export default class wuyue_new_page extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      contType: '',
      mayModalShow: false,
      prizeShow: false,
      rulesShow: false,
    }
  }

  componentDidMount() {
  }

  // 一键领取按钮点击
  getNow = () => {
    buriedPointEvent(activity.mayNewRecBtn);
    if (true) {
      this.setState({
        contType: 'login_alert',
        mayModalShow: true,
      })
    } else {
      this.setState({
        contType: 'new_sorry_tips',
        mayModalShow: true,
      })
    }
  }

  // 展示活动规则
  showRules = () => {
    buriedPointEvent(activity.mayNewRulesBtn);
    this.setState({
      rulesShow: true
    })
  }

  // 关闭活动规则
  closeRules = () => {
    this.setState({
      rulesShow: false
    })
  }

  // 获奖后立即使用按钮点击
  useHandler = () => {
    buriedPointEvent(activity.mayNewUseNowBtn);
    this.props.history.push('/home/home');
  }

  // 关闭中奖弹框
  closePrizeModal = () => {
    this.setState({
      prizeShow: false,
    })
  }

  // 新用户登陆领取奖励
  loginCallback = () => {
    this.setState({
      mayModalShow: false,
      prizeShow: true,
    })
  }

  render() {
    const { contType, mayModalShow, rulesShow, prizeShow } = this.state;
    return (
      <div className={styles.wuyue_new_page}>
        <img src={activity_bg} className={styles.activity_bg} />
        <img src={rule_bg} className={styles.rule_bg} onClick={this.showRules} />
        <div className={styles.main_cont}>
          <img src={main_bg} className={styles.main_bg} />
          <img src={btn_img} onClick={this.getNow} className={styles.btn_style} />
        </div>
        <img src={reason_img} className={styles.reason_block} />
        { rulesShow && <RuleShow ruleTit="新用户活动规则" ruleDesc={rules} onCloseCb={this.closeRules} /> }
        { mayModalShow && <ModalWrap history={this.props.history} loginCb={this.loginCallback} contType={contType} /> }
        { prizeShow && <WinPrize history={this.props.history} title="已成功领取5万元免息券" clickCb={this.useHandler} closeCb={this.closePrizeModal} subTit="（7日内借款即可以使用）" />}
      </div>
    )
  }
}