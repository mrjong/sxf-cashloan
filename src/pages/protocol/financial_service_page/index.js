import React, { PureComponent } from 'react';
import styles from '../index.scss';
export default class financial_service_page extends PureComponent {
    render() {
        return (
            <iframe
                className={styles.container}
                src="/disting/#/financial_service_page"
                name="financial_service_page"
                id="financial_service_page"
                width="100%"
                height="100%"
                frameBorder="0"
            />
        )
    }
}

