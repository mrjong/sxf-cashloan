import React from 'react';
import parentComponent from 'pages/common/parentComponent';

export default class Home extends parentComponent {
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

