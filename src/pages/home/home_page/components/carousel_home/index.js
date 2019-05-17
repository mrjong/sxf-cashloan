import React from 'react';
import PropTypes from 'prop-types';
import style from './index.scss';
import { Carousel } from 'antd-mobile';
import ZButton from 'components/ButtonCustom';
import plus from './img/plus.png';
import bank from './img/bank.png';
import DCCard from '../dcCard';
const showData = {
	title: '还到-基础版',
	bankNo: 'CMB',
	subtitle: '最高可申请还款金(元)',
	money: '50000.00',
	desc: '还款日：8888/88/88',
	btnText: '添加需要还款信用卡'
};
export default class carouselHome extends React.Component {
	constructor(props) {
		super(props);
	}
	static propTypes = {
		entryFrom: PropTypes.string,
		data: PropTypes.array,
		autoplay: PropTypes.bool,
		infinite: PropTypes.bool,
		dotStyle: PropTypes.object,
		dotActiveStyle: PropTypes.object,
		children: PropTypes.node,
		swipeSpeed: PropTypes.number,
		cellSpacing: PropTypes.number
	};

	static defaultProps = {
		entryFrom: 'banner',
		data: [],
		autoplay: true,
		infinite: true,
		cellSpacing: 1,
		dotStyle: {
			width: '0.2rem',
			height: '0.04rem',
			borderRadius: '0',
			backgroundColor: '#B7BAC1'
		},
		swipeSpeed: 100,
		dotActiveStyle: {
			width: '0.2rem',
			borderRadius: '0',
			height: '0.04rem',
			backgroundColor: '#121C32'
		},
		children: ''
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
		const { data, children, ...restProps } = this.props;
		return (
			<div className="carouselHome">
				<div className={style.box_container}>
					<Carousel {...restProps}>
						<DCCard showData={showData} />
						<div className={style.box}>
							<div className={style.title}>
								<i className={[ 'bank_ico logo_ico', `${style.bankLogo}` ].join(' ')} />还到-基础版
							</div>
							<img src={bank} className={style.bank} />
							<div className={style.desc_b}>支持绑定100+信用卡</div>
							<ZButton className={style.submitBtn}>添加需要还款信用卡</ZButton>
						</div>
						<div className={style.box}>
							<div className={style.title}>
								<i className={[ 'bank_ico logo_ico', `${style.bankLogo}` ].join(' ')} />还到-基础版
							</div>
							<img src={plus} className={style.plus} />
							<div className={style.desc_b}>2步操作，极速到账</div>
							<ZButton className={style.submitBtn}>添加需要还款信用卡</ZButton>
						</div>
					</Carousel>
				</div>
			</div>
		);
	}
}
