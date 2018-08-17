import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import styles from '../index.scss';
import headerIgnore from 'utils/headerIgnore'
const API = {
  FUNACIAL_SERVIE_PROTOCOL: '/bill/qryContractInfoExtend',
}
export default class financial_service_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      contractInf: {},
    }
  }
  componentWillMount() {
    this.setState({ contractInf: store.getProtocolFinancialData() });
  }
  componentWillUnmount() {
    store.removeProtocolFinancialData();
}

  render() {
    return (
      <iframe
        title="financial_service_page"
        className={headerIgnore() ? styles.container2 : styles.container}
        src="/disting/#/financial_service_page"
        name="financial_service_page"
        id="financial_service_page"
        width="100%"
        height="100%"
        frameBorder="0"
        onLoad={() => {
          window.frames.financial_service_page.setData(this.state.contractInf);
        }}
      />
    );
  }
}
