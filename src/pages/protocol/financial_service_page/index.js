import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import IframeProtocol from 'components/IframeProtocol'

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
      <IframeProtocol 
        name='financial_service_page'
        postData={this.state.contractInf}
      />
      // <iframe
      //   className={headerIgnore() ? styles.container2 : styles.container}
      //   src="/disting/#/financial_service_page"
      //   name="financial_service_page"
      //   id="financial_service_page"
      //   width="100%"
      //   height="100%"
      //   frameBorder="0"
      //   onLoad={() => {
      //     window.frames.financial_service_page.setData(this.state.contractInf);
      //   }}
      // />
    );
  }
}
