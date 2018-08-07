import React, { Component, PureComponent } from "react"
import styles from "./header.scss"
import headerIgnore from 'utils/headerIgnore'
export default class Header extends Component {
  goBack() {
    this.props.history.goBack()
  }
  render() {
    const { headerProps, newTitle } = this.props
    document.title = newTitle || headerProps.title || ''
    return (
      <div>
        {/* 各个渠道是否隐藏头部 */}
        {headerIgnore('false') && !headerProps.headerHide ? (
          <div className={styles.title}>
            {!headerProps.arrowHide ? (
              <div className={styles.arrows} onClick={() => this.goBack()}>
                <div className={styles.left} />
              </div>
            ) : null}
            <div className={styles.center}>{newTitle || headerProps.title || ''}</div>
          </div>
        ) : null}
      </div>
    )
  }
}
