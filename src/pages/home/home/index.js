import React, { PureComponent } from 'react';

export default class Home extends PureComponent {
  constructor(props) {
    super(props);
  }

  cc() {
    this.props.history.push('/login/login')
  }

  render() {
    return (
      <div>
        <div onClick={() => this.cc()}> 首页</div>
      </div>
    )
  }
}

