import Vue from 'vue'
import Router from 'vue-router'
import Map from '../components/olmap.vue'
import Login from '../components/login.vue'
import Forbid403 from '../components/403.vue'
Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    },
    {
      path: '/map',
      name: 'Map',
      component: Map
    },
    {
      path: '/403',
      name: '403',
      component: Forbid403
    }
  ]
})