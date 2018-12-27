import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './index.scss'
// import config from '../config'
// if (config.useDefaultStyles) {
//   require('./styles')
// }

class Dialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showCover: false,
      showDialog: false,
      alertheight: 180,
    }
    this.requestClose = (type) => {
      this.props.onRequestClose(type)

      if (this.props.autoClose) clearTimeout(this.autoClose)
    }
  }
  autoClose
  static propTypes = {
    title: PropTypes.any,
    titleClassName: PropTypes.string,
    content: PropTypes.any,
    contentClassName: PropTypes.string,
    actions: PropTypes.any,
    actionClassName: PropTypes.string,
    onRequestClose: PropTypes.func,
    open: PropTypes.bool,
    showCover: PropTypes.bool,
    showCloseBtn: PropTypes.bool,
    autoClose: PropTypes.bool,
    timeout: PropTypes.number
  }
  static defaultProps = {
    title: <div />,
    titleClassName: '',
    content: null,
    contentClassName: '',
    actions: null,
    actionClassName: '',
    onRequestClose: () => { },
    open: false,
    showCover: false,
    showCloseBtn: false,
    autoClose: false,
    timeout: 3
  }
  componentWillReceiveProps(props) {
    if (props.open) {
      this.setState({ showDialog: true }, () => {
        // console.log(this.alerthight.offsetHeight)
        // this.setState({ alertheight: -(this.alerthight.offsetHeight / 2) })
      })
      if (props.showCover) {
        this.setState({ showCover: true })
      }
      if (props.autoClose) {
        this.autoClose = setTimeout(() => {
          this.setState({ showDialog: false })
          if (this.state.showCover) {
            this.setState({ showCover: false })
          }
          this.requestClose()
        }, `${this.props.timeout * 1000}`)
      }
    } else {
      this.setState({ showDialog: false })
      if (this.state.showCover) {
        this.setState({ showCover: false })
      }
    }
  }
  componentWillMount() {
    if (this.props.open) {
      this.setState({ showDialog: true }, () => {
        // console.log(this.alerthight.offsetHeight)
        // this.setState({ alertheight: -(this.alerthight.offsetHeight / 2) })
      })
      if (this.props.showCover) {
        this.setState({ showCover: true })
      }
      if (this.props.autoClose) {
        this.autoClose = setTimeout(() => {
          this.setState({ showDialog: false })
          if (this.state.showCover) {
            this.setState({ showCover: false })
          }
          this.requestClose()
        }, `${this.props.timeout * 1000}`)
      }
    } else {
      this.setState({ showDialog: false })
      if (this.state.showCover) {
        this.setState({ showCover: false })
      }
    }
  }
  // componentWillUnmount() {
  //   this.autoClose ? clearTimeout(this.autoClose) : null
  // }
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
