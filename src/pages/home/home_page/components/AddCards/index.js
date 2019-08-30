import React from 'react';
import style from './index.scss';
import ZButton from 'components/ButtonCustom';

export default class AddCards extends React.Component {
	constructor(props) {
		super(props);
	}
	componentWillMount() {}
	render() {
		const { handleClick } = this.props;
		return (
			<div className={style.box_container}>
				<ZButton onClick={handleClick} className={style.addBtn}>
					<i />
					添加需要还款的信用卡
				</ZButton>
			</div>
		);
	}
}
