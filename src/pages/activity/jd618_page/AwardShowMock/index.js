import React, { Component } from 'react';
import style from './index.scss';
var picH = 35; //移动高度
var scrollstep = 3; //移动步幅,越大越快
var scrolltime = 50; //移动频度(毫秒)越大越慢
var stoptime = 3000; //间断时间(毫秒)
var tmpH = 0;
var Mar = '';
var Mar2 = '';
var child_div = '';
var child_div2 = '';
var jiangpinList = ['100元现金', '100元现金', '100元现金', '100元现金', '100元现金'];
var nameList = ['陈**', '唐**', '赵**', '李**', '吴**', '刘**', '王**', '柯**'];
export default class AwardShow extends Component {
	componentDidMount() {
		Mar = document.getElementById('Marquee');
		Mar2 = document.getElementById('Marquee2');
		child_div2 = Mar2.getElementsByClassName('new_tels');
		child_div = Mar.getElementsByClassName('new_tels');
		setTimeout(this.start, stoptime);
	}
	start = () => {
		if (tmpH < picH) {
			tmpH += scrollstep;
			if (tmpH > picH) tmpH = picH;
			this.Mar.scrollTop = tmpH;
			setTimeout(this.start, scrolltime);
		} else {
			tmpH = 0;
			Mar2.innerHTML = this.getNode();
			Mar.appendChild(child_div2[0]);
			if (child_div.length > 2) {
				Mar.removeChild(child_div[0]);
			}
			this.Mar.scrollTop = 0;
			setTimeout(this.start, stoptime);
		}
	};
	// 获取随机奖品
	getJiangpin = (n) => {
		var res = '';
		for (var i = 0; i < n; i++) {
			var id = Math.floor(Math.random() * jiangpinList.length);
			res = jiangpinList[id];
		}
		return res;
	};
	// 获取随机人民
	getNameList = (n) => {
		var res = '';
		for (var i = 0; i < n; i++) {
			var id = Math.floor(Math.random() * nameList.length);
			res = nameList[id];
		}
		return res;
	};
	// 拼凑号码+文字
	getNode = () => {
		let telNo = `<div id="demo" class="new_tels" style="height:.5rem;line-height:.5rem">${this.getNameList(
			1
		)} 获得 <span>${this.getJiangpin(1)}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${this.getNameList(
			4
		)} 获得 <span>${this.getJiangpin(4)}</span></div>`;
		return telNo;
	};
	render() {
		return (
			<div>
				<div id="Marquee2" style={{ display: 'none' }}>
					<div
						className="new_tels"
						style={{
							height: '.5rem',
							lineHeight: '.5rem'
						}}
					>
						{/* 恭喜136****7912获得<span>10元减息券</span> */}
					</div>
				</div>
				<div
					ref={(c) => {
						this.Mar = c;
					}}
					id="Marquee"
					className={style.message}
				>
					<div
						className="new_tels"
						style={{
							height: '.5rem',
							lineHeight: '.5rem'
						}}
					>
						<div>
							<span>
								{this.getNameList(1)}
								<span> 获得 {this.getJiangpin(1)}</span>
							</span>
							&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							<span>
								{this.getNameList(4)}
								<span> 获得 {this.getJiangpin(4)}</span>
							</span>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
