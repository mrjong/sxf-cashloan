import React, { Component } from 'react';
import qs from 'qs';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import Blanks from 'components/Blank';
import { getDeviceType } from 'utils';
import { setH5Channel, getH5Channel } from 'utils/common';

const API = {
	wxAuthcb: '/wx/authcb',
	wxAuth: '/wx/auth',
	isAccessLogin: '/gateway/anydoor' // 是否有登录的权限
};
@fetch.inject()
export default class wx_middle_page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			errorInf: ''
		};
	}

	render() {
		return (<div onClick={()=>{history.go(-2)}}>支付成功</div>);
	}
}
