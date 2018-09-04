export default (pathname = window.location.pathname) => {
  if (pathname) {
    let pageList = ['/protocol/', '/common/auth_page', '/landing/landing_page'];
    return pageList.some(item => item && pathname.indexOf(item) > -1);
  }
};
