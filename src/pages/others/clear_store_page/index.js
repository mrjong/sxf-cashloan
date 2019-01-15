import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import { List, Checkbox, Button, WhiteSpace } from 'antd-mobile';
const CheckboxItem = Checkbox.CheckboxItem;

const data = [
	{ value: 'fin-v-card-token-wechat', type: 'cookie', label: '微信token' },
	{ value: 'fin-v-card-token', type: 'cookie', label: '登录token' },
	{ value: 'sessionStorage', type: 'sessionStorage', label: '所有sessionStorage缓存' },
	{ value: 'localStorage',type:'localStorage', label: '所有localStorage缓存' }
];
export default class dc_landing_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	clear = () => {
		let isCheck = false;
		data.forEach((element) => {
			if (element.Check) {
				isCheck = true;
				this.doClear(element);
			}
			if (isCheck) {
				this.props.toast.info('清理成功');
			} else {
				this.props.toast.info('请勾选需要清理项');
			}
		});
	};
	doClear = (i) => {
		let key = i.type;
		switch (key) {
			case 'cookie':
				Cookie.remove(i.value);
				break;
			case 'sessionStorage':
				sessionStorage.clear();
			case 'localStorage':
				localStorage.clear();
				break;
			default:
				break;
		}
	};
	render() {
		return (
			<div>
				<List renderHeader={() => '清理缓存'}>
					{data.map((i) => (
						<CheckboxItem
							key={i.value}
							onChange={() => {
								data.forEach((element) => {
									if (i.value === element.value) {
										element.Check = !element.Check;
									}
								});
							}}
						>
							{i.label}
						</CheckboxItem>
					))}
				</List>
				<WhiteSpace />
				<div style={{ margin: '15px' }}>
					<Button type="primary" onClick={this.clear}>
						一键清理
					</Button>
				</div>
			</div>
		);
	}
}
