import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import {Toast} from 'antd-mobile';
import routes from 'pages/common/routerPage';
import {setTitle} from 'utils/SetTitle.js';
import fetch from 'sx-fetch';

@fetch.inject()
export default class Routers extends Component {
  componentDidMount() {

  }

  render() {
    return (
      <Switch style={{height: '100%'}}>
        {routes.map((route, i) => (
          <Route
            key={i}
            exact
            path={route.path}
            render={props => (
              <route.component {...props} title={route.title} toast={Toast}>
                {setTitle(route.title)}
              </route.component>
            )}
          />
        ))}
      </Switch>
    );
  }
}
