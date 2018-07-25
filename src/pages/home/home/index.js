import sng4 from 'assets/images/carousel/banner.png';
import React, { PureComponent } from 'react';
import Carousels from 'components/carousel';
import InfoCard from '../components/info_card/index.js';

import style from './style.scss';

export default class HomePage extends PureComponent {
  constructor(props) {
    super(props);
  }

  handleClickBack = () => {
    console.log('代还');
  };

  render() {
    return (
      <div className={style.home_page}>
        <Carousels data={[{ src: sng4, url: '' }, { src: sng4, url: '' }, { src: sng4, url: '' }]} />
        <InfoCard onClick={this.handleClickBack} />
        <div className={style.tip_bottom}>怕逾期，用还到</div>
      </div>
    );
  }
}
