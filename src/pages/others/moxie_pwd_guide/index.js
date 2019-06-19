import React from 'react';
import qs from 'qs'
import style from './index.scss';
import operator from './img/operator.png'
import interbank from './img/interbank.png'
import bank_operator from './img/bank_operator.png'
import { setBackGround } from 'utils/background';

@setBackGround('#fff')
export default class moxie_pwd_guide extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: true
    }
  }

  render() {
    const queryData = qs.parse(location.search, { ignoreQueryPrefix: true })
    const type = queryData.moxieType
    return (
      <div className={style.moxie_pwd_guide}>
        {type === 'operator' ? <img src={operator} /> : null}
        {type === 'interbank' ? <img src={interbank} /> : null}
        {type === 'bank_operator' ? <img src={bank_operator} /> : null}
      </div>
    );
  }
}
