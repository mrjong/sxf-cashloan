import React, { PureComponent } from 'react';
import Panel from 'components/panel/index.js';

import style from './style.scss';

export default class PanelPage extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={style.panel_page}>
        <Panel title="借款信息">内容。。。。。</Panel>
        <Panel title="借款信息">内容。。。。。</Panel>
        <Panel title="借款信息">内容。。。。。</Panel>
      </div>
    );
  }
}
