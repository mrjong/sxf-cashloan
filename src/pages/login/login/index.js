import React, { PureComponent } from 'react';

export default class Login extends PureComponent {
  constructor(props) {
    super(props);
  }

  ccc() {
    this.props.history.push('/home/home')
  }

  render() {
    return (
      <div>
        <div onClick={() => this.ccc()}> 登录了</div>
      </div>
    )
  }
}

