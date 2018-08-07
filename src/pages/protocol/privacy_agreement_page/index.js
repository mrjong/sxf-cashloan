import React, { PureComponent } from 'react';
import styles from '../index.scss';
import headerIgnore from 'utils/headerIgnore'
export default class privacy_agreement_page extends PureComponent {
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
                className={headerIgnore() ? styles.container2 : styles.container}
                src="/disting/#/privacy_agreement_page"
                name="privacy_agreement_page"
                id="privacy_agreement_page"
                width="100%"
                height="100%"
                frameBorder="0"
            />
        )
    }
}

