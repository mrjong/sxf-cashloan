/*
 * @Author: shawn
 * @LastEditTime: 2019-09-03 11:42:19
 */
import React from 'react';
import { Popover } from 'antd-mobile';
export default class DownloadTip extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		const { visible = false } = this.props;
		return (
			<Popover
				visible={visible}
				style={{
					textAlign: 'center',
					padding: '.1rem .1rem'
				}}
				overlay={[
					<div
						key={0}
						style={{
							textAlign: 'center',
							padding: '.1rem .1rem'
						}}
					>
						请点击右上角<br></br>
						选择“浏览器中打开”
					</div>
				]}
				align={{
					overflow: { adjustY: 0, adjustX: 0 },
					offset: [-10, 0]
				}}
			>
				<div
					style={{
						marginTop: '10px',
						marginRight: '0',
						display: 'flex',
						position: 'absolute',
						top: 0,
						width: '100%',
						background: '#2a2b2c',
						alignItems: 'center'
					}}
				></div>
			</Popover>
		);
	}
}
