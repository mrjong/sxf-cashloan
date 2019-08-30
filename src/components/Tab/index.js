import React, { PureComponent } from 'react';
import { Tabs } from 'antd-mobile';
import styles from './index.scss';

export default class Tab extends PureComponent {
	constructor(props) {
		super(props);
	}

	componentWillMount() {}

	render() {
		const { tabTit, children, ...restProps } = this.props;
		const tabUnderLineWidth = `${50 * (tabTit.length / 2) * 0.8}%`;
		return (
			<div className={styles.tabContainer}>
				<Tabs
					tabs={tabTit}
					// swipeable={false}
					useOnPan={false}
					renderTab={(tab) => <span>{tab.title}</span>}
					renderTabBar={(props) => (
						<Tabs.DefaultTabBar
							{...props}
							renderUnderline={(ulProps) => {
								const { style, ...otherProps } = ulProps;
								const ulStyle = {
									...style,
									border: 'none'
								};
								return (
									<div style={ulStyle} {...otherProps}>
										<div
											style={{
												width: tabUnderLineWidth,
												height: 2,
												backgroundColor: '#FFC601',
												margin: '0 auto'
											}}
										></div>
									</div>
								);
							}}
						/>
					)}
					{...restProps}
				>
					{children}
				</Tabs>
			</div>
		);
	}
}
