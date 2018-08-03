import React, { PureComponent } from 'react';
import styles from '../index.scss';
export default class loan_contract_page extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentWillMount() {
    }

    render() {
        return (
            <iframe
                className={styles.container}
                src="/disting/#/loan_contract_page"
                name="loan_contract_page"
                id="loan_contract_page"
                // onLoad={() => {
                //     window.frames['loan_contract_page'].setData({
                //         name: '11111111'
                //     });
                // }}
                width="100%"
                height="100%"
                frameBorder="0"
            />
        )
    }
}

