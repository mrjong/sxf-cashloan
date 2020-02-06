import React from 'react';

import classNM from './index.scss';

export default class StepList extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			activityList: []
		};
	}
	render() {
		const { stepList } = this.props;
		return (
			<div className={classNM.stepListWrap}>
				{stepList.map((item, index) => (
					<div className={classNM.stepListItem} key={index}>
						<div className={classNM.stepNumWrap}>
							<div className={classNM.stepNumBefore} />
							<div className={classNM.stepNum}>{item.stepNum}</div>
							<div className={classNM.stepNumAfter} />
							<div className={classNM.stepNumTop} />
							{index === stepList.length - 1 ? null : <div className={classNM.stepNumBottom} />}
						</div>
						<div className={classNM.title}>{item.title}</div>
					</div>
				))}
			</div>
		);
	}
}
