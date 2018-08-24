import React, { PureComponent } from 'react';
import headerIgnore from 'utils/headerIgnore';
import { buriedPointEvent } from 'utils/Analytins';
import { mine } from 'utils/AnalytinsType';
import styles from './index.scss';

export default class fqa_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  componentDidMount() {
    buriedPointEvent(mine.faq);
  }

  render() {
    return (
      <div className={styles.fqa_page} >
        <iframe
          className={headerIgnore() ? styles.container2 : styles.container}
          src="/disting/#/fqa_page"
          name="fqa_page"
          id="fqa_page"
          width="100%"
          height="100%"
          frameBorder="0"
        />
      </div>

    )
  }
}

