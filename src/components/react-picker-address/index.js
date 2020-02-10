import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fetch from 'sx-fetch';
import { Carousel, Icon } from 'antd-mobile';
import styles from './index.scss';
import SelectCityTabBar from './SelectCityTabBar';
import { msg_area } from 'fetch/api.js';
const initObj = {
	code: null,
	name: '请选择',
	children: null
};

@fetch.inject()
export default class AddressSelect extends Component {
	static propTypes = {
		title: PropTypes.string,
		value: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
		level: PropTypes.number,
		commitFun: PropTypes.func,
		dissmissFun: PropTypes.func
	};

	static defaultProps = {
		title: '请选择所在地区',
		level: 4,
		value: [
			{
				code: null,
				name: '请选择'
			}
		],
		commitFun() {},
		dissmissFun() {}
	};

	constructor(props) {
		super(props);
		this.state = {
			selectAddress: [
				{
					code: null,
					name: '请选择',
					children: []
				}
			],
			slideIndex: 0
		};
	}

	componentDidMount() {
		if (this.props.value.length > 0) {
			this.recoveryData();
		} else {
			this.handleGetProvinceData();
		}
	}

	async handleGetProvinceData() {
		const provinceData = await this.props.$fetch.get(`${msg_area}/0`);
		let selectAddressNew = JSON.parse(JSON.stringify(this.state.selectAddress));
		selectAddressNew[0].children = JSON.parse(JSON.stringify(provinceData.data.data));
		this.setState({ selectAddress: selectAddressNew });
	}

	recoveryData() {
		const { value, level } = this.props;
		console.log(value, 'value');
		let newValue = JSON.parse(JSON.stringify(value));
		newValue.unshift({ code: '0' });
		let requestList = newValue.map((item) =>
			this.props.$fetch.get(`${msg_area}/${item.code}`, {}, { hideLoading: true })
		);
		requestList = requestList.slice(0, level);
		let selectAddressNew = JSON.parse(JSON.stringify(this.state.selectAddress));
		fetch.all(requestList).then((res) => {
			res
				.filter((item) => item && item.data && item.data.data && item.data.data.length)
				.forEach((item, index) => {
					if (!selectAddressNew[index]) {
						selectAddressNew[index] = JSON.parse(JSON.stringify(initObj));
					}
					selectAddressNew[index].children = JSON.parse(JSON.stringify(item.data.data));
					if (value[index]) {
						selectAddressNew[index].code = value[index].code;
						selectAddressNew[index].name = value[index].name;
					}
				});
			this.setState({
				selectAddress: JSON.parse(JSON.stringify(selectAddressNew))
			});
			setTimeout(() => {
				if (newValue.length > this.props.level) {
					this.setState({
						slideIndex: value.length - 1
					});
				} else {
					this.setState({
						slideIndex: newValue.length - 1
					});
				}
			}, 0);
		});
	}

	renderTitleBar() {
		const { title } = this.props;
		return <div className={styles.title}>{title}</div>;
	}

	renderScrollTab() {
		const { selectAddress } = this.state;
		return selectAddress.map((obj, i) => {
			let array = selectAddress[i].children;
			if (array) {
				return (
					<div className={styles.areaBox} key={i}>
						{array.map((item) => this.renderListItem(item, i))}
					</div>
				);
			}
			return null;
		});
	}

	/**
	 * 列表行
	 * @param item
	 * @param i 层级 省、市、区、街道等
	 * @returns {XML}
	 */
	renderListItem(item, i) {
		let { selectAddress } = this.state;
		let textStyle = styles.itemText;
		const isActive = item.code === selectAddress[i].code;
		if (isActive) {
			textStyle = styles.itemtextactive;
		}
		return (
			<div
				className={styles.itemStyle}
				key={i + item.code}
				onClick={this.handleClickListItem.bind(this, item, i)}
			>
				{isActive ? <Icon size="xs" className={styles.checkIcon} type="check"></Icon> : null}
				<span className={textStyle}>{item.name}</span>
			</div>
		);
	}

	/**
	 * 点击列表事件
	 * @param item 选中数据
	 * @param i 层级 省、市、区、街道等
	 */
	async handleClickListItem(item, i) {
		const { level } = this.props;
		const { selectAddress } = this.state;
		const isLastItem = i >= level - 1;

		let selectAddressNew = JSON.parse(JSON.stringify(selectAddress));
		selectAddressNew[i].code = item.code;
		selectAddressNew[i].name = item.name;
		// 如果当前点击 已经是最后一层 先改变值 隔一定时间 再发射值
		if (isLastItem) {
			this.setState({ selectAddress: selectAddressNew }, () => {
				setTimeout(() => {
					this.handleEmitValue();
				}, 150);
			});
			return null;
		}

		// 如果当前点击没变化 并且下级有内容 则只切换
		if (
			item.code === selectAddress[i].code &&
			selectAddress[i + 1] &&
			selectAddress[i + 1].children &&
			selectAddress[i + 1].children.length
		) {
			this.setState({
				slideIndex: this.state.slideIndex + 1
			});
			// this.tabView.goToPage(i + 1);
			return;
		}

		// 在当前点击后后面的层级需要置空，前提是当前点击的层级值发生改变
		selectAddressNew = selectAddressNew.map((temp, index) => {
			if (index > i) {
				return JSON.parse(JSON.stringify(initObj));
			}
			return temp;
		});

		// 请求下一层级的数据
		const nextData = await this.props.$fetch.get(`${msg_area}/${item.code}`);

		// 如果有数据 则设置下一级的值，否则，会认为到达最后一级，然后发射值。
		if (nextData.data && nextData.data.data && nextData.data.data.length) {
			if (!selectAddressNew[i + 1]) {
				selectAddressNew[i + 1] = JSON.parse(JSON.stringify(initObj));
			}
			selectAddressNew[i + 1].children = JSON.parse(JSON.stringify(nextData.data.data));
			// selectAddressNew[i + 2] = JSON.parse(JSON.stringify(initObj));
		} else {
			this.setState({ selectAddress: selectAddressNew }, () => {
				setTimeout(() => {
					this.handleEmitValue();
				}, 1500);
			});
			return null;
		}
		this.setState({ selectAddress: selectAddressNew });

		setTimeout(() => {
			this.setState({
				slideIndex: this.state.slideIndex + 1
			});
		}, 0);
	}

	handleEmitValue(data = this.state.selectAddress) {
		const selectAddressFormat = data
			.filter((item) => item && item.code)
			.map((item) => ({
				code: item.code,
				name: item.name,
				key: item.code,
				value: item.name
			}));
		this.props.commitFun && this.props.commitFun(selectAddressFormat);
		this.props.dissmissFun && this.props.dissmissFun();
	}

	render() {
		return (
			<div className={styles.container}>
				{this.renderTitleBar()}
				{/* {this.renderScrollTab()} */}
				<div
					ref={(tabView) => {
						this.tabView = tabView;
					}}
					// renderTabBar={() => <SelectCityTabBar />}
				>
					{
						<SelectCityTabBar
							goToPage={(page) => {
								this.setState({
									slideIndex: page
								});
							}}
							tabs={this.state.selectAddress}
							activeTab={this.state.slideIndex}
						/>
					}
					<Carousel
						dots={false}
						initialSlideHeight={300}
						swipeSpeed={300}
						infinite={false}
						autoplay={false}
						selectedIndex={this.state.slideIndex}
						afterChange={(index) => {
							this.setState({
								slideIndex: index
							});
						}}
					>
						{this.renderScrollTab()}
					</Carousel>
				</div>
			</div>
		);
	}
}
