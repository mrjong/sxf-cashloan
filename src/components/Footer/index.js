/*
 * @Author: shawn
 * @LastEditTime : 2020-02-10 15:36:31
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import styles from './index.scss';
/*
 * 接收一个配置文件数组
 * parms: {
 *   icon: 激活时icon
 *   icon_not: 未激活时icon
 *   title: 相应icon描述文字
 *   color: 激活时文字描述颜色
 *   color-not: 未激活时文字描述颜色
 * }
 *
 * */

function TabItem(props) {
	const { data, showRedDot } = props;
	console.log(showRedDot);
	return (
		<NavLink replace to={data.url} key={data.url} className={styles.item}>
			<i className={window.location.pathname === data.url ? data.icon : data.icon_not} />
			<div
				className={styles.title}
				style={{ color: window.location.pathname === data.url ? '#6A6D70' : '#CECFD3' }}
			>
				{data.url &&
				data.url === '/mine/mine_page' &&
				props &&
				props.showRedDot &&
				Number(props.showRedDot) > 0 ? (
					<span className={styles.icon_top}>
						<i></i>
					</span>
				) : null}

				{data.title}
			</div>
		</NavLink>
	);
}

function TabBarList(props) {
	const { tabList } = props;
	if (tabList.length === 0) {
		return null;
	}
	let tabBarBottom = null;
	tabBarBottom = tabList.map((item) => (
		<TabItem showRedDot={props.showRedDot} key={item.url ? item.url : new Date().getTime()} data={item} />
	));
	return tabBarBottom;
}
@connect((state) => ({
	showRedDot: state.specialState.showRedDot
}))
export default class Footer extends PureComponent {
	static propTypes = {
		data: PropTypes.array,
		footerProps: PropTypes.object
	};

	static defaultProps = {
		footerProps: {
			footerHide: true
		},
		data: [
			{
				title: '首页',
				url: '/home/home',
				icon: styles.home_active,
				icon_not: styles.home
			},
			{
				title: '账单',
				url: '/order/order_page',
				icon: styles.order_active,
				icon_not: styles.order
			},
			{
				title: '我的',
				url: '/mine/mine_page',
				icon: styles.mine_active,
				icon_not: styles.mine
			}
		]
	};

	render() {
		let { data, footerProps, showRedDot } = this.props;
		const { footerHide } = footerProps;
		return footerHide ? null : (
			<div className={[styles.footer, 'application_footerbar'].join(' ')}>
				{<TabBarList showRedDot={showRedDot} tabList={data} />}
			</div>
		);
	}
}
