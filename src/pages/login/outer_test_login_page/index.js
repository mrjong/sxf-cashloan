import React, { PureComponent } from 'react';
import LoginCommonPage from '../login_common_page';
import bannerImg from './img/login_bg.png';
import bannerImg2 from './img/login_bg2.png';
import bannerImg3 from './img/login_bg3.png';
import qs from 'qs';

export default class outer_test_login_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		let showData = {};
		switch (query && query.landingType) {
			case '01':
				showData = {
					bannerImg: bannerImg,
					isChecked: true
				};
				break;
			case '02':
				showData = {
					bannerImg: bannerImg,
					isChecked: false
				};
				break;
			case '03':
				showData = {
					bannerImg: bannerImg2,
					isChecked: true
				};
				break;
			case '04':
				showData = {
					bannerImg: bannerImg2,
					isChecked: false
				};
				break;
			case '05':
				showData = {
					bannerImg: bannerImg3,
					isChecked: true
				};
				break;

			default:
				showData = {
					bannerImg: bannerImg,
					isChecked: true
				};
				break;
		}
		return (
			<LoginCommonPage
				{...this.props}
				bannerImg={showData && showData.bannerImg}
				isChecked={showData && showData.isChecked}
			/>
		);
	}
}
