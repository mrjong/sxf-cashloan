import React, { PureComponent } from 'react';
export default class err_page extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentWillMount() {
        console.log(this.props)
    }
    render() {
        return (
            <div>
                错误页面88
      </div>
        );
    }
}