/*eslint-disable*/
import React from 'react';
import Loadable from 'react-loadable';

import Routes from '../../router';
// import Loadings from './component/loading'
// import ErrorPages from './component/ErrorPage'

const Loading = ({error, pastDelay}) => {
  if (pastDelay) {
    return <div>loading</div>;
  } else if (error) {
    return <div>err</div>;
  }
  return null;
};
Routes.forEach(value => {
  value.component = Loadable({
    loader: value.component,
    loading: Loading,
    delay: 3000,
  });
});
export default Routes;
