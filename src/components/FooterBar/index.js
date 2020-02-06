import React, { Component } from 'react';
import Image from 'assets/image';

class FooterBar extends Component {
	render() {
		return (
			<div>
				<img src={Image.bg.navBarBg} style={{ width: '200px', margin: '0 auto', display: 'block' }} />
			</div>
		);
	}
}

export default FooterBar;
