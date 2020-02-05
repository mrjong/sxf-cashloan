import React from 'react';

import classNM from './index.scss';

export default class StepTitle extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			activityList: []
		};
	}
	render() {
		const { title, titleSub, stepNum } = this.props;
		return (
			<div className={classNM.stepTitleWrap}>
				<div className={classNM.titleWrap}>
					<div className={classNM.stepNumWrap}>
						<span className={classNM.stepNumBefore} />
						<span className={classNM.stepNum}>{stepNum}</span>
						<span className={classNM.stepNumAfter} />
					</div>
					<span className={classNM.title}>{title}</span>
				</div>
				<p className={classNM.titleSub}>{titleSub}</p>
			</div>
		);
	}
}
