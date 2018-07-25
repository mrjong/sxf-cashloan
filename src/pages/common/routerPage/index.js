import React, { PureComponent } from 'react';
import Routers from 'pages/router';
import errPage from 'pages/common/err_page';
import Header from 'components/header';
import Footer from 'components/footer';
export default class router_Page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      route: {},
    };
  }
  componentWillReceiveProps(nextProps) {
    this.loadComponent(nextProps);
  }
  componentWillMount() {
    this.loadComponent(this.props);
  }
  loadComponent = async props => {
    const { match, history, location } = props;

    try {
      let route
      let routerList = Routers
      for (let i = 0; i < routerList.length; i++) {
        if (match.url === routerList[i].path) {
          route = routerList[i]
        }
      }
      if (route) {
        let component = await route.component()
        this.setState({
          route: { ...route },
          component: React.createElement(component.default, { match, history, params: location.state, key: new Date().getTime() }),
        })
      } else {
        this.setState({
          title: '错误',
          component: React.createElement(errPage, {
            match, history, params: {
              pageType: '404'
            }
          }),
        })
      }
    } catch (error) {
      this.setState({
        title: '错误',
        component: React.createElement(errPage, {
          match, history, params: {
            pageType: '404'
          }
        }),
      })
    }
  };
  render() {
    const { component, route } = this.state;

    console.log(route, 'route');
    const { headerHide = false, footerHide = true } = route;
    console.log(footerHide, 'footerHide')
    return (
      <div className="application_wrap" style={{ paddingBottom: footerHide ? 'unset' : '1rem' }}>
        {headerHide ? null : <Header {...this.props} headerProps={route} />}
        {component}
        {footerHide ? null : <Footer footerProps={route} />}
      </div>
    );
  }
}
