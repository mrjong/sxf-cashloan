import React from 'react';
import errPage from 'pages/common/err_page';
export default class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			errorInfo: null
		};
	}

	componentDidCatch(error, errorInfo) {
		// Catch errors in any child components and re-renders with an error message
		this.setState({
			error: error,
			errorInfo: errorInfo
		});
		console.log(error, errorInfo);
	}

	render() {
		if (this.state.error) {
			// Fallback UI if an error occurs
			return (
				<div>{React.createElement(errPage)}</div>
				// <div>
				// 	<h2>{'Oh-no! Something went wrong'}</h2>
				// 	<p className="red">{this.state.error && this.state.error.toString()}</p>
				// 	<div>{'Component Stack Error Details: '}</div>
				// 	<p className="red">{this.state.errorInfo.componentStack}</p>
				// </div>
			);
		}
		// component normally just renders children
		return this.props.children;
	}
}
