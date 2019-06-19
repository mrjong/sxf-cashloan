import React from 'react';
import style from './index.scss';
import { Icon } from 'antd-mobile';

export default class SelectList extends React.Component {
	render() {
		return (
			<div className={style.selectBox}>
				<div className={style.noselect}>
					请选择
				</div>

			</div>
		);
	}
}
