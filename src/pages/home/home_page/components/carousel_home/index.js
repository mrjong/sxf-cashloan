import React from 'react';
import PropTypes from 'prop-types';
import style from './index.scss';
import { Carousel } from 'antd-mobile';
import ZButton from 'components/ButtonCustom';
import plus from './img/plus.png';
import bank from './img/bank.png';
import DCBox from '../DCBox';
const showData = {
	title: '还到-基础版',
	bankNo: '',
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
		autoplay: false,
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
				<Carousel {...restProps}>
					<DCBox showData={showData}>
						<div className={style.subtitle}>
							<i />
							{showData.subtitle}
						</div>
						<div className={style.money}>{showData.money}</div>
						<div className={style.desc}>{showData.desc}</div>
					</DCBox>
					<DCBox showData={showData}>
						<img src={bank} className={style.bank} />
						<div className={style.desc_b}>支持绑定100+信用卡</div>
					</DCBox>
					<DCBox showData={showData}>
						<img src={plus} className={style.plus} />
						<div className={style.desc_b}>2步操作，极速到账</div>
					</DCBox>
				</Carousel>
			</div>
		);
	}
}
