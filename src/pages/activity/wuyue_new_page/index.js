import React, { PureComponent } from 'react';
import qs from 'qs';
import { store } from 'utils/store';
import styles from './index.scss';
import activity_bg from './img/activity_bg.png';
import btn_img from './img/btn_img.png';
import main_bg from './img/main_bg.png';
import reason_img from './img/reason_img.png';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';


export default class wuyue_new_page extends PureComponent {
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

  goNew = () => {
    this.props.history.push('/activity/wuyuekh_page');
  }

  goOld = () => {
    this.props.history.push('/activity/wuyuekh_page');
  }

  render() {
    return (
      <div className={styles.wuyue_new_page}>
        <img src={activity_bg} className={styles.activity_bg} />
        <div className={styles.main_cont}>
          <img src={main_bg} className={styles.main_bg} />
          <img src={btn_img} onClick={this.goNew} className={styles.btn_style} />
        </div>
        <img src={reason_img} className={styles.reason_block} />
      </div>
    )
  }
}