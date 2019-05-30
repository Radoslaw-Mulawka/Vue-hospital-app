import Login from './components/Login.vue';
import Main from './components/Main.vue';
// import Menu from './components/Menu/Menu.vue';
// import Table from './components/Table/Table.vue';
import Recovery from './components/Recovery.vue';
import conf from './components/Table/menu-conf.js';
import jwtDecode from 'jwt-decode';
// import Calendar from './components/Calendar.vue';
// import MiniCalendar from './components/MiniCalendar.vue';
// import NourishedPlanManagement from './components/Nourishment/NourishedPlanManagement.vue';


const Table = resolve => {
  require.ensure(['./components/Table/Table.vue'],()=> {
 resolve(require('./components/Table/Table.vue'));
  }, 'Table');
};
const NourishedPlanManagement = resolve => {
  require.ensure(['./components/Nourishment/NourishedPlanManagement.vue'],()=> {
 resolve(require('./components/Nourishment/NourishedPlanManagement.vue'));
  }, 'NourishedPlanManagement');
};
const Calendar = resolve => {
  require.ensure(['./components/Calendar.vue'],()=> {
 resolve(require('./components/Calendar.vue'));
  }, 'Calendar');
};
const Menu = resolve => {
  require.ensure(['./components/Menu/Menu.vue'],()=> {
  resolve(require('./components/Menu/Menu.vue'));
  }, 'Menu');
};
const MiniCalendar = resolve => {
  require.ensure(['./components/MiniCalendar.vue'],()=> {
  resolve(require('./components/MiniCalendar.vue'));
  }, 'MiniCalendar');
};

function checkRole(role, to, from, next) {
  const token = localStorage.getItem('token');
  const decoded = token !== null ? jwtDecode(token) : null;
  if (decoded.roles.includes(role)) {
    next();
  } else {
    next({ path: from.path });
  }
}

export const routes = [
  {
    path: '/',
    component: Main,
    children: [
      {
        path: '',
        component: Calendar,
        props: true,
        beforeEnter: (to, from, next) => {
          checkRole('ROLE_AS_NOURISHED_PLAN_LIST_SHOW', to, from, next);
        },
      },
      {
        path: 'diets',
        component: Table,
        props: { conf: conf },
        beforeEnter: (to, from, next) => {
          checkRole('ROLE_AS_DIET_MENU_LIST_SHOW', to, from, next);
        },
      },
      {
        path: 'menus/show/:id',
        component: Menu,
        beforeEnter: (to, from, next) => {
          checkRole('ROLE_AS_DIET_MENU_LIST_SHOW', to, from, next);
        },
      },
      {
        path: 'plans',
        component: MiniCalendar,
        props: true,
        beforeEnter: (to, from, next) => {
          checkRole('ROLE_AS_NOURISHED_PLAN_LIST_SHOW', to, from, next);
        },
        children: [
          {
            path: 'show/:id',
            component: NourishedPlanManagement,
            props: { default: true },
          },
        ],
      },
    ],
  },

  { path: '/login', component: Login },
  { path: '/login/recovery-step-1', component: Recovery },
  { path: '/login/recovery-step-2/:user_uuid/token/:user_token', component: Recovery },
];
