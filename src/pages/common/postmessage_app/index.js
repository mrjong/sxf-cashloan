/*
 * @Author: shawn
 * @LastEditTime: 2019-10-12 14:50:28
 */
import React, { PureComponent } from 'react';
import ButtonCustom from 'components/ButtonCustom';
import styles from './index.scss';
let timer = '';
export default class postmessage_app extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			showPage: false
		};
	}
	componentDidMount() {
		timer = setTimeout(() => {
			this.setState({
				showPage: true
			});
		}, 5000);
	}
	componentWillUnmount() {
		timer && clearTimeout(timer);
	}
	// 重新加载
	reloadHandler = () => {
		window.location.reload();
	};
	render() {
		const { showPage } = this.state;
		return (
			<div>
				{showPage ? (
					<div className={styles.err_page}>
						<i className={styles.err_img}></i>
						<p className={styles.err_cont}>对不起，您找的页面走丢了～</p>
						<ButtonCustom onClick={this.reloadHandler} className={styles.reload_btn}>
							返回首页
						</ButtonCustom>
					</div>
				) : null}
			</div>
		);
	}
}
