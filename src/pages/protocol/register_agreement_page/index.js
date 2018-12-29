import React, { PureComponent } from 'react';
import styles from '../index.scss';
import { headerIgnore } from 'utils'

export default class register_agreement_page extends PureComponent {
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
                src="/disting/#/register_agreement_page"
                name="register_agreement_page"
                id="register_agreement_page"
                width="100%"
                height="100%"
                frameBorder="0"
            />
        )
    }
}

