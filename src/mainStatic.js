import Vue from 'vue'
import './core/regModule';
import config from '../public/static/config.json';
//引入图标
import '@/icons' // icon
//按需的ant组件注册，没有用到antd最好删除
import "@/plugins/antd"

config && config.module.forEach(item => {
  const _cp = () => import(/* webpackChunkName: "[request]" */ `./components/${item.className}.vue`)
  Vue.component(item.className+"@"+config.className+"-" +config.version, _cp)
})

Vue.prototype.IDM = window.IDM;
Vue.config.productionTip = false
