import React, { PureComponent } from 'react';
import qs from 'qs';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';

const { PROJECT_ENV } = process.env;
console.log(PROJECT_ENV, 'PROJECT_ENV');
const API = {
	LANDING_IMG_URL: '/my/getLandingPage'
};

@fetch.inject()
export default class landing_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			imgUrl: ''
		};
	}

	componentWillMount() {
		this.getLandingImgByUrl();
	}

	// 根据 url 上的参数，获取图片
	getLandingImgByUrl() {
		const searchParams = qs.parse(decodeURI(window.location.search), { ignoreQueryPrefix: true });
		const landingId = searchParams.landingId || '';
		this.props.$fetch.get(`${API.LANDING_IMG_URL}/${landingId}`).then((res) => {
			if (res.msgCode === 'PTM0000' && res.data !== null) {
				if (!res.data.landingImage) {
					this.props.toast.info('活动已过期!');
					setTimeout(() => {
						this.props.history.push('/home/home');
					}, 3000);
					return;
				}
				this.props.setTitle(res.data.landingNm);
				buriedPointEvent(home.landingPage, {
					landingPoint: res.data.landingPoint
				});
				store.setLandingPageImgUrl(`data:image/png;base64,${res.data.landingImage}`);
				this.setState({
					imgUrl: res.data.landingImage
				});
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	}

	render() {
		const { imgUrl } = this.state;
		let frameUrl = '';
		if (PROJECT_ENV === 'pro') {
			frameUrl = 'https://lns-wap.vbillbank.com/disting/#/landing_page';
		} else if (PROJECT_ENV === 'dev') {
			frameUrl = 'https://lns-wap-test.vbillbank.com/disting/#/landing_page';
		} else if (PROJECT_ENV === 'test') {
			frameUrl = 'https://lns-wap-test.vbillbank.com/disting/#/landing_page';
		}
		return imgUrl ? (
			<iframe
				id="landingPage"
				name="landingPage"
				style={{ display: 'block' }}
				title="落地页"
				src={frameUrl}
				width="100%"
				height="100%"
				frameBorder="0"
			/>
		) : null;
	}
}
