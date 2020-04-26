/*
 * @Author: shawn
 * @LastEditTime: 2020-04-24 18:20:11
 */
import React from 'react';
import style from './index.scss';

export default class FixedBar extends React.PureComponent {
	render() {
		const { className = '', isPlus, isAppOpen } = this.props;
		return (
			<div className={`${style.fix_bar} ${className}`}>
				<a
					href={isAppOpen ? 'javascript:;' : 'tel:400-088-7626'}
					onClick={
						isAppOpen
							? () => {
									setTimeout(() => {
										if (isPlus) {
											window.ReactNativeWebView.postMessage('tel:400-088-7626');
										} else {
											window.postMessage('tel:400-088-7626', () => {});
										}
									}, 0);
							  }
							: () => {}
					}
				>
					超过3个工作日没有放款结果，可<span>联系客服</span>
				</a>
			</div>
		);
	}
}
