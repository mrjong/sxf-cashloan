import React, { PureComponent } from 'react';
import styles from './index.scss';
import { store } from 'utils/store';
import Cookie from 'js-cookie';
import qs from 'qs';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import { getDeviceType } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import SXFButton from 'components/ButtonCustom';
import { mpos_service_authorization } from 'utils/analytinsType';
import { Checkbox } from 'antd-mobile';
const AgreeItem = Checkbox.AgreeItem;
const needDisplayOptions = [ 'basicInf' ];
const API = {
	doAuth: '/authorize/doAuth',
	getStw: '/my/getStsw', // 获取4个认证项的状态(看基本信息是否认证)
};
@setBackGround('#fff')
@fetch.inject()
export default class mpos_service_authorization_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			selectFlag: true
		};
	}
	componentWillMount() {
		buriedPointEvent(mpos_service_authorization.auth_page);
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
						console.log('发验证码');
						this.props.history.replace(
							`/mpos/mpos_get_sms_page?tokenId=${query.tokenId}&mblNoHid=${res.mblNoHid}`
						);
					} else if (res.authSts === '00') {
						// sa.login(res.userId);
						Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.loginToken);
						this.requestGetStatus();
					} else {
						this.props.toast.info('授权失败', 3, () => {
							// token和手机号取chkAuth的
							this.props.history.replace(`/login?tokenId=${query.tokenId}&mblNoHid=${query.mblNoHid}`);
						});
					}
				},
				(err) => {
					this.props.toast.info(err.msgInfo);
				}
			);
	};

	// 获取授信列表状态
	requestGetStatus = () => {
		this.props.$fetch.get(`${API.getStw}`).then((result) => {
			if (result && result.data !== null && result.msgCode === 'PTM0000') {
				const stswData = result.data.length && result.data.filter((item) => needDisplayOptions.includes(item.code));
				if (stswData && stswData.length){
					// case '0': // 未认证
					// case '1': // 认证中
					// case '2': // 认证成功
					// case '3': // 认证失败
					// case '4': // 认证过期
					if (stswData[0].stsw.dicDetailCd === '0') {
						this.props.history.replace({
							pathname: '/home/essential_information',
							search: '?jumpToBase=true&entry=authorize'
						});
					} else {
						this.props.history.replace('/home/home');
					}
				}
			} else {
				this.props.toast.info(result.msgInfo, 2, () => {
					this.props.history.replace('/home/home');
				});
			}
		})
		.catch((err) => {
			this.props.history.replace('/home/home');
		});
	};

	// 跳转协议
	go = (url) => {
		this.props.history.push(`/protocol/${url}`);
	};
	render() {
		const { selectFlag } = this.state;
		return (
			<div>
				<div className={styles.padding_bottom}>
					<div className={styles.bg_top} />
					<div className={styles.bg_list} />
				</div>
				<div>
					<div className={styles.btn_fixed}>
						<SXFButton
							className={selectFlag ? styles.smart_button : [ styles.smart_button, styles.dis ].join(' ')}
							onClick={selectFlag ? () => this.goSubmit() : null}
						>
							确定
						</SXFButton>
						<div>
							<AgreeItem
								className="mpos_middle_checkbox"
								checked={selectFlag}
								data-seed="logId"
								onChange={(e) => this.setState({ selectFlag: e.target.checked })}
							>
								阅读并接受
								<a
									onClick={() => {
										this.go('register_agreement_page');
									}}
								>
									《随行付金融用户注册协议》
								</a>
								<a
									onClick={() => {
										this.go('privacy_agreement_page');
									}}
								>
									《随行付用户隐私权政策》
								</a>
							</AgreeItem>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
