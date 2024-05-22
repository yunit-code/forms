import Vue from 'vue'
import './core/regModule';
import config from '../public/static/config.json';
//引入图标
import '@/icons' // icon
//按需的ant组件注册，没有用到antd最好删除
import "@/plugins/antd"


const requireComponent = require.context(
  // 其组件目录的相对路径
  './components',
  // 是否查询其子目录
  false,
  // 匹配组件文件名的正则表达式
  /[A-Z]\w+\.(vue|js)$/
);

requireComponent.keys().forEach(fileName => {
  // 获取组件配置
  const componentConfig = requireComponent(fileName)

  // 获取组件的 PascalCase 命名
  const componentName = window._.upperFirst(
    window._.camelCase(
      // 获取和目录深度无关的文件名
      fileName
        .split('/')
        .pop()
        .replace(/\.\w+$/, '')
    )
  )
  // console.log("🚀 ~ file: main.js ~ line 33 ~ requireComponent.keys ~ componentName", componentName)
  // 全局注册组件
  Vue.component(
    componentName+"@"+config.className+"-" +config.version,
    // 如果这个组件选项是通过 `export default` 导出的，
    // 那么就会优先使用 `.default`，
    // 否则回退到使用模块的根。
    componentConfig.default || componentConfig
  )
})
Vue.prototype.IDM = window.IDM;
Vue.config.productionTip = false