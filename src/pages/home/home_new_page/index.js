import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import styles from './index.scss';
import { getDeviceType } from 'utils';
import logo from './img/logo.png';
import { setBackGround } from 'utils/background';
import ButtonCustom from 'components/ButtonCustom';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
import Carousels from 'components/Carousels';
import CarouselHome from './components/carousel_home';
const API = {
	BANNER: '/my/getBannerList' // 0101-banner
};

@fetch.inject()
@setBackGround('#fff')
export default class login_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			bannerList: []
		};
	}
	componentWillMount() {
		this.requestGetBannerList();
	}
	// 获取 banner 列表
	requestGetBannerList = () => {
		const params = {
			type: 1,
			client: 'wap_out'
		};
		this.props.$fetch.post(API.BANNER, params, { hideLoading: true }).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				const bannerData = result.data.map((item) => ({
					src: `data:image/png;base64,${item.picUrl}`,
					url: item.gotoFlag !== 0 ? item.gotoUrl : '',
					title: item.title
				}));
				const inFifteenMinutes = new Date(new Date().getTime() + 1000 * 60 * 2);
				Cookie.set('bannerAble', true, { expires: inFifteenMinutes });
				store.setBannerData(bannerData);
				this.setState({
					bannerList: bannerData
				});
			}
		});
	};
	render() {
		const { bannerList } = this.state;
		return (
			<div className={styles.home_new_page}>
				{/* 头部start */}
				<section className={styles.home_header}>
					<div className={styles.title}>
						借钱还信用卡
						<span className={styles.subtitle}>200万人都在用</span>
						<span className={styles.messageIcon}>
							<i className={styles.active} />
						</span>
					</div>
				</section>
				{/* 头部end */}
				{/* 现金_locked_start */}
				<section className={styles.home_xj_black}>
					<div className={styles.title}>还到Plus</div>
					<div className={styles.subtitle}>超多权益任你拿</div>
					<div className={styles.desc}>
						<div className={styles.item_l}>
							按时还款可解锁<i />
						</div>
						<div className={styles.item_r}>
							了解更多权益<i />
						</div>
					</div>
				</section>
				{/* 现金_locked_end */}
				{/* 现金_locked_ing_start */}
				<section className={styles.home_xj_black}>
					<div className={styles.title}>
						还到Plus<i />
					</div>
					<div className={styles.subtitle_90}>90秒</div>
					<div className={styles.desc}>
						<div className={styles.item_l}>按时还款可解锁</div>
						<div className={styles.item_r}>
							了解更多权益<i />
						</div>
					</div>
				</section>
				{/* 现金_locked_ing_end */}

				{/* 代偿50000start */}
				<section className={styles.home_dc_50000}>
					<CarouselHome />
				</section>
				{/* 代偿50000end */}
				{/* banner_start */}
				<section className={styles.home_banner}>
					<Carousels data={bannerList} entryFrom="banner" />
				</section>
				{/* banner_end */}
			</div>
		);
	}
}
