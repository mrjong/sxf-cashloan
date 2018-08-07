import React, { PureComponent } from 'react';
import styles from '../index.scss';
import headerIgnore from 'utils/headerIgnore'

export default class club_vip_service_page extends PureComponent {
  render() {
    return (
      <iframe
        title="随行付VIP俱乐部会员服务协议"
        className={headerIgnore() ? styles.container2 : styles.container}
        src="/disting/#/club_vip_service_page"
        name="club_vip_service_page"
        id="club_vip_service_page"
        width="100%"
        height="100%"
        frameBorder="0"
      />
    );
  }
}
