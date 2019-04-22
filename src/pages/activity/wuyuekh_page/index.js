import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import qs from 'qs'
import { store } from 'utils/store'
import styles from './index.scss'
import activity_bg from './img/activity_bg.png'
import { buriedPointEvent } from 'utils/analytins'
import { activity } from 'utils/analytinsType';


@withRouter
export default class wuyuekh_page extends PureComponent {
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
        
      </div>
    )
  }
}