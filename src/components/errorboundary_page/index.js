import React from 'react';
import ErrPage from 'pages/common/err_page';
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
		console.log(error, errorInfo); 
		// console.log(this.state.errorInfo.componentStack)
	}

	render() {
		if (this.state.error) {
			return <ErrPage />
		}
		return this.props.children;
	}
}
