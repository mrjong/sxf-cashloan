import React, { PureComponent } from 'react';
import styles from '../index.scss';
import headerIgnore from 'utils/headerIgnore'
export default class financial_service_page_sxpay extends PureComponent {
    render() {
        return (
            <iframe
                className={headerIgnore() ? styles.container2 : styles.container}
                src="/disting/#/financial_service_page_sxpay"
                name="financial_service_page_sxpay"
                id="financial_service_page_sxpay"
                width="100%"
                height="100%"
                frameBorder="0"
            />
        )
    }
}
