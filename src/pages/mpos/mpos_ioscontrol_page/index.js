import React, { PureComponent } from 'react';
import styles from './index.scss';
import ioscontrol from './img/ioscontrol.png';
import ioscontrol_activity from './img/ioscontrol_activity.png';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store'

@setBackGround('#cf2a2a')
export default class ioscontrol_page extends PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			activity: ''
		}
	}
	componentDidMount() {
		const activity = store.getNewUserActivityFlag()
		store.removeNewUserActivityFlag()
		this.setState({
			activity
		})
	}
	render() {

		return <img className={styles.img} src={this.state.activity ? ioscontrol_activity : ioscontrol} />
	}
}
