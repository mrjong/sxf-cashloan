import React from 'react'


  return class extends React.Component {
    componentDidMount() {
      this.originBodyColor = document.body.style.background
      document.body.style.background = background
    }
    componentWillUnmount() {
      document.body.style.background = this.originBodyColor
    }
    render() {
      return <WrappedComponent {...this.props} />
    }
  }
