import React, { PureComponent } from 'react';
import ButtonCustom from 'components/ButtonCustom';
import styles from './index.scss';

export default class err_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }
  // 重新加载
  reloadHandler = () => {
    window.location.reload();
  };
  render() {
    return (
      <div className={styles.err_page}>
        <i className={styles.err_img}></i>
        <p className={styles.err_cont}>对不起，您找的页面走丢了～</p>
        <ButtonCustom onClick={this.reloadHandler} className={styles.reload_btn}>重新加载</ButtonCustom>
      </div>
    );
  }
}