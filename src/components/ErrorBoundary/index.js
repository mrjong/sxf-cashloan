import React from 'react';
import ErrPage from 'pages/common/err_page';
import { buriedPointEvent } from 'utils/analytins';
import { bugLog } from 'utils/analytinsType';
import Raven from 'raven-js'

export default class ErrorBoundary extends React.Component {
	// constructor(props) {
	// 	super(props);
	// 	this.state = {
	// 		error: null,
	// 		errorInfo: null
	// 	};
	// }

	// componentDidCatch(error, errorInfo) {
	// 	this.setState({
	// 		error: error,
	// 		errorInfo: errorInfo
	// 	});
	// 	// 此处埋点上报页面、组件渲染发生的错误
	// 	// console.log(errorInfo.componentStack)
	// 	buriedPointEvent(bugLog.pageErrorLog, {
	// 		DC_errorComponentStack: errorInfo.componentStack,
	// 		DC_errorTitle: document.title,
	// 		DC_errorTime: new Date(),
	// 		DC_errorUrl: document.URL,
	// 		DC_errorInfo: error.toString()
	// 	})
	// }

	// render() {
	// 	if (this.state.error) {
	// 		return <ErrPage />
	// 	}
	// 	return this.props.children;
	// }
	constructor(props) {
        super(props);
        this.state = { error: null };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error });
        Raven.captureException(error, { extra: errorInfo });
    }

    render() {
        // if (this.state.error) {
        //     //render fallback UI
        //     return (
        //         <div
        //         className="snap"
        //         onClick={() => Raven.lastEventId() && Raven.showReportDialog()}>
        //             {/* <img src={oops} /> */}
        //             <p>We're sorry — something's gone wrong.</p>
        //             <p>Our team has been notified, but click here fill out a report.</p>
        //         </div>
        //     );
        // } else {
        //     //when there's not an error, render children untouched
        //     return this.props.children;
		// }
		return this.props.children;
    }
}
