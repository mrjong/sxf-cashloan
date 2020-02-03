import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd-mobile';
import style from './index.scss';

class Dialog extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showCover: false,
			showDialog: false,
			menuList: [],
			stepText: ''
		};
		this.requestClose = (type, questionName) => {
			this.props.onRequestClose(type, questionName);
			if (this.props.autoClose) clearTimeout(this.autoClose);
		};
	}
	autoClose;
	static propTypes = {
		onRequestClose: PropTypes.func,
		open: PropTypes.bool,
		showCover: PropTypes.bool,
		showCloseBtn: PropTypes.bool,
		autoClose: PropTypes.bool,
		timeout: PropTypes.number
	};
	static defaultProps = {
		onRequestClose: () => {},
		open: false,
		showCover: false,
		showCloseBtn: false,
		autoClose: false,
		timeout: 3
	};
	componentWillMount() {
		if (this.props.open) {
			this.setState({ showDialog: true }, () => {});
			if (this.props.showCover) {
				this.setState({ showCover: true });
			}
		} else {
			this.setState({ showDialog: false });
			if (this.state.showCover) {
				this.setState({ showCover: false });
			}
		}
		this.toggleMenuList();
	}
	componentWillReceiveProps(props) {
		if (props.open) {
			this.setState({ showDialog: true }, () => {});
			if (props.showCover) {
				this.setState({ showCover: true });
			}
		} else {
			this.setState({ showDialog: false });
			if (this.state.showCover) {
				this.setState({ showCover: false });
			}
		}
	}
	toggleMenuList = () => {
		const pathname = window.location.pathname;
		switch (pathname) {
			case '/home/loan_repay_confirm_page':
				this.setState({
					menuList: [
						{
							name: '可申请的额度太低',
							type: ''
						},
						{
							name: '不知道如何更新信用卡',
							type: ''
						},
						{
							name: '导入多张信用卡,都无法提交',
							type: ''
						},
						{
							name: '不想借钱到信用卡',
							type: ''
						},
						{
							name: '多次申请额度都太低',
							type: ''
						},
						{
							name: '再次借款,要更新账单,就不想申请了',
							type: ''
						},
						{
							name: '继续申请',
							type: 'button'
						}
					],
					stepText: '立即提交'
				});
				break;
			case '/home/essential_information':
				this.setState({
					menuList: [
						{
							name: '现在比较忙,不方便填写',
							type: ''
						},
						{
							name: '担心信息泄露,不想填写',
							type: ''
						},
						{
							name: '最高5万额度,都不够用',
							type: ''
						},
						{
							name: '暂时没有借款需求',
							type: ''
						},
						{
							name: '继续申请',
							type: 'button'
						}
					],
					stepText: '仅2步操作'
				});
				break;
			case '/home/moxie_bank_list_page':
				this.setState({
					menuList: [
						{
							name: '没有支持银行',
							type: ''
						},
						{
							name: '没有开通网银',
							type: ''
						},
						{
							name: '已开通网银不知道密码',
							type: ''
						},
						{
							name: '想借款,但操作太复杂,没有耐心了',
							type: ''
						},
						{
							name: '已经提交过资料,不想再次填写',
							type: ''
						},
						{
							name: '继续申请',
							type: 'button'
						}
					],
					stepText: '还剩1步操作'
				});
				break;
			default:
				this.setState({
					menuList: []
				});
				break;
		}
	};
	render() {
		return (
			<div className={style.dialog_container}>
				{this.state.menuList.length > 0 ? (
					<div className={style.weui_dialog}>
						<Icon
							type="cross"
							className={style.arrow_icon}
							color="#86919D"
							onClick={() => {
								this.requestClose(true, '关闭');
							}}
						/>
						<h2 className={style.header_title}>{this.state.stepText}</h2>
						<h3 className={style.header_subtitle}>即可获取最高50000元！</h3>
						<ul>
							{this.state.menuList.map((item, idx) => (
								<li
									className={[style.button_item, item.type === 'button' ? style.blue_text : ''].join(' ')}
									key={idx}
									onClick={() => {
										this.requestClose(item.type === 'button' ? true : false, item.name);
									}}
								>
									{item.name}
								</li>
							))}
						</ul>
					</div>
				) : (
					<div className={style.weui_dialog_default}>
						<div className={style.content_box}>
							<div>即将获得50000元，确定放弃吗？</div>
						</div>
						<div className={style.btn_container}>
							<div
								onClick={() => {
									this.requestClose(false, '放弃');
								}}
								className={`${style.btn_one} ${style.btn_one_new}`}
							>
								放弃{' '}
							</div>
							<div
								onClick={() => {
									this.requestClose(true, '再等等');
								}}
								className={`${style.btn_two} ${style.btn_two_new}`}
							>
								再等等
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}
}

export default Dialog;
