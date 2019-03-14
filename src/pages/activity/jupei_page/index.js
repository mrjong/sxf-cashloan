import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import { Modal, Icon } from 'antd-mobile'
import qs from 'qs'
import { setBackGround } from 'utils/backGround'
import styles from './index.scss'
import { buriedPointEvent } from 'utils/analytins'
import { activity } from 'utils/analytinsType';
import AwardShowMock from './components/AwardShowMock'

@withRouter
@setBackGround('#FFC45E')
export default class newUser_page extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showRuleModal: false
    }
  }

  componentDidMount() {
    const queryData = qs.parse(location.search, { ignoreQueryPrefix: true })
    if (queryData.h5Channel) {
      buriedPointEvent(activity.jupeiEntry, {
        h5Channel: queryData.h5Channel
      })
    }
  }

  closeRuleModal = () => {
    this.setState({
      showRuleModal: false
    })
  }

  goTo = () => {
    Modal.alert('', '您需要完成认证才能参加活动哦', [
      {
        text: '取消',
      },
      {
        text: '去认证',
        onPress: () => {
          this.props.history.push('/home/home')
        }
      }
    ]);
  }

  render() {
    return (
      <div className={styles.main}>
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
                <h3>活动时间：</h3>
                <p>3.15日-3.31日</p>
                <h3>活动对象：</h3>
                <p>首次申请还信用卡用户</p>
                <h3>活动规则：</h3>
                <p>1.用户在活动期间首次申请还信用卡，且所提交材料合法真实有效正规，但借款审批未通过的，则获得一个现金红包最高188元，每日限定人数随机抽取；</p>
                <p>2.赔付金每日数量有限，先到先得，以当天审批时间为准；</p>
                <p>3.任何恶意刷奖行为，一经查实，所有奖励不予兑现；</p>
                <p>4.奖励领取方式：首次申请还信用卡被拒的用户，请在[还到]公众号后台回复【手机号】就有机会领取最高188元现金红包；</p>
                <p>5.本活动最终解释权归还到所有。</p>
              </div>
            </div> : null
        }
      </div>
    )
  }
}