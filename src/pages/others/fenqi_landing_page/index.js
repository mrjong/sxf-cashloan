import React, { PureComponent } from 'react';
import styles from './index.scss';
// import titleBg from './img/title_bg.jpg';
// import ruleImg from './img/rule.png'


export default class fenqi_landing_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    return (
      <div className={styles.fenqi_landing_page}>
        <div className={styles.title}>关于还到Plus</div>
      </div>
    )
  }
}

