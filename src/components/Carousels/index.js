import React from 'react';
import PropTypes from 'prop-types';
import { Carousel } from 'antd-mobile';
import { withRouter } from 'react-router-dom';
import { store } from 'utils/store';
import style from './index.scss';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';

import { SXFToast } from 'utils/SXFToast';
@withRouter
export default class Carousels extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			imgHeight: 176
		};
	}

	static propTypes = {
		entryFrom: PropTypes.string,
		data: PropTypes.array,
		autoplay: PropTypes.bool,
		infinite: PropTypes.bool,
		dotStyle: PropTypes.object,
		dotActiveStyle: PropTypes.object,
		children: PropTypes.node,
		swipeSpeed: PropTypes.number
	};

	static defaultProps = {
		entryFrom: 'banner',
		data: [],
		autoplay: true,
		infinite: true,
		dotStyle: {
			width: '0.2rem',
			height: '0.04rem',
			borderRadius: '0',
			backgroundColor: '#000000',
			opacity: 0.6
		},
		swipeSpeed: 100,
		dotActiveStyle: {
			width: '0.2rem',
			borderRadius: '0',
			height: '0.04rem',
			backgroundColor: '#FF4E44'
		},
		children: ''
	};

	handleLinkClick = (item, itemIndex) => {
		// banner埋点
		buriedPointEvent(home.bannerClick, {
			bannerIndex: itemIndex + 1
		});
		const { url, title } = item;
		const { entryFrom } = this.props;
		if (!url) {
			return;
		}
		store.setOutLinkUrl(url);
		SXFToast.loading('加载中...', 0);
		let jumpUrl = '';
		if (entryFrom) {
			if (url.split('?')[1]) {
				jumpUrl = `${url}&entryFrom=${entryFrom}&pageTitle=${title}`;
			} else {
				jumpUrl = `${url}?entryFrom=${entryFrom}`;
			}
		} else {
			jumpUrl = url;
		}
		// return;
		window.location.href = encodeURI(jumpUrl);
	};

	render() {
		const { data, children, ...restProps } = this.props;
		return (
			<div className={style.carouse_wrap}>
				<Carousel {...restProps}>
					{data.map((item, index) => (
						<div
							key={item}
							onClick={() => {
								this.handleLinkClick(item, index);
							}}
							style={{ width: '100%', height: this.state.imgHeight }}
						>
							<img
								src={item.src}
								alt=""
								style={{ width: '100%', verticalAlign: 'top' }}
								onLoad={() => {
									window.dispatchEvent(new Event('resize'));
									this.setState({ imgHeight: 'auto' });
								}}
							/>
						</div>
					))}
				</Carousel>
				{children}
			</div>
		);
	}
}
