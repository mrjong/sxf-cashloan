/*
 * @Author: shawn
 * @LastEditTime: 2019-12-03 15:12:20
 */
import React, { Component } from 'react';
import styles from './index.scss';
export default class SelectCityTabBar extends Component {
	//属性声名
	static propTypes = {};
	//默认属性
	static defaultProps = {};

	renderGradientBar() {
		return (
			<div className={styles.tabBar}>
				<div className={{ height: '6px' }} />
			</div>
		);
	}

	renderTab(tab, page, isTabActive, onPressHandler) {
		const tabStyle = isTabActive ? styles.tab : styles.tab;
		if (!tab.children) {
			return null;
		}
		return (
			<div className={tabStyle} key={page} onClick={() => onPressHandler(page)}>
				<span className={isTabActive ? styles.disActive : styles.tabActive}>{tab.name}</span>
				{isTabActive ? this.renderGradientBar() : null}
			</div>
		);
	}

	renderTabs() {
		const { tabs, activeTab } = this.props;
		return tabs.map((tab, page) => {
			const isTabActive = activeTab === page;
			return this.renderTab(tab, page, isTabActive, this.props.goToPage);
		});
	}

	render() {
		return <div className={styles.headerbox}>{this.renderTabs()}</div>;
	}
}
