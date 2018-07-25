import React, {
  PureComponent
} from 'react';
import { Route, Switch } from 'react-router-dom';
import Loadable from 'react-loadable';
const Loading = ({ error, pastDelay }) => {
  if (pastDelay) {
    return <div>loading</div>;
  } else if (error) {
    return <div>err</div>;
  }
  return null;
};
function LoadingComponent() {
  return <div>loading</div>;
}
const LoginPage = Loadable({
  loader: () => import('pages/login/login'),
  loading: Loading,
  LoadingComponent,
  delay: 300

});
const RouterPage = Loadable({
  loader: () => import('pages/common/routerPage'),
  loading: Loading,
  LoadingComponent,
  delay: 300
});
export default class Routers extends PureComponent {
  render() {
    return (
      <Switch>
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/:modules/:page" component={RouterPage} />
        <Route exact path="/" component={LoginPage} />
      </Switch>
    );
  }
}
