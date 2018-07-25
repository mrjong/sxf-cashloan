import React, { PureComponent } from 'react';
import Lists from 'components/lists';
import ButtonCustom from 'components/button';
import styles from './index.scss';

export default class credit_extension_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      
    }
  }

  // 提交代还金申请
  commitApply = () => {
    alert('点击')
  };

  render() {
    const listsArr = [
      {
        extra: {
          name: '已认证',
          color: '#2BDE73',
        },
        label: {
          name: '实名认证',
        },
        clickCb: () => {
          alert(11);
        },
      },
      {
        extra: {
          name: '待认证',
          color: '#F83F4C',
        },
        label: {
          name: '基本信息认证',
        },
        clickCb: () => {
          alert(12);
        },
      },
      {
        extra: {
          name: '已认证',
          color: '#2BDE73',
        },
        label: {
          name: '运营商认证',
        },
        clickCb: () => {
          alert(13);
        },
      },
      {
        extra: {
          name: '已认证',
          color: '#2BDE73',
        },
        label: {
          name: '芝麻分认证',
        },
        clickCb: () => {
          alert(14);
        },
      },
    ];
    return (
      <div className={styles.credit_extension_page}>
        <Lists listsInf={listsArr} />
        <ButtonCustom onClick={this.commitApply} className={styles.commit_btn}>提交代还金申请</ButtonCustom>
      </div>
    )
  }
}

