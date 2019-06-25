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
var child_div3 = '';
var chars = ['3', '5', '7', '8'];
var jiangpinList = [
	'20元减息券',
	'杜蕾斯1盒',
	'100元减息券',
	'3期免息券',
	'首期免息券',
	'50元减息券',
	'12期免息券'
];
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
			this.refs.Mar.scrollTop = tmpH;
			setTimeout(this.start, scrolltime);
		} else {
			tmpH = 0;
			Mar2.innerHTML = this.getNode();
			Mar.appendChild(child_div2[0]);
			if (child_div.length > 2) {
				Mar.removeChild(child_div[0]);
			}
			this.refs.Mar.scrollTop = 0;
			setTimeout(this.start, stoptime);
		}
	};
	// 获取手机随机前一位
	generateMixed = (n) => {
		var res = '';
		for (var i = 0; i < n; i++) {
			var id = Math.ceil(Math.random() * 3);
			res = chars[id];
		}
		return res;
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
	// 拼凑号码+文字
	getNode = () => {
		let telNo = `<div id="demo" class="new_tels" style="height:.6rem;line-height:.6rem">恭喜 1${this.generateMixed(
			1
		)}${Math.ceil(Math.random() * 9)}****${Math.ceil(Math.random() * 9)}${Math.ceil(
			Math.random() * 9
		)}${Math.ceil(Math.random() * 9)}${Math.ceil(Math.random() * 9)}获得 <span>${this.getJiangpin(
			1
		)}</span></div>`;
		return telNo;
	};
	render() {
		return (
			<div>
				<div id="Marquee2" style={{ display: 'none' }}>
					<div
						className="new_tels"
						style={{
							height: '.6rem',
							lineHeight: '.6rem'
						}}
					>
						恭喜136****7912获得<span>10元减息券</span>
					</div>
				</div>
				<div ref="Mar" id="Marquee" className={style.message}>
					<div
						className="new_tels"
						style={{
							height: '.6rem',
							lineHeight: '.6rem'
						}}
					>
						恭喜 1{this.generateMixed(1)}
						{Math.ceil(Math.random() * 9)}****{Math.ceil(Math.random() * 9)}
						{Math.ceil(Math.random() * 9)}
						{Math.ceil(Math.random() * 9)}
						{Math.ceil(Math.random() * 9)}获得 <span>{this.getJiangpin(1)}</span>
					</div>
				</div>
			</div>
		);
	}
}
