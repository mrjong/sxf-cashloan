import React from 'react';
import style from './index.scss';
import { store } from 'utils/store';
import Cookie from 'js-cookie';
const API = {
	MSG_COUNT: '/my/msgCount' // h5-查询未读消息总数
};
let token = '';
let tokenFromStorage = '';
export default class MsgTip extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			count: ''
		};
	}
	componentWillMount() {
		token = Cookie.get('fin-v-card-token');
		tokenFromStorage = store.getToken();
		if (token && tokenFromStorage) {
			this.requestMsgCount();
		}
	}
	// 去消息页面
	jumpToMsg = () => {
		this.props.history.push('/home/message_page');
	};
	// 获取 未读消息条数 列表
	requestMsgCount = () => {
		this.props.$fetch.post(API.MSG_COUNT, null, { hideLoading: true }).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				this.setState({
					count: result.data.count
				});
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};
	render() {
		const { count } = this.state;
		return (
			<section className={style.home_header_wrap}>
				<div className={style.home_header_main}>
					<span className={style.home_header_title}>想还·就还到</span>
					<div>
						{token &&
							tokenFromStorage && (
								<span onClick={this.jumpToMsg} className={style.messageIcon}>
									{count ? <i className={style.active} /> : null}
								</span>
							)}
					</div>
				</div>
				<p className={style.home_header_sub}>随行付金融旗下信贷服务</p>
			</section>
		);
	}
}
