import React, { PureComponent } from 'react';
import styles from './index.scss';
import ioscontrol from './img/ioscontrol.png';
import { setBackGround } from 'utils/background';

@setBackGround('#cf2a2a')
export default class ioscontrol_page extends PureComponent {
	render() {
		return <img className={styles.img} src={ioscontrol} />;
	}
}
