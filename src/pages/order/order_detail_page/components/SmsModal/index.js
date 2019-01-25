import React from 'react'
import styles from './index.scss'
import { store } from 'utils/store';

let timer = null
export default class SmsModal extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      isAgain: false, // 是否重新获取验证码
      times: 5,
    }
  }

  componentWillMount() {
    this.startCountDown()
  }

  componentWillUnmount() {
    this.clearCountDown()
  }

  smsCodeAgain = () => {
    if (this.state.times > 0) return
    this.setState({
      times: 5
    }, () => {
      //重新获取
      this.startCountDown()
      this.props.smsCodeAgain()
    })
  }

  handleChange = (e) => {
    this.props.onSmsCodeChange(e.target.value)
  }

  //倒计时
  startCountDown = () => {
    let times = this.state.times
    timer = setInterval(() => {
      this.setState({
        times: times--
      })
      if (times < 0) {
        this.clearCountDown()
        this.setState({
          isAgain: true
        })
      }
    }, 1000)
  }

  clearCountDown = () => {
    clearInterval(timer)
  }

  render() {
    const { times, isAgain } = this.state
    const { onCancel, onConfirm, smsCode } = this.props
    return (
      <div className={styles.smsModal}>
        <div className={styles.main}>
          <div className={styles.head}>验证码</div>
          <div className={styles.body}>
            <div className={styles.desc}>请输入短信验证码，短信已发送到您的手机：{store.getUserPhone()}</div>
            <div className={styles.smsCode}>
              <input type="number" placeholder='请输入短信验证码' value={smsCode} onChange={this.handleChange}/>
              {
                times ? <span>{times + 's'}</span> : <button onClick={this.smsCodeAgain}>重新获取验证码</button>
              }
            </div>
            <p className={styles.tip}>温馨提示：为资金安全考虑需进行短信校验，验证完成即视为同意《用户授权扣款委托书》约定扣款</p>
            <div className={styles.bottom}>
              {
                isAgain ? (
                  [<button onClick={onCancel} key='1' className={styles.skipButton}>跳过,直接还款</button>,
                  <button onClick={onConfirm} key='2' className={styles.smallButton}>确定</button>]
                ) : <button onClick={onConfirm} className={styles.largeButton}>确定</button>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}
