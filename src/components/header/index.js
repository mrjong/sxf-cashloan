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
    return headerIgnore('false') && !headerProps.headerHide ? (
      <div className={[styles.navbar, 'application_navbar'].join(' ')}>
        {!headerProps.arrowHide ? (
          <div className={styles.arrows} onClick={() => this.goBack()}>
            <div className={styles.left} />
          </div>
        ) : null}
        <div className={styles.center}>{newTitle || headerProps.title || ''}</div>
      </div>
    ) : null;
  }
}
