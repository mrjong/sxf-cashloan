import React, { PureComponent } from 'react';
import styles from './index.scss';
import pwd_img from './img/pwd_img.png';
import { setBackGround } from '../../../utils/background';

@setBackGround('#fff')
export default class service_pwd_guide extends PureComponent {
	render() {
		return (
			<div className={styles.pwd_guide_page}>
				<div className={styles.top_header}>
					<h3 className={styles.header_title}>什么是服务密码</h3>
				</div>
				<div className={styles.boxshadow}>
					<img src={pwd_img} alt="" className={styles.pwd_img} />
				</div>
				<div className={styles.text_wrap}>
					<h3 className={styles.label_title}>如果不知道您的服务密码：</h3>
					<p>1.通过运营商手机营业厅的登录框下的忘记密码选项，点击后，根据页面提示进行验证信息后重置密码；</p>
					<p>2.联系手机号运营商客服重置；</p>
					<p>3.咨询营业厅服务人员。</p>
				</div>
			</div>
		);
	}
}
