import React, { PureComponent } from 'react';
import fetch from "sx-fetch"
const API = {
  logindemo: '/login'
}
@fetch.inject()
export default class Login extends PureComponent {
  constructor(props) {
    super(props);
  }

  login() {
    this.props.$fetch.post(API.logindemo, null, { loading: false }).then(res => {
      console.log(res)
    })
  }

  render() {
    return (
      <div>
        <div onClick={() => this.login()}> 点击登录</div>
      </div>
    )
  }
}

