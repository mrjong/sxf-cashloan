import React, { Component, PureComponent } from "react"
import styles from "./Header.scss"

export default class Header extends Component {
  goBack() {
    this.props.history.goBack()
    console.log('22222',this.props.history)
  //  if(){
  //   this.props.history.goBack()
  //   this.props.history.goBack()
  //  }else{
  //   this.props.history.goBack()
  //  }
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
                <div className={styles.arrows} onClick={() => this.goBack()}>
                  <div className={styles.left} />
                </div>
              ) : null}
              <div className={styles.center}>{newTitle || headerProps.title}</div>
            </div>
          )}
      </div>
    )
  }
}
