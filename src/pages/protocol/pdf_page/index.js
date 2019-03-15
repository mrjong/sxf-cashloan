import React, { PureComponent } from 'react';
import IframeProtocol from 'components/IframeProtocol'

export default class pdf_page extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            contractUrl: '',
        };
    }
    componentWillMount(){
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

