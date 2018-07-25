import React, { PureComponent } from "react"
import styles from "./Header.scss"

export default class Header extends PureComponent {
  goBack() {
    // window.history.back()
    this.props.history.back()
  }

  componentDidMount() {
  }

  render() {
    const { title, headerHide, arrowHide } = this.props
    console.log(this.props, '00')
    const ua = window.navigator.userAgent
    return (
      <div>
        {/MicroMessenger/i.test(ua) || /SuiXingPay-Mpos/i.test(ua) || /SuiXingPay-Cashier/i.test(ua) || headerHide ? (
          ''
        ) : (
            <div className={styles.title}>
              {!arrowHide ? (
                <div className={styles.arrows}>
                  <div className={styles.left} onClick={() => this.goBack()} />
                </div>
              ) : null}
              <div className={styles.center}>{title}</div>
            </div>
          )}
      </div>
    )
  }
}
