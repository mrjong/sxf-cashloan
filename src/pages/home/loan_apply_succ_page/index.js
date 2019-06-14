import React, { PureComponent } from 'react';
import style from './index.scss';
import { setBackGround } from 'utils/background';
import ExamineComponents from 'components/ExamineComponents';
import ZButton from 'components/ButtonCustom';
import { Modal } from 'antd-mobile';
import qs from 'qs';
import successImg from './img/success.png';
import failImg from './img/fail.png';
import btnImg from './img/btn.png';
import ACTipAlert from 'components/ACTipAlert';
import message from './img/message.png';
@setBackGround('#fff')
export default class remit_ing_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			queryData: {},
			ACTipAlertShow: true
		};
	}
	componentWillMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		this.setState({
			queryData
		});
	}
	closeBtnFunc = () => {
		this.setState({
			ACTipAlertShow: false
		});
	};
	render() {
		const { queryData, ACTipAlertShow } = this.state;
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
				{/* <Modal className="loan_apply_succ_alert" visible={true} transparent>
					<img src={successImg} className={style.successImg} />
          <div className={style.successTitle}>恭喜获得</div>
					<div className={style.successTime}>总用时：09:09</div>
					<img src={btnImg} className={style.btnImg} />
				</Modal> */}
				{/* <Modal className="loan_apply_succ_alert" visible={true} transparent>
					<img src={failImg} className={style.successImg} />
					<div className={style.failTitle}>很遗憾，您已超时</div>
					<div className={style.failTime}>总用时：09:09</div>
					<img src={btnImg} className={style.btnImg2} />
				</Modal> */}

				<ACTipAlert
					ACTipAlertShow={ACTipAlertShow}
					resetProps={{
						title: '温馨提示',
						desc: '由于您的借款不符合获奖规则 故无法获得奖励，再接再厉吧～',
						closeBtnFunc: this.closeBtnFunc
					}}
				/>

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
