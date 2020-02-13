import React from 'react';
import style from './index.scss';
import ZButton from 'components/ButtonCustom';
import Image from 'assets/image';

export default class AddCards extends React.Component {
	constructor(props) {
		super(props);
	}
	componentWillMount() {}
	render() {
		const { handleClick } = this.props;
		return (
			<div className={style.box_container}>
				<ZButton
					outline="true"
					outlinetype="dashed"
					onClick={handleClick}
					className={style.addBtn}
					iconsource={Image.icon.add_ico}
					iconClassName={style.icon}
				>
					添加需要还款的信用卡
				</ZButton>
			</div>
		);
	}
}
