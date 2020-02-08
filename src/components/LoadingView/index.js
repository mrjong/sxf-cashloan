import React, { Component } from 'react';
import { ActivityIndicator } from 'antd-mobile';
import Image from 'assets/image';
import styles from './index.scss';

const LoadingState = 1; //初始loading页面
const EmptyState = 2; //空页面
const ErrorState = 3; //加载数据错误
const ListState = 4; //正常加载

/**
 * 通用的加载页面
 */
export default class LoadingView extends Component {
	//默认是加载页面
	currentState = LoadingState;

	/**
	 * 对外提供API,获取到数据
	 */
	showDataView() {
		this.currentState = ListState;
		this.forceUpdate();
	}

	/**
	 * 对外提供API, 加载数据出错
	 */
	setError() {
		this.currentState = ErrorState;
		this.forceUpdate();
	}

	/**
	 * 对外提供API, 加载数据出错
	 */
	setEmpty() {
		this.currentState = EmptyState;
		this.forceUpdate();
	}

	/**
	 * 对外提供API, 出错重新加载数据
	 */
	reloadData = () => {
		this.currentState = LoadingState;
		this.props.onReloadData();
		this.forceUpdate();
	};

	/**
	 * 加载loading页面
	 * @returns {XML}
	 * @private
	 */
	_renderLoading() {
		const style = {
			width: '100%',
			height: '500px',
			display: 'flex',
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center'
		};
		return (
			<div style={style}>
				<ActivityIndicator animating size="large" />
			</div>
		);
	}

	/**
	 * 加载 空页面
	 */
	_renderEmpty() {
		const {
			nodata = {
				width: '100%',
				height: '100%',
				img: Image.bg.no_order,
				text: '暂无数据,点击重试'
			}
		} = this.props;
		return (
			<div onClick={this.reloadData} style={{ width: '100%', height: '100%', textAlign: 'center' }}>
				<img src={nodata.img} alt="" style={{ width: nodata.width, height: nodata.height }} />
				<span className={styles.textNo}>{nodata.text}</span>
			</div>
		);
	}

	/**
	 * 加载 出错页
	 */
	_renderError() {
		const { errordata = { img: Image.bg.no_order, text: '点击重试' } } = this.props;

		return (
			<div onClick={this.reloadData} style={{ width: '100%', height: '100%', textAlign: 'center' }}>
				<img src={errordata.img} alt="" style={{ width: errordata.width, height: errordata.height }} />
				<span className={styles.textNo}>{errordata.text}</span>
			</div>
		);
	}

	/**
	 * 加载列表数据
	 * @returns {XML}
	 * @private
	 */
	_renderView() {
		return <div {...this.props}>{this.props.children}</div>;
	}

	//渲染
	render() {
		console.log(this.currentState, 'currentState');
		if (this.currentState === LoadingState) {
			return this.props.renderLoading || this._renderLoading();
		} else if (this.currentState === EmptyState) {
			return this.props.renderEmpty || this._renderEmpty();
		} else if (this.currentState === ErrorState) {
			return this.props.renderError || this._renderError();
		}
		return this._renderView();
	}
}
