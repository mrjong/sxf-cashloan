import React, { PureComponent } from 'react';
import Routers from 'pages/router';
import errPage from 'pages/common/err_page';
import Header from 'components/header';
import Footer from 'components/footer';
import { Toast } from 'antd-mobile'
export default class router_Page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      route: {},
      newTitle: ''
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
          this.setState({
            newTitle: routerList[i].title
          })
          route = routerList[i]
        }
      }
      if (route) {
        let component = await route.component()
        this.setState({
          route: { ...route },
          component: React.createElement(component.default, {
            match, history, params: location.state, toast: Toast, setTitle: (title) => {
              this.setState({
                newTitle: title
              })
            }
          }),
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
    const { component, route, newTitle } = this.state;
    const { headerHide = false, footerHide = true } = route;
    return (
      <div className="application_wrap" style={{ paddingBottom: footerHide ? 'unset' : '1.2rem' }}>
        {headerHide ? null : <Header {...this.props} headerProps={route} newTitle={newTitle} />}
        {component}
        {footerHide ? null : <Footer footerProps={route} />}
      </div>
    );
  }
}
