import React, { PureComponent } from 'react';
import ZButton from 'components/button/index.js';
import Panel from 'components/panel/index.js';

import style from './style.scss';

export default class ButtonPage extends PureComponent {
  constructor(props) {
    super(props);
  }

  handleButtonClick = () => {
    console.log('点击按钮');
  };

  render() {
    return (
      <div className={style.button_page}>
        <ZButton onClick={this.handleButtonClick} >确定</ZButton>
      </div>
    )
  }
}
