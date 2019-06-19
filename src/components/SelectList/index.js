import React from 'react';
import style from './index.scss';
import { Icon } from 'antd-mobile';

export default class selectlist extends React.Component {
	render() {
		const { selectText, defaultText } = this.props;
		return (
			<div className={style.selectBox}>
				<div className={style.noselect}>
					{selectText ? (
						<span className={style.selectText}>{selectText}</span>
					) : (
						(defaultText && <span>{defaultText}</span>) || '请选择'
					)}
					<Icon type="right" color="#C5C5C5" className={style.rightArrow} />
				</div>
			</div>
		);
	}
}
