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
            // console.log(params)
            this.props.setTitle(params.name);
            this.setState({ contractUrl: params.url});

            // this.props.setTitle(params.name);
            // var rawLength = params.url.length;  
            // //转换成pdf.js能直接解析的Uint8Array类型,见pdf.js-4068  
            // var array = new Uint8Array(new ArrayBuffer(rawLength));    
            // for(var i = 0; i < rawLength; i++) {  
            //     array[i] = params.url.charCodeAt(i) & 0xff;  
            // }
            // console.log(array);
            // this.setState({ contractUrl: array});
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

