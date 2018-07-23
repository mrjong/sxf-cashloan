/* eslint-disable */

import React from 'react';
import {connect} from "react-redux"
import propTypes from 'prop-types';
import ReactLoading from 'components/loading';
import fetchInit from 'utils/FetchInit';
import Header from 'components/header';

import styles from './style.scss';

window.isOk = false;

@connect(
  state => {
    return {
      showLoading: state.vars.showLoading,
      titleHeader: state.vars.titleHeader
    }
  },
  dispatch => {
    return {}
  }
)
export default class Application extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showLoading: false,
      isBottom: true,
    };
  }

  static prototyp = {
    init: propTypes.func,
    titleHeader: propTypes.string,
  };
  static defaultProps = {
    init: () => {
    },
    titleHeader: '',
  };

  componentWillMount() {
    fetchInit(this);
  }

  render() {
    let {showLoading} = this.state;
    return (
      <div style={{paddingBottom: '1rem'}}>
        {
          <div>
            <Header title={this.props.titleHeader}/>
            {this.props.children}
            {showLoading === 'true' && <ReactLoading/>}
          </div>
        }
      </div>
    );
  }
}
