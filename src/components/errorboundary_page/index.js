import React from 'react';
import ErrPage from 'pages/common/err_page';
import { buriedPointEvent } from 'utils/Analytins';
import { bug_log } from 'utils/AnalytinsType';

export default class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			errorInfo: null
		};
	}

	componentDidCatch(error, errorInfo) {
		this.setState({
			error: error,
			errorInfo: errorInfo
		});
		// 此处埋点上报页面、组件层级发生的错误
		// console.log(errorInfo.componentStack)
		buriedPointEvent(bug_log.api_error_log, {
			DC_errorComponentStack: errorInfo.componentStack,
			DC_errorTitle: document.title,
			DC_errorTime: new Date(),
			DC_errorUrl: document.URL,
			DC_errorInfo: error.toString()
		})
	}

	render() {
		if (this.state.error) {
			return <ErrPage />
		}
		return this.props.children;
	}
}
