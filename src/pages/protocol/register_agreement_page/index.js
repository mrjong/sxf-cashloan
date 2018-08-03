import React, { PureComponent } from 'react';
import styles from '../index.scss';
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
                className={styles.container}
                src="/disting/#/register_agreement_page"
                name="register_agreement_page"
                id="register_agreement_page"
                onLoad={() => {
                    window.frames['register_agreement_page'].setData({
                        name: '11111111'
                    });
                }}
                width="100%"
                height="100%"
                frameBorder="0"
            />
        )
    }
}

