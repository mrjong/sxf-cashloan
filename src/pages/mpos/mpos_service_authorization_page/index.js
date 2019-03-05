import React, { PureComponent } from 'react';
import styles from './index.scss';
import { store } from 'utils/store';
import Cookie from 'js-cookie';
import qs from 'qs';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import { getDeviceType } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { mpos_service_authorization } from 'utils/analytinsType';
import titlephoto from './img/Logo.png';
import notSelect from './img/SelectNot.png';
import select from './img/Select.png';
import click from './img/Button.png';
import notClick from './img/ButtonNot.png';
const API = {
	doAuth: '/authorize/doAuth'
};
@setBackGround('#fff')
@fetch.inject()
export default class mpos_service_authorization_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			selectFlag: true,
			clickFlag: true
		};
	}
	goSubmit = () => {
		const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
		this.props.$fetch
			.post(API.doAuth, {
				location: store.getPosition(), // 定位地址 TODO 从session取,
				osType: getDeviceType(),
				authToken: query.tokenId
			})
			.then(
				(res) => {
					buriedPointEvent(mpos_service_authorization.auth_btn);
					if (res.authSts === '01') {
                        console.log('发验证码')
						this.props.history.replace(`/mpos/mpos_get_sms_page?tokenId=${query.tokenId}&mblNoHid=${res.mblNoHid}`);
					} else if (res.authSts === '00') {
						// 弹拉新活动新弹窗的标识
						store.setNewUserActivityModal('true')
						// sa.login(res.userId);
						Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.loginToken);
						this.props.history.replace('/home/home');
					} else {
						this.props.toast.info('授权失败', 3, () => { // token和手机号取chkAuth的
							this.props.history.replace(`/login?tokenId=${query.tokenId}&mblNoHid=${query.mblNoHid}`);
						});
					}
				},
				(err) => {
					this.props.toast.info(err.msgInfo);
				}
			);
	};
	// 跳转协议
	go = (url) => {
		this.props.history.push(`/protocol/${url}`);
	};
	render() {
		const { selectFlag, clickFlag } = this.state;
		return (
			<div className={styles.allstyles}>
				<div>
					<img src={titlephoto} className={styles.logo} />
				</div>
				<p className={styles.p1}>该服务由随行付提供</p>
				<p className={styles.p2}>向其提供以下授权即可继续操作</p>
				<div className={styles.accredit}>
					<img
						src={selectFlag || clickFlag ? select : notSelect}
						className={styles.src}
						onClick={() => this.setState({ selectFlag: !selectFlag, clickFlag: !clickFlag })}
					/>
					<div className={styles.allSpan}>
						已阅读并同意签署
						<span
							onClick={() => {
								this.go('register_agreement_page');
							}}
						>
							《随行付金融用户注册协议》
						</span>
						<span
							onClick={() => {
								this.go('privacy_agreement_page');
							}}
						>
							《随行付用户隐私权政策》
						</span>
					</div>
				</div>
				<div onClick={selectFlag ? () => this.goSubmit() : null}>
					<img src={selectFlag ? click : notClick} className={styles.icon} />
					<div className={styles.agreen}>确定</div>
				</div>
			</div>
		);
	}
}
