/*
 * @Author: sunjiankun
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-03-23 11:36:06
 */
import React from 'react';
import style from './index.scss';
import Images from 'assets/image';

export default class Introduce extends React.Component {
	constructor(props) {
		super(props);
	}
	componentWillMount() {}
	render() {
		const introduceArr = [
			{
				image: Images.adorn.intro_ico,
				title: '信息安全',
				subTitle: '数据保密'
			},
			{
				image: Images.adorn.intro_ico2,
				title: '持牌机构',
				subTitle: '放心合规'
			},
			{
				image: Images.adorn.intro_ico3,
				title: '支持还款',
				subTitle: '银行100+'
			}
		];
		return (
			<div className={style.introduce_container}>
				<h3 className={style.intro_tit}>关于还到</h3>
				<ul className={style.intro_content_wrap}>
					{introduceArr.map((item, index) => (
						<li key={index} className={style.intro_content}>
							<img alt="icon" src={item.image} className={style.icon_style} />
							<span className={style.title_style}>{item.title}</span>
							<span className={style.sub_tit_style}>{item.subTitle}</span>
						</li>
					))}
				</ul>
				<div className={style.intro_desc_wrap}>
					<img alt="icon" src={Images.adorn.lock_black} className={style.lock_style} />
					敏感数据加密传输，且资金流转安全可靠
				</div>
			</div>
		);
	}
}
