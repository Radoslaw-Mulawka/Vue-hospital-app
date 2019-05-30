import Vue from 'vue';
import App from './App.vue';
import 'jquery';
import 'popper.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'vuetify/dist/vuetify.min.css';
import VueProgressBar from 'vue-progressbar';
import VueRouter from 'vue-router';
import { routes } from './router.js';

import axios from 'axios';

import wysiwyg from 'vue-wysiwyg';
import jwtDecode from 'jwt-decode';
import Vuetify from 'vuetify';
import './css/app.scss';

// AXIOS CONFIGURATION
export const baseUrl = process.env.VUE_APP_ROOT_API_BASEURL;

const axios2 = axios.create({
  baseURL: baseUrl,
});

axios2.interceptors.request.use(
  function(request) {
    if (request.url !== `/api/login_check` && !request.url.includes('recovery_password')) {
      request.headers['Authorization'] = `Bearer ${localStorage.getItem(
        'token'
      )}`;
    }
    return request;
  },
  function(error) {
    return Promise.reject(error);
  }
);

axios2.interceptors.response.use(
  function(response) {
    return response;
  },
  function(error) {
    if (
      error.response &&
      error.response.status === 401 &&
      error.config.url !== `${error.response.config.baseURL}/api/login_check` &&
      !error.config.url.includes('recovery_password')
    ) {
      localStorage.removeItem('token');
      window.location.reload();
      return Promise.reject(error);
    }
    EventBus.$emit('triggerAlert', {
      message: error.response.data,
      type: 'responseError',
    });
    return Promise.reject(error);
  }
);
// END AXIOS CONFIGURATION

Vue.use(Vuetify);
Vue.use(VueRouter);
Vue.use(wysiwyg, {});
Vue.use(VueProgressBar, {
  color: '#00baff',
  failedColor: 'red',
  height: '2px',
});

const router = new VueRouter({
  routes,
  mode: 'history',
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const decoded = token !== null ? jwtDecode(token) : null;
  if (to.path.includes('/login')) { // to.path === '/login' || to.path === '/login/recovery-step-1' || to.path === '/login/recovery-step-2'
    if (token) {
      router.push(from.path);
    } else {
      next();
    }
  } else {
    if (token && decoded.roles.includes('ROLE_AS_ACCESS')) {
      next();
    } else {
      router.push('login');
    }
  }
});

Vue.prototype.$http = axios2;
Vue.config.productionTip = false;

export const EventBus = new Vue();

new Vue({
  router: router,
  render: h => h(App),
}).$mount('#app');
