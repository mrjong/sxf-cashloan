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
		const { className, style, title, titleSub, stepNum } = this.props;
		return (
			<div style={style} className={[classNM.stepTitleWrap, className].join(' ')}>
				<div className={classNM.titleWrap}>
					{stepNum ? (
						<div className={classNM.stepNumWrap}>
							<span className={classNM.stepNumBefore} />
							<span className={classNM.stepNum}>{stepNum}</span>
							<span className={classNM.stepNumAfter} />
						</div>
					) : null}
					<span className={classNM.title}>{title}</span>
				</div>
				<p className={classNM.titleSub}>{titleSub}</p>
			</div>
		);
	}
}
