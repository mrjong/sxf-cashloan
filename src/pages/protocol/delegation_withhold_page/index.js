import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import IframeProtocol from 'components/IframeProtocol'

export default class delegation_withhold_page extends PureComponent {
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
        console.log(this.state.contractInf)
        return (
            <IframeProtocol
                name='delegation_withhold_page'
                postData={this.state.contractInf}
            />
            // <iframe
            //     className={headerIgnore() ? styles.container2 : styles.container}
            //     src="/disting/#/delegation_withhold_page"
            //     name="delegation_withhold_page"
            //     id="delegation_withhold_page"
            //     onLoad={() => {
            //         window.frames['delegation_withhold_page'].setData(this.state.contractInf);
            //     }}
            //     width="100%"
            //     height="100%"
            //     frameBorder="0"
            // />
        )
    }
}

