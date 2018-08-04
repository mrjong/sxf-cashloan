import React, { PureComponent } from 'react';
import { store } from 'utils/common';
import styles from '../index.scss';
const API = {
  FUNACIAL_SERVIE_PROTOCOL: '/bill/qryContractInfoExtend',
}
export default class financial_service_page extends PureComponent {
  componentWillMount() {
    this.getServiceAgreement();
  }

  getServiceAgreement = () => {
    const params = {
      prdId: this.props.LenderConfirm.prodId,
      wtdwTyp: '0',
      billPrcpAmt: this.props.LenderConfirm.ordAmt
    };
    this.props.$fetch.post(API.FUNACIAL_SERVIE_PROTOCOL, params).then(res => {
      // let object = {
      //   manageFee: '111111111',
      //   idDtlAddr: 'hahsahsa身份证地址',
      //   manageFeeYearRate: "122121212112212年费%",
      //   serveFee: '服务费222222222222',
      //   usrDtlAddr: 'hahsahsa居住地址',
      //   idNoHid: "130127********0010",
      //   mblNoHid: "183****0263",
      //   serveFeechina: "零元整",
      //   manageFeeChina: "零元整",
      //   nameHid: "**栋",
      //   serveFeeYearRate: "%"
      // }
      console.log(res, 'res');
      if (res.msgCode === 'PTM0000') {
        const str = this.getFormatStr(agreement3, res.data)
        this.setState({
          str,
        });
      }
    });
  };

  getFormatStr(str, data) {
    return str.replace(/\{\{([0-9A-Za-z-_]*)\}}/g, ($1, $2) => {
      if (data[$2] && data[$2] !== null) {
        return data[$2];
      }
      return '';
    });
  }

  render() {
    return (
      <iframe
        title="financial_service_page"
        className={styles.container}
        src="/disting/#/financial_service_page"
        name="financial_service_page"
        id="financial_service_page"
        width="100%"
        height="100%"
        frameBorder="0"
        onLoad={() => {
          window.frames.financial_service_page.setData(store.getProtocolFinancialData());
        }}
      />
    );
  }
}
