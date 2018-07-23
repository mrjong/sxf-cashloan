import React from 'react';
import parentComponent from 'pages/common/parentComponent';

export default class Login extends parentComponent {
  constructor(props) {
    super(props);

  }

  ccc() {
    this.props.history.push('/login/home')
  }

  render() {
    return (
      <div>
        <div onClick={() => this.ccc()}> 登录了</div>
      </div>
    )
  }
}

