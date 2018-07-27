import React, { Component, PureComponent } from "react"
import styles from "./Header.scss"

export default class Header extends Component {
  goBack() {
    // window.history.back()
    this.props.history.goBack()

  }
  render() {
    const { headerProps, newTitle } = this.props
    const ua = window.navigator.userAgent
    return (
      <div>
        {/* 各个渠道是否隐藏头部 */}
        {/MicroMessenger/i.test(ua) || /SuiXingPay-Mpos/i.test(ua) || /SuiXingPay-Cashier/i.test(ua) || headerProps.headerHide ? (
          ''
        ) : (
            <div className={styles.title}>
              {!headerProps.arrowHide ? (
                <div className={styles.arrows}>
                  <div className={styles.left} onClick={() => this.goBack()} />
                </div>
              ) : null}
              <div className={styles.center}>{newTitle || headerProps.title}</div>
            </div>
          )}
      </div>
    )
  }
}
