import React, { PureComponent } from 'react';
import style from './style.scss';

export default class ExamplePage extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={style.example_page}>
        这里放组件预览
        <div style={{height: '1000px',border: '1px solid red'}}> feefe </div>
      </div>
    )
  }
}
