import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Icon } from 'antd-mobile'
import style from './index.scss'


class Dialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showCover: false,
      showDialog: false,
      menuList: [],
      stepText: ''
    }
    this.requestClose = (type, questionName) => {
      this.props.onRequestClose(type, questionName)
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
    this.toggleMenuList()
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
  toggleMenuList = () => {
    const pathname = window.location.pathname
    switch (pathname) {
      case '/home/loan_repay_confirm_page':
        this.setState({
          menuList: [
            {
              name: '可借金额太低',
              type: '11'
            },
            {
              name: '不知道如何提交申请',
              type: '12'
            },
            {
              name: '不知道如何更新信用卡',
              type: '13'
            },
            {
              name: '其他',
              type: '01'
            },
            {
              name: '再等等',
              type: '00'
            }
          ],
          stepText: '提交'
        })
        break;
      case '/home/essential_information':
        this.setState({
          menuList: [
            {
              name: '操作不便，不想继续',
              type: '21'
            },
            {
              name: '不想填写个人信息，担心信息泄露',
              type: '22'
            },
            {
              name: '额度太低',
              type: '23'
            },
            {
              name: '暂时没有借款需求',
              type: '01'
            },
            {
              name: '再等等',
              type: '00'
            }
          ],
          stepText: '2步操作'
        })
        break;
      case '/home/moxie_bank_list_page':
        this.setState({
          menuList: [
            {
              name: '不知道网银密码',
              type: '31'
            },
            {
              name: '银行卡信息太敏感',
              type: '32'
            },
            {
              name: '没有支持银行',
              type: '33'
            },
            {
              name: '其他',
              type: '34'
            },
            {
              name: '再等等',
              type: '00'
            }
          ],
          stepText: '只剩1步操作'
        })
        break;
      default:
        this.setState({
          menuList: []
        })
        break;
    }
  }
  render() {
    return (
      <div className={style.dialog_container}>
        {
          this.state.menuList.length > 0 ? <div className={style.weui_dialog}>
            <Icon type='cross' className={style.arrow_icon} color='#86919D' onClick={() => { this.requestClose(true, '关闭') }} />
            <h3 className={style.header_title}>{this.state.stepText}即可获取最高50000元！真的要放弃吗？</h3>
            <ul>
              {
                this.state.menuList.map((item, idx) => (
                  <li className={style.button_item} key={item.type} onClick={() => { this.requestClose(item.name === '再等等' ? true : false, item.name) }}>{item.name}</li>
                ))
              }
            </ul>
          </div> : <div className={style.weui_dialog_default}>
              <div className={style.content_box}>
                <div>即将获得50000元，确定放弃吗？</div>
              </div>
              <div className={style.btn_container}>
                <div onClick={() => { this.requestClose(false, '放弃') }} className={`${style.btn_one} ${style.btn_one_new}`}>放弃 </div>
                <div onClick={() => { this.requestClose(true, '再等等') }} className={`${style.btn_two} ${style.btn_two_new}`}>再等等</div>
              </div>
            </div>
        }
      </div>
    )
  }

}

export default Dialog
