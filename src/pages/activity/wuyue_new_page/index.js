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
      // contType: 'no_qualified_tips',
      // mayModalShow: true,
      prizeShow: true,
      rulesShow: false,
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

  getNow = () => {

  }

  // 展示活动规则
  showRules = () => {
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
        { mayModalShow && <ModalWrap history={this.props.history} contType={contType} /> }
        { prizeShow && <WinPrize history={this.props.history} title="已成功领取5万元免息券" subTit="（7日内借款即可以使用）" />}
      </div>
    )
  }
}