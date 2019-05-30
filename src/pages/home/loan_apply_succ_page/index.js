import React, { PureComponent } from 'react';
import style from './index.scss';
import { setBackGround } from 'utils/background';
import ExamineComponents from 'components/ExamineComponents';
import ZButton from 'components/ButtonCustom';
import qs from 'qs';

@setBackGround('#fff')
export default class remit_ing_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			queryData: {}
		};
	}
	componentWillMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		this.setState({
			queryData
		});
	}
	render() {
		const { queryData } = this.state;
		return (
			<div className={style.remit_ing_page}>
				<div className={style.topImg}>
					<ExamineComponents />
				</div>
				<div className={style.topBox}>
					<div className={style.title}>{queryData.title}</div>
					<div className={style.subtitle}>
						{queryData.desc}
						<a href="tel:400-088-7626">联系客服</a>
					</div>
				</div>
				<div className={style.step_box_new}>
					<div className={[ style.step_item, style.active ].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							借款申请提交成功
						</div>
						<div className={style.line} />
					</div>
					<div className={[ style.step_item ].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							借款打入信用卡
						</div>
						<div className={style.line} />
					</div>
				</div>
				<ZButton
					onClick={() => {
						this.props.history.push('/home/home');
					}}
					className={style.submitBtn}
				>
					我知道了
				</ZButton>
			</div>
		);
	}
}
