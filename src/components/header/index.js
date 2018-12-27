import React, { Component, PureComponent } from "react"
import styles from "./index.scss"
import headerIgnore from 'utils/headerIgnore'
import SetTitle from 'utils/setTitle'
export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hideHederByApp: false,
    };
  }
  componentWillMount() {
    const that = this;
    document.addEventListener('message', that.changeHideStatus);
  }

  componentDidMount() {
    // const that = this;
    // document.addEventListener('message', that.changeHideStatus);
  }

  componentWillUnmount() {
    const that = this;
    document.removeEventListener('message', that.changeHideStatus);
  }

  changeHideStatus = e => {
    const that = this;
    const passData = JSON.parse(e.data);
    that.setState({
      hideHederByApp: !!passData.hideHeader,
    });
  };

  goBack() {
    this.props.history.goBack()
  }
  render() {
    const { headerProps, newTitle } = this.props
    const { hideHederByApp } = this.state;
    SetTitle(newTitle || headerProps.title || '')
    return headerIgnore('false') && !headerProps.headerHide && !hideHederByApp ? (
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
