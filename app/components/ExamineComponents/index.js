import React from 'react';
import style from './index.scss';
import bg from './img/bg.png';
import handle from './img/handle.png';
import jing from './img/jing.png';
import paper from './img/paper.png';
import person from './img/person.png';
import zfx from './img/zfx.png';
import zfx2 from './img/zfx2.png';

export default class ExamineComponents extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className={style.box_container}>
				<div className={style.bgBox}>
					<img className={style.bg} src={bg} />
					<img className={style.paper1} src={paper} />
					<img className={style.paper2} src={paper} />
					<img className={style.person} src={person} />
					<img className={style.handle} src={handle} />
					<img className={style.jing} src={jing} />
					<img className={style.zfx} src={zfx} />
					<img className={style.zfx2} src={zfx2} />
				</div>
			</div>
		);
	}
}
