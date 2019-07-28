/**
 * @param {String} imageUrl 图片的路径
 * @param {Number} imageWidth 展示图片的宽
 * @param {Number} imageHeight 展示图片的高
 * @param {Number} fragmentSize 滑动图片的尺寸
 * @param {Function} onReload 当点击'重新验证'时执行的函数
 * @param {Function} onMath 匹配成功时执行的函数
 * @param {Function} onError 匹配失败时执行的函数
 */

import React from 'react';
import style from './index.scss';

const icoReload = require('./img/reload.png');
const icoSlider = require('./img/slider.png');

const STATUS_LOADING = 0; // 还没有图片
const STATUS_READY = 1; // 图片渲染完成,可以开始滑动
const STATUS_MATCH = 2; // 图片位置匹配成功
const STATUS_ERROR = 3; // 图片位置匹配失败

class ImageCode extends React.Component {
	static defaultProps = {
		imageUrl: '',
		smallImageUrl: '',
		imageWidth: 270,
		imageHeight: 160,
		fragmentSize: 37.5,
		onReload: () => {},
		onMatch: () => {},
		onError: () => {}
	};

	state = {
		isMovable: false,
		startX: 0, // 开始滑动的 x
		oldX: 0,
		currX: 0, // 滑块当前 x,
		status: STATUS_LOADING,
		showTips: false,
		showSlideText: true,
		isShake: false
	};

	componentDidMount() {
		this.renderImage();
	}

	componentDidUpdate(prevProps) {
		// 当父组件传入新的图片后，开始渲染
		if (!!this.props.imageUrl && prevProps.imageUrl !== this.props.imageUrl) {
			this.renderImage();
			this.onReset();
		}
	}

	onMoveStart = (e) => {
		if (this.state.status !== STATUS_READY) {
			return;
		}

		// 记录滑动开始时的绝对坐标x
		this.setState({ isMovable: true, startX: e.touches[0].clientX, showSlideText: false });
	};

	onMoving = (e) => {
		if (this.state.status !== STATUS_READY || !this.state.isMovable) {
			return;
		}

		const distance = e.touches[0].clientX - this.state.startX;
		let currX = this.state.oldX + distance;
		const minX = 0;
		const maxX = this.props.imageWidth - this.props.fragmentSize;
		currX = currX < minX ? 0 : currX > maxX ? maxX : currX;
		this.setState({ currX });
	};

	onMoveEnd = () => {
		if (this.state.status !== STATUS_READY || !this.state.isMovable) {
			return;
		}
		// 将旧的固定坐标x更新
		this.setState((pre) => ({ isMovable: false, oldX: pre.currX }));
		const xAxis = (this.state.currX * this.state.scale).toFixed(2);
		this.props.onMoveEnd(xAxis, (type) => {
			if (type === 'success') {
				this.setState((pre) => ({ status: STATUS_MATCH, currX: pre.offsetX }));
			} else if (type === 'error') {
				this.setState({ status: STATUS_ERROR }, () => {
					this.onReset();
					this.onShowTips();
				});
				// this.props.onError();
			} else {
				this.setState({ status: STATUS_ERROR }, () => {
					this.onShowTips();
				});
			}
		});
	};

	onReset = () => {
		const timer = setTimeout(() => {
			this.setState({ oldX: 0, currX: 0, status: STATUS_READY, showSlideText: true });
			clearTimeout(timer);
		}, 1000);
	};

	onReload = () => {
		if (this.state.status !== STATUS_READY && this.state.status !== STATUS_MATCH) {
			return;
		}

		this.setState(
			{
				isMovable: false,
				startX: 0, // 开始滑动的 x
				oldX: 0,
				currX: 0, // 滑块当前 x,
				status: STATUS_LOADING
			},
			this.props.onReload
		);
	};

	onShowTips = () => {
		if (this.state.showTips) {
			return;
		}

		this.setState({ showTips: true });
		const timer = setTimeout(() => {
			this.setState({ showTips: false });
			clearTimeout(timer);
		}, 1000);
	};

	renderImage = () => {
		// 初始化状态
		this.setState({ status: STATUS_LOADING });
		// 创建一个图片对象，主要用于canvas.context.drawImage()
		const objImage = new Image();

		objImage.addEventListener('load', () => {
			// 修改状态
			this.setState({
				status: STATUS_READY,
				scale: this.props.bigImageH / this.props.imageHeight
			});
		});
		objImage.src = this.props.imageUrl;
	};

	render() {
		const { imageUrl, smallImageUrl, imageWidth, imageHeight, fragmentSize, onClose, yOffset } = this.props;
		const { currX, showTips, showSlideText, status } = this.state;
		return (
			<div className={style.image_mask}>
				<div className={[style.image_code, status === 3 ? style.image_code_shake : ''].join(' ')}>
					<div
						className={style.close_icon}
						onClick={() => {
							onClose();
						}}
					></div>
					<div className={style.image_wrap}>
						<div
							className={style.image_container}
							style={{ width: imageWidth, height: imageHeight, backgroundImage: `url("${imageUrl}")` }}
						>
							<span
								className={[style.highlight_box, status === 2 ? style.highlight_box_active : ''].join(' ')}
							></span>
							<img
								src={smallImageUrl}
								width={fragmentSize}
								height={fragmentSize}
								style={{
									left: currX + 'px',
									top: yOffset / this.state.scale + 'px'
								}}
								className={style.small_image}
							/>

							<div className={showTips ? style.tips_container_active : style.tips_container}>
								<span className={style.tips_text}>拖动滑块将悬浮图像正确拼合</span>
							</div>
						</div>
						<div className={style.image_cover}></div>
					</div>

					<div className={style.reload_container}>
						<div className={style.reload_wrapper} onClick={this.onReload}>
							<i className={style.reload_ico} style={{ backgroundImage: `url("${icoReload}")` }} />
							<span className={style.reload_tips}>刷新验证</span>
						</div>
					</div>

					<div className={style.slider_wrpper}>
						<div className={style.slider_bar}>
							<span className={showSlideText ? style.slider_bar_txt : style.slider_bar_txt_active}>
								拖动左边滑块完成上方拼图
							</span>
						</div>
						<div
							className={style.slider_button}
							onTouchStart={this.onMoveStart}
							onTouchEnd={this.onMoveEnd}
							onTouchMove={this.onMoving}
							style={{ left: currX + 'px', backgroundImage: `url("${icoSlider}")` }}
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default ImageCode;
