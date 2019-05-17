import React from 'react';
import PropTypes from 'prop-types';
import style from './index.scss';
import { Carousel } from 'antd-mobile';
import ZButton from 'components/ButtonCustom';

const _handleClick = (onClick, event) => {
	event.preventDefault();
	!!onClick && onClick();
};

export default class Tag extends React.PureComponent {
	static propTypes = {
		className: PropTypes.string,
		active: PropTypes.bool,
		children: PropTypes.node,
		onClick: PropTypes.func
	};

	static defaultProps = {
		className: '',
		active: false,
		children: 'tag',
		onClick: () => {}
	};

	state = {
		data: [ '1', '2', '3' ],
		imgHeight: 176
	};
	componentDidMount() {
		// simulate img loading
		setTimeout(() => {
			this.setState({
				data: [ 'AiyWuByWklrrUDlFignR', 'TekJlZRVCjLFexlOCuWn', 'IJOtIlfsYdTyaDTRVrLI' ]
			});
		}, 100);
	}

	render() {
		return (
			<Carousel infinite>
				<div className={style.box}>
					<div className={style.title}>
						<i className={style.logo}/>还到-基础版
					</div>
					<div className={style.subtitle}>
						<i />最高可申请还款金(元)
					</div>
					<div className={style.money}>50000.00</div>
					<div className={style.date}>还款日：8888/88/88</div>
          <ZButton>99999</ZButton>
				</div>
				<div className={style.box}>222</div>
				<div className={style.box}>333</div>
			</Carousel>
		);
	}
}
