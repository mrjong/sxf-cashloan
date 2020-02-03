import React, { PureComponent } from 'react';
import styles from './index.scss';
import guide1 from './img/guide1.png';
import guide2 from './img/guide2.png';
import guide3 from './img/guide3.png';
import guide4 from './img/guide4.png';
import pwd_guide from './img/pwd_guide.png';
import { setBackGround } from '../../../utils/background';

@setBackGround('#fff')
export default class loan_introduce_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			showFixedTab: true,
			activeTab: 0
		};
	}
	componentDidMount() {
		let boxshadowOffsetTop = this.boxshadow.offsetTop;
		window.addEventListener('scroll', () => {
			this.setState({
				showFixedTab: boxshadowOffsetTop < document.documentElement.scrollTop
			});
		});
	}

	scrollToAnchor = (dom) => {
		if (dom) {
			dom.scrollIntoView({ behavior: 'smooth' });
		}
	};

	toggleTab = (index) => {
		const obj = {
			'0': this.box1,
			'1': this.box2
		};
		this.setState(
			{
				activeTab: index
			},
			() => {
				this.scrollToAnchor(obj[index]);
			}
		);
	};

	render() {
		const { activeTab, showFixedTab } = this.state;
		return (
			<div className={styles.loan_introduce_page}>
				{showFixedTab ? (
					<div className={styles.fixed_tab}>
						{['获取额度', '如何操作'].map((item, index) => (
							<div
								key={item}
								className={styles.tab_item}
								onClick={() => {
									this.toggleTab(index);
								}}
							>
								<span
									className={[styles.tab_item_text, activeTab === index && styles.tab_item_text_active].join(
										' '
									)}
								>
									{item}
								</span>
								{activeTab === index && <span className={styles.tab_line}></span>}
							</div>
						))}
					</div>
				) : null}

				<div className={styles.top_header}>
					<h3 className={styles.header_title}>借款攻略</h3>
					<p className={styles.header_desc}>教你如何使用还到，借钱还信用卡</p>
				</div>
				<div className={styles.boxshadow} ref={(view) => (this.boxshadow = view)}>
					<div className={styles.tab_wrap}>
						{['获取额度', '如何操作'].map((item, index) => (
							<div
								key={item}
								className={styles.tab_item}
								onClick={() => {
									this.toggleTab(index);
								}}
							>
								<span
									className={[styles.tab_item_text, activeTab === index && styles.tab_item_text_active].join(
										' '
									)}
								>
									{item}
								</span>
								{activeTab === index && <span className={styles.tab_line}></span>}
							</div>
						))}
					</div>
					<h3 className={styles.label_title} ref={(view) => (this.box1 = view)}>
						如何获取额度？
					</h3>
					<div className={styles.img1_wrap}>
						<img src={guide1} alt="" className={styles.img1} />
						<img
							src={pwd_guide}
							alt=""
							className={styles.pwd_guide}
							onClick={() => {
								this.props.history.push('/others/service_pwd_guide');
							}}
						/>
					</div>
				</div>

				<h3 className={styles.label_title} ref={(view) => (this.box2 = view)}>
					具体如何操作？
				</h3>
				<div className={styles.img2_wrap}>
					<img src={guide2} alt="" className={styles.img2} />
					<img src={guide3} alt="" className={styles.img2} />
					<img
						src={guide4}
						alt=""
						className={styles.img2}
						onClick={() => {
							this.scrollToAnchor(this.boxshadow);
						}}
					/>
				</div>
			</div>
		);
	}
}
