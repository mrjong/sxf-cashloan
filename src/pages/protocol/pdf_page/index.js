import React, { PureComponent } from 'react';
import IframeProtocol from 'components/IframeProtocol'
import { getDeviceType } from 'utils';

export default class pdf_page extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            contractUrl: '',
        };
    }
    componentWillMount(){
        if (getDeviceType() === 'IOS') {
            window.location.replace(params.url)
            // window.location.href='https://www.baidu.com/'
            // window.open('https://www.baidu.com/')
        }
        const params = this.props.history.location.state
        if (params) {
            this.props.setTitle(params.name);
            this.setState({ contractUrl: params.url});
        }
    }
    render() {
        return (
            <IframeProtocol
                name='pdf_page'
                postData={this.state.contractUrl}
            />
        )
    }
}

