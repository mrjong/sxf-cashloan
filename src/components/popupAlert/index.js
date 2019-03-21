import React, { Component } from 'react';
import style from './index.scss';
export default class popupAlert extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div>
				<div className={style.mask}/>
				<div className={style.wrap}>
                <div className={[style.popup,style.popup_slide_up].join(' ')}>
                    <div className={style.header}>221221</div>
                    </div>
                </div>
			</div>
		);
	}
}
