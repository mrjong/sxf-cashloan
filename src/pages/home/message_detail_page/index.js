import React, { PureComponent } from "react"
import style from "./index.scss"

export default class Desc extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      msgObj: {}
    }
  }
  componentWillMount() {
    let msgObj = JSON.parse(sessionStorage.getItem("msgObj"))
    this.setState({
      msgObj
    })
  }
  componentWillUnmount() {
    sessionStorage.removeItem("msgObj")
  }

  render() {
    return (
      <div className={style.descContainer}>
        <div className={style.title}>
          {this.state.msgObj && this.state.msgObj.title}
        </div>
        <div className={style.time}>
          {this.state.msgObj && this.state.msgObj.sendTm}
        </div>
        <p className={style.p}>
          {(this.state.msgObj && this.state.msgObj.detail) ||
            (this.state.msgObj && this.state.msgObj.dec)}
        </p>
      </div>
    )
  }
}
