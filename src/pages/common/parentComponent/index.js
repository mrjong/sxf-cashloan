/* eslint-disable */

import React from 'react';
import * as actions from 'reduxs/actions';
import store from 'reduxs/store';
// import {pageView} from "../../../utils/Analytins";

export default class parentComponent extends React.Component {
  constructor(props) {
    super(props);
    if (store.getState().vars.titleHeader !== document.title) {
      store.dispatch(actions.setVars('titleHeader', document.title))
      store.dispatch(actions.setObjs('titleHeaderObj', this.props.title));
    }

  }
}
