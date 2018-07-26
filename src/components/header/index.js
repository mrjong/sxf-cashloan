import React, { Component, PureComponent } from "react"
import styles from "./Header.scss"

export default class Header extends Component {
  goBack() {
    // window.history.back()
    this.props.history.goBack()

  }

  componentDidMount() {
  }

  render() {
    const { title, headerHide, arrowHide, headerProps} = this.props
    const ua = window.navigator.userAgent
    return (
      <div>
        {/MicroMessenger/i.test(ua) || /SuiXingPay-Mpos/i.test(ua) || /SuiXingPay-Cashier/i.test(ua) || headerProps.headerHide ? (
          ''
        ) : (
            <div className={styles.title}>
              {!headerProps.arrowHide ? (
                <div className={styles.arrows}>
                  <div className={styles.left} onClick={() => this.goBack()} />
                </div>
              ) : null}
              <div className={styles.center}>{headerProps.title}</div>
            </div>
          )}
      </div>
    )
  }
}
