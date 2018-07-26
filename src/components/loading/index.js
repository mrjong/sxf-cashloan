// var _ = require('lodash')
import React, { PureComponent } from 'react';
import styles from './Loading.scss';

export default class Home extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  render() {
    return (
      <div>
        <div className={styles.report_loading}>
          <div className={styles.report_main}>
            <div className={styles.item_inner}>
              <div className={styles.item_loader_container}>
                <div className={`${styles.la_ball_clip_rotate} ${styles.la_2x}`}>
                  <div />
                </div>
              </div>
            </div>
            <div className={styles.report_values}>数据加载中11</div>
          </div>
        </div>
      </div>
    );
  }
}
