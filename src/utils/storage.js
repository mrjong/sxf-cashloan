const { localStorage, sessionStorage } = window;

const local = {
  setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem(key) {
    const value = localStorage.getItem(key);
    return JSON.parse(value);
  },
  clear() {
    localStorage.clear();
  },
  removeItem(key) {
    localStorage.removeItem(key);
  },
  multiGet(keys) {
    const values = {};
    keys.forEach(key => {
      values[key] = this.getItem(key);
    });
    return values;
  },
  multiRemove(keys) {
    keys.forEach(key => this.removeItem(key));
  },
};

const session = {
  setItem(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  getItem(key) {
    const value = sessionStorage.getItem(key);
    return JSON.parse(value);
  },
  clear() {
    sessionStorage.clear();
  },
  removeItem(key) {
    sessionStorage.removeItem(key);
  },
  multiGet(keys) {
    const values = {};
    keys.forEach(key => {
      values[key] = this.getItem(key);
    });
    return values;
  },
  multiRemove(keys) {
    keys.forEach(key => this.removeItem(key));
  },
};
export default {
  local,
  session,
};
