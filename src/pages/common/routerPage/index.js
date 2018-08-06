import React, { PureComponent } from 'react';
import Routers from 'pages/router';
import errPage from 'pages/common/err_page';
import Header from 'components/header';
import Footer from 'components/footer';
import { Toast } from 'antd-mobile'
import Cookie from 'js-cookie';
import pagesIgnore from 'utils/pagesIgnore';
import TFDInit from 'utils/getTongFuDun';
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
    const token = Cookie.get('fin-v-card-token');
    if (!pagesIgnore(props) && !token) {
      sessionStorage.clear()
      Toast.info('请先登录')
      setTimeout(() => {
        window.location.pathname = '/login'
      }, 3000);
    }
    const { match, history, location } = props;

    try {
      let route
      console.log(Routers)
      // 通付盾 获取设备指纹
      TFDInit();
      for (let i = 0; i < Routers.length; i++) {
        if (match.url === Routers[i].path) {
          this.setState({
            newTitle: Routers[i].title
          })
          route = Routers[i]
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
          newTitle: '重新加载',
          component: React.createElement(errPage, {
            match, history, params: {
              pageType: '404'
            }
          }),
        })
      }
    } catch (error) {
      console.log(error);
      this.setState({
        newTitle: '重新加载',
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
      <div className="application_wrap" style={{ paddingBottom: footerHide ? 'unset' : '1rem' }}>
        {headerHide ? null : <Header {...this.props} headerProps={route} newTitle={newTitle} />}
        {component}
        {footerHide ? null : <Footer footerProps={route} />}
      </div>
    );
  }
}
