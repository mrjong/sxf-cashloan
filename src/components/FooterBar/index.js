import React, { Component } from 'react';
import Image from 'assets/image';

const style = {
	footerBarWrap: {
		margin: 0
	}
};

class FooterBar extends Component {
	render() {
		return (
			<div style={style.footerBarWrap}>
				<img src={Image.bg.navBarBg} />
			</div>
		);
	}
}

export default FooterBar;
