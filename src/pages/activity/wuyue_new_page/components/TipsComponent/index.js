import React, { Component } from 'react';
import style from './index.scss';
import SXFButton from 'components/ButtonCustom';

export default class TipsComponent extends Component {
	static defaultProps = {};
	constructor(props) {
		super(props);
		this.state = {};
	}

	// 点击按钮
	go = () => {
		const { clickCb } = this.props;
		clickCb();
	};
	render() {
		const { tipsTit, tipsCont, btnText } = this.props;
		return (
			<div className={style.tips_wrap}>
				<h3 className={style.tips_tit}>{tipsTit}</h3>
				<div className={style.tips_cont} dangerouslySetInnerHTML={{ __html: tipsCont }} />
				<SXFButton onClick={this.go} className={style.btn_primary}>
					{btnText}
				</SXFButton>
			</div>
		);
	}
}
