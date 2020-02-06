/*
 * @Author: shawn
 * @LastEditTime : 2020-02-06 11:39:26
 */
import React from 'react';
import classNM from './index.scss';

export default class Welfare extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			welfareList: []
		};
	}
	goActivity = (item) => {
		if (item.link) {
			window.location.href = encodeURI(item.link);
		}
	};

	render() {
		const { welfareList } = this.props;
		return welfareList && welfareList.length ? (
			<div className={classNM.welfareWrap}>
				<p className={classNM.welfareTitle}>福利专区</p>
				<div className={classNM.welfareBox}>
					{welfareList.map((item, index) => (
						<div
							key={index}
							className={classNM.welfareItem}
							onClick={() => {
								this.goActivity(item);
							}}
						>
							{item.img ? <img src={item.img} className={classNM.welfareImg} /> : null}
							<div className={classNM.welfareNameWrap}>
								<p className={classNM.welfareName}>{item.name}</p>
								<p className={classNM.welfareNameSub}>{item.cornerContent}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		) : null;
	}
}
