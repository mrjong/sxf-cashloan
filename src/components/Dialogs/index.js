import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './index.scss'

class Dialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showCover: false,
      showDialog: false,
    }
    this.requestClose = (type) => {
      this.props.onRequestClose(type)
      if (this.props.autoClose) clearTimeout(this.autoClose)
    }
  }
  autoClose
  static propTypes = {
    onRequestClose: PropTypes.func,
    open: PropTypes.bool,
    showCover: PropTypes.bool,
    showCloseBtn: PropTypes.bool,
    autoClose: PropTypes.bool,
    timeout: PropTypes.number
  }
  static defaultProps = {
    onRequestClose: () => { },
    open: false,
    showCover: false,
    showCloseBtn: false,
    autoClose: false,
    timeout: 3
  }
  componentWillMount() {
    if (this.props.open) {
      this.setState({ showDialog: true }, () => {
      })
      if (this.props.showCover) {
        this.setState({ showCover: true })
      }
    } else {
      this.setState({ showDialog: false })
      if (this.state.showCover) {
        this.setState({ showCover: false })
      }
    }
  }
  componentWillReceiveProps(props) {
    if (props.open) {
      this.setState({ showDialog: true }, () => {
      })
      if (props.showCover) {
        this.setState({ showCover: true })
      }
    } else {
      this.setState({ showDialog: false })
      if (this.state.showCover) {
        this.setState({ showCover: false })
      }
    }
  }
  render() {
    return (
      <div className={style.dialog_container}>
        <div className={style.weui_dialog}>
          <div className={style.content_box}>
            <div>只差一点，<span className={style.money}>50000</span>元就到手啦！</div>
            <div className={style.btn_container}>
              <div onClick={() => { this.requestClose(false) }} className={`${style.btn_one} ${style.btn_one_new}`}>
                残忍拒绝
                    </div>
              <div onClick={() => { this.requestClose(true) }} className={`${style.btn_two} ${style.btn_two_new}`}>
                继续认证
                    </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

}

export default Dialog
