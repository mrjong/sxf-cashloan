import React, { Component } from 'react';
import { store } from 'utils/common';

export default class middle_page extends Component {
  componentWillMount() {
    const moxieBackUrl = store.getMoxieBackUrl();
    if (moxieBackUrl) {
      store.removeMoxieBackUrl();
      window.location.href = moxieBackUrl;
    } else {
      this.props.push('/')
    }
  }
  render() {
    return null;
  }
}
