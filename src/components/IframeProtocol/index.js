/*
 * @Author: shawn
 * @LastEditTime: 2019-08-30 15:46:57
 */
import React from 'react';
import styles from './index.scss';

export default class IframeProtocol extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			prefix: '/disting/#/'
		};
	}

	render() {
		const { name, postData } = this.props;
		const ID = name;

		return (
			<iframe
				className={styles.container2}
				src={`${this.state.prefix}${ID}`}
				name={ID}
				id={ID}
				onLoad={() => {
					postData && window.frames[ID].setData(postData);
				}}
				width="100%"
				height="100%"
				frameBorder="0"
			/>
		);
	}
}
