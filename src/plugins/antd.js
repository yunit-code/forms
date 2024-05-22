// 按需加载 ant-design-vue
// 手动删除没用用过的组件
import Vue from 'vue';
import 'ant-design-vue/lib/button/style/css';
import 'ant-design-vue/lib/dropdown/style/css';
import 'ant-design-vue/lib/menu/style/css';
import 'ant-design-vue/lib/icon/style/css';
import 'ant-design-vue/lib/date-picker/style/css';
import 'ant-design-vue/lib/radio/style/css';
import 'ant-design-vue/lib/tag/style/css';
import 'ant-design-vue/lib/input/style/css';
import 'ant-design-vue/lib/tooltip/style/css';
import 'ant-design-vue/lib/select/style/css';
import 'ant-design-vue/lib/input-number/style/css';
import 'ant-design-vue/lib/popover/style/css';
import 'ant-design-vue/lib/modal/style/css';
import 'ant-design-vue/lib/tree-select/style/css';
import 'ant-design-vue/lib/tree/style/css';
import {
  Button,
  Dropdown,
  Icon,
  Menu,
  Radio,
  Tag,
  Input,
  Tooltip,
  Select,
  Popover,
  Modal,
  TreeSelect,
  Tree
} from 'ant-design-vue';

/* v1.1.3+ registration methods */
Vue.use(Button);
Vue.use(Dropdown);
Vue.use(Menu);
Vue.use(Icon);
Vue.use(Radio);
Vue.use(Tag);
Vue.use(Input);
Vue.use(Tooltip);
Vue.use(Select);
Vue.use(Popover);
Vue.use(Modal);
Vue.use(TreeSelect);
Vue.use(Tree);
Vue.prototype.$confirm = Modal.confirm;
Vue.prototype.TreeSelect = TreeSelect;