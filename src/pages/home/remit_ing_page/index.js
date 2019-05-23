import React, { PureComponent } from 'react';
import style from './index.scss';
import { setBackGround } from 'utils/background';
import ExamineComponents from './components/ExamineComponents';
@setBackGround('#fff')
export default class remit_ing_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			copyText: ''
		};
	}
	render() {
		return (
			<div className={style.remit_ing_page}>
				<ExamineComponents />
			</div>
		);
	}
}
