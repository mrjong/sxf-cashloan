import React from 'react';
import parentComponent from 'pages/common/parentComponent';
import ZButton from 'components/button/index.js';
import Panel from 'components/panel/index.js';
import Footer from 'components/footer';

import { setBackGround } from 'utils/Background.js'
import style from './style.scss';

@setBackGround('#f5f5f5')
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
          <ZButton onClick={this.handleButtonClick} >确定</ZButton>
          <Panel title="借款信息">内容。。。。。</Panel>
          <Panel title="借款信息">内容。。。。。</Panel>
          <Panel title="借款信息">内容。。。。。</Panel>
          <Footer {...this.props}> </Footer>
      </div>
    )
  }
}
