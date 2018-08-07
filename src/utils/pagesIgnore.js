export default (pathname = window.location.pathname) => {
  if (pathname) {
    let pageList = ['/protocol/'];
    return pageList.some(item => item && pathname.indexOf(item) > -1);
  }
};
