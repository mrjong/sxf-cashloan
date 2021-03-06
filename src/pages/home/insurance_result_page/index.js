import React, { Component } from 'react';
import { setBackGround } from 'utils/background';
import Images from 'assets/image';
import { ButtonCustom } from 'components';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import { store } from 'utils/store';
import styles from './index.scss';

let timer = null;

@setBackGround('#fff')
class insurance_result_page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			seconds: 2,
			status: 'waiting'
		};
	}

	componentDidMount() {
		clearInterval(timer);
		timer = setInterval(() => {
			this.setState(
				{
					seconds: this.state.seconds - 1
				},
				() => {
					if (this.state.seconds < 1) {
						clearInterval(timer);
						this.setState({
							status: 'fail'
						});
					}
				}
			);
		}, 1000);
	}

	componentWillUnmount() {
		clearInterval(timer);
	}

	goHome = () => {
		buriedPointEvent(home.riskGuaranteeResultBackHome);
		this.props.history.replace('/home/home');
	};

	goBack = () => {
		buriedPointEvent(home.riskGuaranteeResultTry);
		store.setRiskGuaranteeModalShow(true);
		this.props.history.goBack();
	};

	render() {
		const { status } = this.state;
		return (
			<div className={styles.pageWrap}>
				<div className={styles.loading_box}>
					{status === 'waiting' && (
						<div>
							<img src={Images.adorn.waiting} alt="" className={styles.waiting_icon} />
						</div>
					)}
					{status === 'fail' && (
						<div>
							<img className={styles.icon} src={Images.adorn.fail} alt="" />
							<p className={styles.iconDesc}>对不起，您的风险评估尚未通过。</p>
							<p className={styles.iconDesc}>99%的人选择参加风险保障计划后成功放款。</p>
						</div>
					)}
				</div>
				<div>
					{status === 'fail' && (
						<div>
							<ButtonCustom className={styles.button} onClick={this.goBack}>
								立即参加
							</ButtonCustom>
							<button onClick={this.goHome} className={styles.subButton}>
								返回首页
							</button>
						</div>
					)}
				</div>
			</div>
		);
	}
}

export default insurance_result_page;
