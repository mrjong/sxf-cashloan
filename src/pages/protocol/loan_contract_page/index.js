import React, { PureComponent } from 'react';
import { store } from 'utils/common';
import styles from '../index.scss';
import headerIgnore from 'utils/headerIgnore'
export default class loan_contract_page extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            contractInf: {},
        };
    }
    componentWillMount() {
        console.log(store.getProtocolFinancialData());
        this.setState({ contractInf: store.getProtocolFinancialData() });
    }
    componentWillUnmount() {
        store.removeProtocolFinancialData();
    }

    render() {
        return (
            <iframe
                className={headerIgnore() ? styles.container2 : styles.container}
                src="/disting/#/loan_contract_page"
                name="loan_contract_page"
                id="loan_contract_page"
                onLoad={() => {
                    window.frames['loan_contract_page'].setData(this.state.contractInf);
                }}
                width="100%"
                height="100%"
                frameBorder="0"
            />
        )
    }
}

