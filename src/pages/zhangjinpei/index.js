import React from 'react';
import parentComponent from 'pages/common/parentComponent';
import ZButton from 'components/button/index.js';

import style from './style.scss';

export default class Login extends parentComponent {
  constructor(props) {
    super(props);

  }

  handleButtonClick = () => {
    console.log('点击按钮');
  };

  render() {
    return (
      <div>
        <ZButton onClick={this.handleButtonClick} ></ZButton>
      </div>
    )
  }
}
