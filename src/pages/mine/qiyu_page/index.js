import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import IframeProtocol from 'components/IframeProtocol';

const API = {
	queryQYOpenId: '/my/queryUsrQYOpenId' // 七鱼用户标识
};

@fetch.inject()
export default class qiyu_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			postData: null // 七鱼的openId
		};
	}

	componentWillMount() {
		this.props.$fetch.get(API.queryQYOpenId).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				this.setState({
					postData: result.data
				});
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	}

	render() {
		return <IframeProtocol postData={this.state.postData} name="qiyu_page" />;
	}
}
