import React, { PureComponent } from 'react';
import styles from '../index.scss';
export default class shortcut_bind_card_page extends PureComponent {
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
                src="/disting/#/shortcut_bind_card_page"
                name="shortcut_bind_card_page"
                id="shortcut_bind_card_page"
                width="100%"
                height="100%"
                frameBorder="0"
            />
        )
    }
}
