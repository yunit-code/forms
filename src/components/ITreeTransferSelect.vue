<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div
    idm-ctrl="idm_module"
    :id="moduleObject.id"
    :idm-ctrl-id="moduleObject.id"
  >
    <!--
      组件内部容器
      增加class="drag_container" 必选
      idm-ctrl-id：组件的id，这个必须不能为空
      idm-container-index  组件的内部容器索引，不重复唯一且不变，必选
    -->
    <div
      class="forms-common-container"
      v-show="propData.defaultStatus != 'hidden'"
      :style="getStyle('root')"
    >
      <div
        class="forms-input-container"
        :class="`layout-${propData.labelLayout || 'horizontal'}`"
      >
        <div
          class="fic-label-box"
          :style="getStyle('label')"
          v-if="propData.labelDisplay || propData.labelDisplay == undefined"
        >
          <span
            class="required"
            v-if="propData.required && propData.defaultStatus != 'readonly'"
            >*
          </span>
          <span class="label-content">{{
            IDM.env_dev ? propData.label : "树选择"
          }}</span>
        </div>
        <div
          class="fic-input-box"
          :style="getStyle('content')"
        >
          <div
            :ref="'itreetransferselect' + moduleObject.id"
            :class="{ 'error-state': errorMessage }"
            class="fic-treetransferselect-box"
          >
            <a-popover
              v-if="propData.defaultStatus != 'disabled'&&propData.defaultStatus != 'readonly'"
              trigger="click"
              v-model="popoverVisible"
              :overlayClassName="'fic_common_popover_userselect'"
            >
              <template slot="content">
                <div
                  class="fic_common_popover_content fic_common_popover_userselect_panel"
                  :style="{'width':propData.popoverWidth}"
                  :class="`popover_` + moduleObject.id"
                >
                  <div>
                    <a-tree
                      checkable
                      :selectable="false"
                      v-model="selectedListKey"
                      :replaceFields="{
                        children:propData.replaceFields_children||'children', 
                        title:propData.replaceFields_title||'title', 
                        key:propData.replaceFields_key||'key', 
                        value: propData.replaceFields_value||'value' 
                      }"
                      :selectedKeys.sync="selectedListKey"
                      :tree-data="optionList"
                      :treeDataSimpleMode="propData.optionType=='static'||propData.openSyncOption?true:(propData.treeDataSimpleMode||false)"
                      @select="onUserDeptSelect($event)"
                      @check="
                        (checkedKeys, e) =>
                          onUserDeptCheck(checkedKeys, e)
                      "
                      :load-data="loadData"
                      :showLine="true"
                    >
                      <a-icon slot="switcherIcon" type="down" />
                    </a-tree>
                  </div>
                  <div>
                    <div class="right-selected-box">
                      <draggable
                        tag="ul" 
                        class="control-center-userdept-select-group"
                        chosen-class="control-center-panel-select-ghost"
                        force-fallback="true" 
                        animation="300" 
                        v-model="selectedList"
                        group="userdeptgroup" 
                        @start="userDeptSelectDrag = true"
                        @end="
                          userDeptSelectDrag = false;
                          changePanelSelectOrder();
                        ">
                        <transition-group
                          type="transition"
                          :name="!userDeptSelectDrag ? 'flip-list' : null"
                        >
                          <li
                            class="control-center-userdept-select-group-item"
                            v-for="(element, eindex) in selectedList"
                            :title="
                              element[
                                propData.replaceFields_showtitle||'showtitle'
                              ]
                            "
                            :key="
                              element[
                                propData.replaceFields_value||'value'
                              ]
                            "
                          >
                            <a-tooltip :title="propData.showTitleTooltip?element[
                                propData.replaceFields_showtitle||'showtitle'
                              ]:null">
                              {{
                              element[
                                propData.replaceFields_showtitle||'showtitle'
                              ]
                            }}
                            </a-tooltip>
                            <a-icon
                              type="close"
                              @click="panelItemClose(element, eindex)"
                              class="control-center-userdept-select-group-close"
                            />
                          </li>
                        </transition-group>
                      </draggable>
                    </div>
                    <span class="footer-check-number">
                      <span>已选 {{ selectedList.length }} 项</span>
                      <div>
                        <a href="javascript:;" @click="clearUserDeptCheck()"
                          >清空</a
                        >&nbsp;&nbsp;
                        <a
                          href="javascript:;"
                          @click="popoverVisible=false
                          "
                          >关闭</a
                        >
                      </div>
                    </span>
                  </div>
                </div>
              </template>
              <a-button type="link" style="padding: 0px 10px"> 选择 </a-button>
            </a-popover>
            <a-button
              v-if="propData.defaultStatus == 'disabled'||propData.defaultStatus == 'readonly'"
              disabled
              type="link"
              style="padding: 0px 10px"
            >
              选择
            </a-button>
            <a-button
              :disabled="propData.defaultStatus == 'disabled'||propData.defaultStatus == 'readonly'"
              v-if="thisValue.length > 0"
              @click="clearUserDeptCheck"
              type="link"
              style="padding: 0px 10px"
            >
              清空
            </a-button>
            <div>
              <template v-if="propData.multipleSelect">
                <a-tag
                  v-for="(item, index) in selectedList"
                  :key="item[
                                propData.replaceFields_value||'value'
                              ]" @close="panelItemClose(item, index)" :closable="propData.defaultStatus != 'disabled'&&propData.defaultStatus != 'readonly'">
                    <a-tooltip :title="propData.showTitleTooltip?item[
                        propData.replaceFields_showtitle||'showtitle'
                      ]:null">
                      {{
                      item[
                        propData.replaceFields_showtitle||'showtitle'
                      ]&&item[
                        propData.replaceFields_showtitle||'showtitle'
                      ].length>(propData.showTitleMaxLength||10)?item[
                        propData.replaceFields_showtitle||'showtitle'
                      ].substring(0,propData.showTitleMaxLength||10)+'...':item[
                        propData.replaceFields_showtitle||'showtitle'
                      ]
                    }}
                    </a-tooltip>
                </a-tag>
              </template>
              <template v-else-if="thisValue">
                <a-tag @close="thisValue={};selectedListKey=[];selectedList=[]" :closable="propData.defaultStatus != 'disabled'&&propData.defaultStatus != 'readonly'">
                    <a-tooltip :title="propData.showTitleTooltip?thisValue[
                        propData.replaceFields_showtitle||'showtitle'
                      ]:null">
                      {{
                      thisValue[
                        propData.replaceFields_showtitle||'showtitle'
                      ]&&thisValue[
                        propData.replaceFields_showtitle||'showtitle'
                      ].length>(propData.showTitleMaxLength||10)?thisValue[
                        propData.replaceFields_showtitle||'showtitle'
                      ].substring(0,propData.showTitleMaxLength||10)+'...':thisValue[
                        propData.replaceFields_showtitle||'showtitle'
                      ]
                    }}
                    </a-tooltip>
                </a-tag>
              </template>
            </div>
          </div>
        </div>
        <div
          class="fic-message-box"
          v-html="propData.descContent"
          v-if="
            propData.gridLayout == '6:12' &&
            propData.descPosition == 'horizontal' &&
            propData.defaultStatus != 'readonly'
          "
        ></div>
      </div>
      <div
        class="forms-message-container"
        :class="`layout-${propData.labelLayout || 'horizontal'}${!propData.retainBottomHeight?'':' retain-bottom-height'}`"
      >
        <div
          class="fic-label-box"
          :style="getStyle('label')"
          v-if="
            (propData.labelDisplay || propData.labelDisplay == undefined) &&
            (propData.labelLayout == 'horizontal' ||
              propData.labelLayout == undefined)
          "
        ></div>
        <div class="fic-input-box" :style="getStyle('content')">
          <span
            class="fic-desc-info"
            v-html="propData.descContent"
            v-if="
              propData.descPosition != 'horizontal' &&
              propData.defaultStatus != 'readonly' &&
              !errorMessage
            "
          >
          </span>
          <span class="fic-error-message-info" v-if="errorMessage">
            {{ errorMessage }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
export default {
  name: "ITreeTransferSelect",
  components: {
    draggable
  },
  data() {
    return {
      errorMessage: "",
      thisValue: [],
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {
        popoverWidth:"500px"
      },
      findStr:",",
      //平面化结构数据
      selectOptionList:[],
      //树结构类型数据
      optionList:[],
      selectedList:[],
      userDeptSelectDrag: false,
      selectedListKey:[],
      popoverVisible:false,
      //只读情况下显示的内容
      readonlyValue:"",
      //回显的值，并且有值的时候也只是为了阻止optionList的默认值覆盖thisValue
      echoValue:null,
      //回显的值，第一次默认值刷新掉了回显值会存储到这里，然后再次绑定选项的时候判断真正的选项确定值
      echoAfterValue:null
    };
  },
  computed:{
  },
  props: {},
  created() {
    this.moduleObject = this.$root.moduleObject;
    this.convertAttrToStyleObject();
  },
  mounted() {},
  destroyed() {},
  methods: {
    /**
     * 异步加载数据
     */
    loadData(treeNode){
      let that = this;
      if(!this.propData.openSyncOption||!this.propData.asyncInterfaceUrl){
        return null;
      }
      return new Promise((resolve,reject) => {
        // const { id } = treeNode.dataRef;
        let param = {}
        if(that.propData.requestParamFormatFunction&&that.propData.requestParamFormatFunction.length>0){
          window[that.propData.requestParamFormatFunction[0].name]&&window[that.propData.requestParamFormatFunction[0].name].call(this,
          {...that.propData.requestParamFormatFunction[0].param,moduleObject:that.moduleObject,treeNode:treeNode.dataRef,param})
        }
        window.IDM.http.get(that.propData.asyncInterfaceUrl, param).then((res) => {
            if (res.data.code == 200) {
              that.optionListHandle(res.data,"asyncResultValField",true,treeNode.dataRef);
              // that.optionList = res.data.data instanceof Array?res.data.data:[];
            } else {
              
            }
            resolve();
          }).catch(error=>{
            reject(error);
          })
      });
    },
    /**
     * 选项绑定
     */
    optionBind(byValData){
      let that = this;
      switch (this.propData.optionType) {
        case "static":
          this.optionList = this.propData.optionStaticList||[];
          this.optionBindAfter();
          break;
        case "interface":
          //获取所有的URL参数、页面ID（pageId）、以及所有组件的返回值（用范围值去调用IDM提供的方法取出所有的组件值）
          let urlObject = window.IDM.url.queryObject(),
          pageId = window.IDM.broadcast&&window.IDM.broadcast.pageModule?window.IDM.broadcast.pageModule.id:"";
          this.propData.optionInterfaceUrl&&window.IDM.http.get(this.propData.optionInterfaceUrl, {
            urlData:JSON.stringify(urlObject),
            pageId
          }).then((res) => {
            if (res.data.code == 200) {
              that.optionListHandle(res.data);
              // that.optionList = res.data.data instanceof Array?res.data.data:[];
            } else {
              that.optionList = [];
            }
            that.optionBindAfter();
          })
          break;
        case "customFun":
          if(this.propData.optionFunction&&this.propData.optionFunction.length>0){
            var optionList = [];
            try {
              optionList = window[this.propData.optionFunction[0].name]&&window[this.propData.optionFunction[0].name].call(this,{...this.propData.optionFunction[0].param,moduleObject:this.moduleObject});
            } catch (error) {
            }
            that.optionListHandle(optionList);
            // if(optionList instanceof Array){
            //   this.optionList = optionList;
            // }
          }else{
            this.optionList = [];
          }
          this.optionBindAfter();
          break;
        case "byval":
          if(byValData){
            switch (this.propData.byValType) {
              case "resultVal"://直接使用结果
                // let newList = byValData;
                // if(this.propData.byValResultValField){
                //   //填写了
                //   newList = window.IDM.express.replace.call(this, "@["+this.propData.byValResultValField+"]", byValData);
                // }
                // if(newList instanceof Array){
                //   this.optionList = newList;
                // }else{
                //   this.optionList = [];
                // }
                that.optionListHandle(byValData);
                this.optionBindAfter();
                break;
              case "interfaceParam"://作为接口参数
                let urlObject = window.IDM.url.queryObject(),
                pageId = window.IDM.broadcast&&window.IDM.broadcast.pageModule?window.IDM.broadcast.pageModule.id:"";
                let paramObject = {
                  urlData:JSON.stringify(urlObject),
                  pageId
                }
                paramObject[this.propData.byValInterfaceParam] = JSON.stringify(byValData);
                this.propData.byValInterfaceUrl&&window.IDM.http.get(this.propData.byValInterfaceUrl, paramObject).then((res) => {
                  if (res.data.code == 200) {
                    that.optionListHandle(res.data);
                    // that.optionList = res.data.data instanceof Array?res.data.data:[];
                  } else {
                    that.optionList = [];
                  }
                  that.optionBindAfter();
                })
                break;
              case "customFun"://自定义函数
                if(this.propData.byValFunction&&this.propData.byValFunction.length>0){
                  var optionList = [];
                  try {
                    optionList = window[this.propData.byValFunction[0].name]&&window[this.propData.byValFunction[0].name].call(this,{...this.propData.byValFunction[0].param,moduleObject:this.moduleObject,byVal:byValData});
                  } catch (error) {
                  }
                  this.optionListHandle(optionList);
                }else{
                  this.optionList = [];
                }
                this.optionBindAfter();
                break;
            }
          }
          break;
          case "pageInterfaceResult":
            that.optionListHandle(byValData);
            this.optionBindAfter();
          break;
      }
    },
    /**
     * 选项处理函数
     * 先进行显示字段转换，然后再进行text、value转换，把最后的转换结果赋值给this.optionList
     */
    optionListHandle(resultData,byValResultValField,async,treeNode){
      if(!resultData){
        return;
      }
      let newList = resultData.data||(resultData instanceof Array?resultData:[]);
      if(this.propData[byValResultValField||'byValResultValField']){
        //给defaultValue设置dataFiled的值
        var filedExp = this.propData[byValResultValField||'byValResultValField'],dataName="resultData";
        filedExp =
          dataName +
          (filedExp.startsWiths("[") ? "" : ".") +
          filedExp;
        var dataObject = { IDM: window.IDM };
        dataObject[dataName] = resultData;
        newList = window.IDM.express.replace.call(
          this,
          "@[" + filedExp + "]",
          dataObject
        );
      }
      if(this.propData.resultFormatFunction&&this.propData.resultFormatFunction.length>0){
        this.propData.resultFormatFunction.forEach(item=>{
          try {
            //这里要根据判断进行递归的
            newList = window[item.name]&&window[item.name].call(this,{...item.param,moduleObject:this.moduleObject,optionList:newList,async});
          } catch (error) {
          }
        })
      }
      if(async){
        this.switchTreeDataToOptionList(newList)
        treeNode[this.propData.replaceFields_children||'children']=newList;

        this.optionList = [...this.optionList];
      }else{
        this.findStr = ",";
        this.switchTreeDataToOptionList(this.optionList)
        this.optionList = newList;
      }
    },
    switchTreeDataToOptionList(dataList) {
      dataList.forEach((ditem) => {
        //去除重复过滤的下
        const dKey =
          ditem[this.propData.replaceFields_value|| "value"
          ];
        if (this.findStr.indexOf("," + dKey + ",") == -1) {
          const nditem = _.cloneDeep(ditem);
          delete nditem[this.propData.replaceFields_children||'children'
          ];

          this.selectOptionList.push(nditem);
          this.findStr = this.findStr + dKey + ",";
        }
        const dchildren =
          ditem[this.propData.replaceFields_children||'children'
          ];
        if (dchildren) {
          this.switchTreeDataToOptionList(dchildren);
        }
      });
    },
    //递归处理选中的
    getCheckDefaultValue(dataList,defaultValue){
      dataList.forEach(item=>{
        if(item.check){
          if(!this.propData.isMultiple){
            defaultValue=item.value;
          }else{
            defaultValue.push(item.value);
          }
        }
        //这里要根据判断进行递归的
        if(item&&item[this.propData.replaceFields_children||'children']&&item[this.propData.replaceFields_children||'children'].length>0){
          this.getCheckDefaultValue(item[this.propData.replaceFields_children||'children'],defaultValue)
        }
      })
    },
    /**
     * 选项绑定之后执行的操作
     */
    optionBindAfter(){
      var defaultValue=!this.propData.multipleSelect?(this.propData.defaultValue||''):(this.propData.defaultValue?[this.propData.defaultValue]:[]);
      this.optionList&&this.getCheckDefaultValue(this.optionList,defaultValue);
      if(this.echoValue==null&&this.echoAfterValue==null){
        this.thisValue = defaultValue;
      }
      //触发变动事件
      // if(this.thisValue!=''&&this.thisValue!=[]){
      //   this.change(this.thisValue,true)
      // }
      //只读情况下调用只读显示值
      // if(this.propData.defaultStatus=="readonly"){
      //   this.readonlyValueSet();
      // }

      //发现为空就不做任何后续修改值操作
      if(this.thisValue==""||(this.thisValue instanceof Array&&this.thisValue.length==0)){
        return;
      }
      //选项值重新绑定，value值要重新刷新
      if(!this.propData.multipleSelect){
        //单选
        let hasExists = this.optionList.filter(item=>item.value==this.thisValue);
        if(!(hasExists&&hasExists.length>0)){
          if(this.echoValue==null){
            //这里要根据是否选择了labelInValue为true，包括其他地方设置为字符串的也是一样
            this.thisValue = "";
          }
        }
      }else if(this.thisValue instanceof Array){
        //多选
        let newValue = [];
        this.thisValue.forEach(sitem=>{
          this.optionList.forEach(item=>{
            if(item.value==sitem){
              newValue.push(sitem);
            }
          })
        });
        if(this.echoValue==null){
          this.thisValue = newValue;
        }
      }
      //如果有回显值的时候第一次的选项绑定后可能不正确
      if(this.echoValue!=null){
        this.echoAfterValue = _.cloneDeep(this.echoValue);
      }else{
        this.echoAfterValue = null;
      }
      this.echoValue = null;
    },
    /**
     * 清除用户部门选中的结果
     */
    clearUserDeptCheck() {
      this.selectedListKey = [];
      this.selectedList = [];
      this.changePanelSelectOrder();
    },
    panelItemClose(element, index) {
      this.dropDownDeSelect(
        {
          key: element[this.propData.replaceFields_value||'value'],
        }
      );
    },
    /**
     * 取消选中项方法
     */
    dropDownDeSelect(e) {
      //e:{key: 'department_200807120024usH4cGf1OJxwicIW6Pk', label: ' 江西省商务委 '}
      //取消选中后需要对selectedKeys进行移除
      if (e && e.key) {
        this.removeSelectData(e.key);
        //item.useCtrlAttr.options
        //取消选中要把所有的父节点全部取消、并且要把子节点全部取消
        this.unSelectChildrenTreeNode(this.optionList, e.key);
        this.unSelectParentTreeNode(
          this.optionList,
          this.optionList,
          e.key
        );
        this.changePanelSelectOrder();
      }
    },
    /**
     * 移除选中的数据通用方法
     */
    removeSelectData(key) {
      let keyValueName = this.propData.replaceFields_value||'value';
      let existsIndex = -1;
      this.selectedListKey &&
        this.selectedListKey.forEach((skey, sindex) => {
          if (skey == key) {
            existsIndex = sindex;
          }
        });
      existsIndex > -1 && this.selectedListKey.splice(existsIndex, 1);
      existsIndex = -1;
      this.selectedList &&
        this.selectedList.forEach((sitem, sindex) => {
          if (key == sitem[keyValueName]) {
            existsIndex = sindex;
          }
        });
      existsIndex > -1 && this.selectedList.splice(existsIndex, 1);
    },
    /**
     * 取消指定key的所有子节点
     */
    unSelectChildrenTreeNode(optionList, key) {
      const keyValueName =this.propData.replaceFields_value||'value';
      const keyChildrenName = this.propData.replaceFields_children||'children';
      optionList &&
        optionList.forEach((sitem) => {
          const keyValue = sitem[keyValueName];
          if (!key) {
            //是子节点，全部取消掉
            this.removeSelectData(keyValue);
          }
          const childrenData = sitem[keyChildrenName];
          if (childrenData && childrenData.length > 0) {
            //这里如果相等则去查找子级并且执行上面那个if取消掉
            this.unSelectChildrenTreeNode(
              childrenData,
              !key ? "" : keyValue == key ? "" : key
            );
          }
        });
    },
    /**
     * optionList 数据数组,childKey 子级Key，当前父级parentData
     */
    unSelectParentTreeNode(
      allOptionList,
      optionList,
      childKey,
      parentData
    ) {
      const keyValueName = this.propData.replaceFields_value||'value';
      const keyChildrenName = this.propData.replaceFields_children||'children';
      optionList &&
        optionList.forEach((sitem) => {
          //当父级还是为空的时候，说明还是在查找子级
          if (childKey == sitem[keyValueName]) {
            if (parentData) {
              //父级存在,这里做移除操作
              const keyValue = sitem[keyValueName];
              this.removeSelectData(keyValue);
              //再次去用子级的方式查父级
              this.unSelectParentTreeNode(
                allOptionList,
                allOptionList,
                parentData[keyValueName]
              );
            }
          } else {
            //接着查找子级
            const childrenData = sitem[keyChildrenName];
            if (childrenData && childrenData.length > 0) {
              this.unSelectParentTreeNode(
                allOptionList,
                childrenData,
                childKey,
                sitem
              );
            }
          }
        });
    },
    onUserDeptSelect(selectedKeys, info) {
      console.log("onUserDeptSelect", selectedKeys, info);
      // this.selectedKeys = selectedKeys;
    },
    /**
     * 用户部门选中
     */
    onUserDeptCheck(selectedKeys, e) {
      console.log("onUserDeptCheck", selectedKeys, e);
      //使用移除追加功能

      const keyValueName =this.propData.replaceFields_value||'value';
      const keyChildrenName = this.propData.replaceFields_children||'children';
      this.selectedListKey = selectedKeys;
      let selectedList = this.selectedList||[];
      e&&e.checkedNodes&&e.checkedNodes.forEach(item=>{
        let prop = _.cloneDeep(item.data.props.dataRef);
        // delete prop.dataRef
        let filterCount = selectedList.filter(sitem=>sitem[keyValueName]==prop[keyValueName])
        if(filterCount&&filterCount.length>0){

        }else{
          selectedList.push(prop);
        }
      })
      if(e&&e.checked===false){
        //是移除
        for (let index = 0; index < selectedList.length; index++) {
          const element = selectedList[index];
          if(element[keyValueName]==e.node._props.dataRef[keyValueName]){
            selectedList.splice(index,1);
            break;
          }
        }
      }
      this.selectedList=selectedList
      
      for (let index = 0; index < selectedList.length; index++) {
        const element = selectedList[index];
        let hasExists = false;
        for (let sindex = 0; sindex < this.selectedListKey.length; sindex++) {
          const itemValue = this.selectedListKey[sindex];
          if(itemValue==element[keyValueName]){
            hasExists = true;
          }
        }
        if(!hasExists){
          this.selectedListKey.push(element[keyValueName])
        }
      }
      // selectedKeys &&
      //   selectedKeys.forEach((fkey) => {
      //     this.selectOptionList &&
      //       this.selectOptionList.forEach((sitem) => {
      //         if (
      //           fkey ==
      //           sitem[
      //             this.propData.replaceFields_value||'value' 
      //           ]
      //         ) {
      //           this.selectedList.push(sitem);
      //         }
      //       });
      //   });
      this.changePanelSelectOrder();
      // this.selectedKeys = selectedKeys;
    },
    /**
     * 面板调整完了顺序
     */
    changePanelSelectOrder() {
      //根据设置的showCheckedStrategy来确定如何进行显示
      //SHOW_CHILD 只显示子节点
      //SHOW_ALL  显示所有选中节点(包括父节点)
      //SHOW_PARENT 只显示父节点(当父节点下所有子节点都选中时)
      if (this.propData.showCheckedStrategy == "SHOW_CHILD") {
        //移除所有的父节点
        //用整个树结构去递归，遇到选中且没有子节点的就保留，如果有子节点就移除
        this.removeAllParentData(this.optionList);
      } else if (this.propData.showCheckedStrategy == "SHOW_PARENT") {
        //移除所有的子节点
        //用整个树结构的数据去递归，遇到选中的就调用移除所有子节点的方法
        this.removeAllChildrenData(this.optionList);
      }
      this.thisValue = this.selectedList;
    },
    /**
     * 移除所有的父节点，遇到选中且没有子节点的就保留，如果有子节点就移除
     */
    removeAllParentData(optionList) {
      if (
        !this.selectedList ||
        (this.selectedList && this.selectedList.length == 0)
      ) {
        return;
      }
      const keyValueName =this.propData.replaceFields_value||'value';
      const keyChildrenName = this.propData.replaceFields_children||'children';
      optionList &&
        optionList.forEach((sitem) => {
          let existsIndex = -1;
          this.selectedList.forEach((iitem, iindex) => {
            if (sitem[keyValueName] == iitem[keyValueName]) {
              existsIndex = iindex;
            }
          });
          const childrenData = sitem[keyChildrenName];
          if (existsIndex > -1 && childrenData && childrenData.length > 0) {
            //存在子节点，直接移除
            this.selectedList.splice(existsIndex, 1);
          }
          //继续查找下级
          if (childrenData && childrenData.length > 0) {
            this.removeAllParentData(childrenData);
          }
        });
    },
    /**
     * 移除所有子节点数据
     * item：控件对象
     * optionList:子对象
     * keyValue:不为空代表要移除他的下级
     */
    removeAllChildrenData(optionList, keyValue) {
      if (
        !this.selectedList ||
        (this.selectedList && this.selectedList.length == 0)
      ) {
        return;
      }
      const keyValueName =this.propData.replaceFields_value||'value';
      const keyChildrenName =this.propData.replaceFields_children||'children';
      optionList &&
        optionList.forEach((sitem) => {
          //
          let existsIndex = -1;
          this.selectedList.forEach((iitem, iindex) => {
            if (sitem[keyValueName] == iitem[keyValueName]) {
              existsIndex = iindex;
              if (!keyValue) {
                //此节点已选中，需要移除全部的子节点
                this.removeAllChildrenData(
                  sitem[keyChildrenName],
                  iitem[keyValueName]
                );
              }
            }
          });
          if (keyValue) {
            //要移除的状态
            existsIndex > -1 && this.selectedList.splice(existsIndex, 1);
          }
          //继续查找下级
          if (sitem[keyChildrenName] && sitem[keyChildrenName].length > 0) {
            this.removeAllChildrenData(sitem[keyChildrenName], keyValue);
          }
        });
    },
    /**
     * 把属性转换成错误消息的文字样式
     */
    convertAttrToErrorMsgFontStyle() {
      var styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false) {
            continue;
          }
          switch (key) {
            case "errorMsgFont":
              IDM.style.setFontStyle(styleObject, element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .fic-error-message-info",
        styleObject
      );
    },
    /**
     * 把属性转换成标题的文字样式
     */
    convertAttrToLabelFontStyle() {
      var styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false) {
            continue;
          }
          switch (key) {
            case "labelFont":
              IDM.style.setFontStyle(styleObject, element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .fic-label-box .label-content",
        styleObject
      );
    },
    /**
     * 把属性转换成只读的文字样式
     */
    convertAttrToReadOnlyFontStyle() {
      var styleObject = {},
        styleObject1 = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false) {
            continue;
          }
          switch (key) {
            case "contentReadFont":
              IDM.style.setFontStyle(styleObject, element)
              if (element.fontColors.hex8) {
                styleObject1["color"] = element.fontColors.hex8;
              }
              styleObject1["font-size"] =
                element.fontSize + element.fontSizeUnit;
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .fic-readonly-font .fic-itreetransferselect-inner-box",
        styleObject
      );
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .fic-readonly-font .fic-itreetransferselect-inner-box>i",
        styleObject1
      );
    },
    /**
     * 把属性转换成按钮的文字样式
     */
    convertAttrToBtnFontStyle() {
      var styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false) {
            continue;
          }
          switch (key) {
            case "contentBtnFont":
              IDM.style.setFontStyle(styleObject, element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .ant-btn.ant-btn-link",
        styleObject
      );
    },
    /**
     * 把属性转换成单个图标的样式(默认)
     */
    convertAttrToIconSelectDefaultStyle() {
      var styleObject = {};
      if (this.propData.bgSize && this.propData.bgSize == "custom") {
        styleObject["background-size"] =
          (this.propData.bgSizeWidth
            ? this.propData.bgSizeWidth.inputVal +
              this.propData.bgSizeWidth.selectVal
            : "auto") +
          " " +
          (this.propData.bgSizeHeight
            ? this.propData.bgSizeHeight.inputVal +
              this.propData.bgSizeHeight.selectVal
            : "auto");
      } else if (this.propData.bgSize) {
        styleObject["background-size"] = this.propData.bgSize;
      }
      if (this.propData.positionX && this.propData.positionX.inputVal) {
        styleObject["background-position-x"] =
          this.propData.positionX.inputVal + this.propData.positionX.selectVal;
      }
      if (this.propData.positionY && this.propData.positionY.inputVal) {
        styleObject["background-position-y"] =
          this.propData.positionY.inputVal + this.propData.positionY.selectVal;
      }
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false) {
            continue;
          }
          switch (key) {
            case "bgColor":
              if (element && element.hex8) {
                styleObject["background-color"] = element.hex8;
              }
              break;
            case "mainColor":
              if (element && element.hex8) {
                window.IDM.setStyleToPageHead(
                  ".popover_" +
                    this.moduleObject.id +
                    " .fic-itreetransferselect-item-wrapper .check_layer",
                  {
                    color: element.hex8,
                    "border-color": element.hex8,
                  }
                );
              }
              break;
            case "bgImgUrl":
              styleObject[
                "background-image"
              ] = `url(${window.IDM.url.getWebPath(element)})`;
              break;
            case "bgRepeat":
              //平铺模式
              styleObject["background-repeat"] = element;
              break;
            case "bgAttachment":
              //背景模式
              styleObject["background-attachment"] = element;
              break;
            case "box":
              IDM.style.setBoxStyle(styleObject, element)
              break;
            case "borderDefault":
              IDM.style.setBorderStyle(styleObject, element)
              break;
            case "contentEditFont":
              IDM.style.setFontStyle(styleObject, element)
              var styleObject1 = {};
              if (element.fontColors.hex8) {
                styleObject1["color"] = styleObject["color"];
              }
              styleObject1["font-size"] = styleObject["font-size"];
              window.IDM.setStyleToPageHead(
                this.moduleObject.id + " .fic-itreetransferselect-inner-box>i",
                styleObject1
              );
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .fic-itreetransferselect-inner-box",
        styleObject
      );
    },
    /**
     * 把属性转换成文本框的样式(错误提示)
     */
    convertAttrToIconSelectErrorStyle() {
      var styleObject = { "box-shadow": "none" };
      if (this.propData.bgSizeError && this.propData.bgSizeError == "custom") {
        styleObject["background-size"] =
          (this.propData.bgSizeWidthError
            ? this.propData.bgSizeWidthError.inputVal +
              this.propData.bgSizeWidthError.selectVal
            : "auto") +
          " " +
          (this.propData.bgSizeHeightError
            ? this.propData.bgSizeHeightError.inputVal +
              this.propData.bgSizeHeightError.selectVal
            : "auto");
      } else if (this.propData.bgSizeError) {
        styleObject["background-size"] = this.propData.bgSizeError;
      }
      if (
        this.propData.positionXError &&
        this.propData.positionXError.inputVal
      ) {
        styleObject["background-position-x"] =
          this.propData.positionXError.inputVal +
          this.propData.positionXError.selectVal;
      }
      if (
        this.propData.positionYError &&
        this.propData.positionYError.inputVal
      ) {
        styleObject["background-position-y"] =
          this.propData.positionYError.inputVal +
          this.propData.positionYError.selectVal;
      }
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false) {
            continue;
          }
          switch (key) {
            case "bgColorError":
              if (element && element.hex8) {
                styleObject["background-color"] = element.hex8;
              }
              break;
            case "bgImgUrlError":
              styleObject[
                "background-image"
              ] = `url(${window.IDM.url.getWebPath(element)})`;
              break;
            case "bgRepeatError":
              //平铺模式
              styleObject["background-repeat"] = element;
              break;
            case "bgAttachmentError":
              //背景模式
              styleObject["background-attachment"] = element;
              break;
            case "borderError":
              IDM.style.setBorderStyle(styleObject, element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .error-state",
        styleObject
      );
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.convertAttrToStyleObject();
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject() {
      let that = this;
      //默认值
      this.thisValue = !this.propData.multipleSelect
        ? this.propData.defaultValue || ""
        : this.propData.defaultValue
        ? [this.propData.defaultValue]
        : [];
      this.convertAttrToIconSelectDefaultStyle();
      this.convertAttrToReadOnlyFontStyle();
      this.convertAttrToLabelFontStyle();
      this.convertAttrToErrorMsgFontStyle();
      this.convertAttrToIconSelectErrorStyle();
      this.convertAttrToBtnFontStyle();
      //选项绑定（静态数据、数据接口、自定义函数、接收其他组件传值【参数、结果集】（结果集的话需要支持自定义显示字段、参数的话需要把整个内容传递到自定义接口中））
      this.optionBind();
    },
    /**
     * 清空选择的图标
     */
    clearValue() {
      this.thisValue = this.propData.multipleSelect ? [] : "";
      this.setPopoverListStatus();
      this.verifyInputValue("change");
    },
    /**
     * 设置选择的列表选中状态
     */
    setPopoverListStatus() {
      this.iconJsonInfo.glyphs.forEach((fitem) => {
        fitem.active = false;
        if (this.propData.multipleSelect) {
          this.thisValue.forEach((item, index) => {
            if (
              this.iconJsonInfo.font_family +
                " " +
                this.iconJsonInfo.css_prefix_text +
                fitem.font_class ==
              item
            ) {
              fitem.active = true;
            }
          });
        } else if (
          this.iconJsonInfo.font_family +
            " " +
            this.iconJsonInfo.css_prefix_text +
            fitem.font_class ==
          this.thisValue
        ) {
          fitem.active = true;
        }
      });
    },
    /**
     * 重置组件的默认值
     */
    resetDefaultValue(object){
      this.thisValue = this.propData.multipleSelect ? [] : "";
      // this.setPopoverListStatus();
    },
    /**
     * 组件通信：接收消息的方法
     * @param {
     *  type:"发送消息的时候定义的类型，这里可以自己用来要具体做什么，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
     * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）"
     *  message:{发送的时候传输的消息对象数据}
     *  messageKey:"消息数据的key值，代表数据类型是什么，常用于表单交互上，比如通过这个key判断是什么数据"
     *  isAcross:如果为true则代表发送来源是其他页面的组件，默认为false
     * } object
     */
    receiveBroadcastMessage(object) {
      console.log("组件收到消息", object);
      if(object.type&&object.type=="linkageResetDefaultValue"){
        this.resetDefaultValue(object.message)
      }
    },
    /**
     * 组件通信：发送消息的方法
     * @param {
     *  type:"自己定义的，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
     * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）",
     *  message:{实际的消息对象},
     *  rangeModule:"为空发送给全部，根据配置的属性中设定的值（值的内容是组件的packageid数组），不取子表的，比如直接 this.$root.propData.compositeAttr["attrKey"]（注意attrKey是属性中定义的bindKey）,这里的格式为：['1','2']"",
     *  className:"指定的组件类型，比如只给待办组件发送，然后再去过滤上面的值"
     *  globalSend:如果为true则全站发送消息，注意全站rangeModule是无效的，只有className才有效，默认为false
     * } object
     */
    sendBroadcastMessage(object) {
      window.IDM.broadcast && window.IDM.broadcast.send(object);
    },
    /**
     * 交互功能：设置组件的上下文内容值
     * @param {
     *  type:"定义的类型，已知类型：pageCommonInterface（页面统一接口返回值）、"
     *  key:"数据key标识，页面每个接口设置的数据集名称，方便识别获取自己需要的数据"
     *  data:"数据集，内容为：字符串 or 数组 or 对象"
     * }
     */
    setContextValue(object) {
      console.log("统一接口设置的值",object)
      if(object.type!="pageCommonInterface"){
        return;
      }
      //先取出回显的值
      if(object.key==this.propData.echoDataName){
        var filedExp,_thisValue;
        switch (this.propData.echoType) {
          case "customFiled"://自定义字段
            filedExp = this.propData.echoDataFiled;
            break;
          case "customFunction"://自定义函数
            if(this.propData.echoFunction&&this.propData.echoFunction.length>0){
              try {
                let param = {...this.propData.echoFunction[0].param,moduleObject:this.moduleObject,optionList:this.optionList};
                param[this.propData.echoDataName] = object.data;
                _thisValue = window[this.propData.echoFunction[0].name]&&window[this.propData.echoFunction[0].name].call(this,param);
              } catch (error) {
              }
            }
            break;
          default://同表单标识
            filedExp = this.propData.formFiledKey||this.propData.ctrlId;
            break;
        }

        var dataObject = {IDM:window.IDM};
        dataObject[this.propData.echoDataName] = object.data;

        if(filedExp){
          filedExp = this.propData.echoDataName+(filedExp.startsWiths("[")?"":".")+filedExp;
          _thisValue = window.IDM.express.replace.call(this, "@["+filedExp+"]", dataObject);
          //如果是value模式则需要判断是否object，进行转换
          if(this.propData.labelInValue){
            try {
              _thisValue = JSON.parse(_thisValue);
            } catch (error) {
              
            }
          }
        }
        if(_thisValue){
          this.echoValue = _thisValue;
          this.thisValue = _thisValue;
          this.selectedList = this.thisValue;
          this.selectedList.forEach(oItem=>{
            if(oItem[this.propData.replaceFields_key||'key']||oItem[this.propData.replaceFields_key||'key']==0){
              this.selectedListKey.push(oItem[this.propData.replaceFields_key||'key']);
            }
          })
          // this.setPopoverListStatus();
        }
        //取出控件的状态，给propData.defaultStatus赋值,如果为readonly时需要重新readonlyValueSet();
        var stateFiledExp,newState;
        stateFiledExp = this.propData.stateDataFiled;
        if(stateFiledExp){
          stateFiledExp = this.propData.echoDataName+(stateFiledExp.startsWiths("[")?"":".")+stateFiledExp;
          newState = window.IDM.express.replace.call(this, "@["+filedExp+"]", dataObject);
        }
        if(this.propData.stateFunction&&this.propData.stateFunction.length>0){
          try {
            let param = {...this.propData.stateFunction[0].param,moduleObject:this.moduleObject,optionList:this.optionList,...newState};
            param[this.propData.echoDataName] = object.data;
            newState = window[this.propData.stateFunction[0].name]&&window[this.propData.stateFunction[0].name].call(this,param);
          } catch (error) {
          }
        }
        if(newState){
          this.propData.defaultStatus = newState;
        }
      }else if(object.key==this.propData.pageInterfaceResultDataName){
        //下拉选项
        this.optionBind(object.data)
      }
    },
    /**
     * 交互功能：获取需要返回的值，返回格式如下
     * @return {
     *    type:"success",
     *    message:"type为失败的时候原因",
     *    key:"定义的key标识，一般组件定义了一个属性，然后获取指定属性填写的值，这样返回后就能识别对应的字段或者元数据",
     *    data:{要返回的值，内容为：字符串 or 数组 or 对象},
     * }
     */
    getContextValue() {
      let result = {
        type: "success",
        message: "",
        key: this.propData.formFiledKey || this.propData.ctrlId,
      };
      if (!this.verifyInputValue().success) {
        result.type = "error";
        result.message = this.verifyInputValue().message;
      } else {
        result.data = this.thisValue;
      }
      return result;
    },
    /**
     * 校验内容是否通过，如果通过则返回true，未通过返回false
     * 文本框输入改变的时候触发，获取当前控件值的时候触发
     * 上面两种情况都会触发校验并且显示错误提示
     * @params type:"change为文本框改变的时候，return为控件返回值的时候"
     * @return {
     *   success:true或false  校验是否通过
     *   message:提示的消息
     * }
     */
    verifyInputValue(type) {
      let result = {
        success: true,
        message: "",
      };
      if(this.propData.defaultStatus=="readonly"){
        this.errorMessage = "";
        return result;
      }
      let thisInputVal =
        this.thisValue || (!this.propData.multipleSelect ? "" : []);
      //这里开始判断执行是否需要校验
      if (this.propData.required && thisInputVal.length == 0) {
        //必填
        result.success = false;
        result.message =
          this.propData.requiredText || this.propData.label + "不能为空";
      } else if (this.propData.customFun && this.propData.customFunCode) {
        try {
          var fun = IDM.express.eval(this.propData.customFunCode);
          if (!fun(thisInputVal)) {
            result.success = false;
            result.message =
              this.propData.customFunText || this.propData.label + "格式错误";
          }
        } catch (e) {}
      }
      if (!result.success) {
        this.errorMessage = result.message;
      } else {
        this.errorMessage = "";
      }
      return result;
    },
    getStyle(key) {
      let styles = {};
      switch (key) {
        case "label":
          if (this.propData.labelLayout == "horizontal") {
            switch (this.propData.gridLayout) {
              case "6:12":
              case "6:18":
                styles["width"] = "25%";
                break;
              case "12:12":
                styles["width"] = "50%";
                break;
              default:
                break;
            }
          }
          break;
        case "content":
          if (this.propData.labelLayout == "horizontal") {
            switch (this.propData.gridLayout) {
              case "close":
                styles["width"] = "100%";
                break;
              case "6:12":
                styles["width"] = "66.667%";
                if (this.propData.descPosition == "horizontal") {
                  styles["width"] = "100%";
                }
                break;
              case "6:18":
              case "12:12":
                styles["width"] = "100%";
                break;
            }
          }
          break;
        case "root":
          if (
            this.propData.maxWidth &&
            this.propData.maxWidth.inputVal &&
            this.propData.maxWidth.selectVal
          ) {
            styles["max-width"] =
              this.propData.maxWidth.inputVal +
              this.propData.maxWidth.selectVal;
          }
          if (
            this.propData.minWidth &&
            this.propData.minWidth.inputVal &&
            this.propData.minWidth.selectVal
          ) {
            styles["min-width"] =
              this.propData.minWidth.inputVal +
              this.propData.minWidth.selectVal;
          }
          if (
            this.propData.rightPaddingNumber &&
            this.propData.rightPaddingNumber.inputVal &&
            this.propData.rightPaddingNumber.selectVal
          ) {
            styles["padding-right"] =
              this.propData.rightPaddingNumber.inputVal +
              this.propData.rightPaddingNumber.selectVal;
          }
          break;
        default:
          break;
      }
      return styles;
    },
  },
  watch: {},
};
</script>
<style lang="scss">
@import "../style/formsCommon.scss";
.fic-treetransferselect-box {
  // display: flex;
  // flex-wrap: wrap;
  // align-items: center;
  .fic-itreetransferselect-inner-box {
    padding: 0px 5px;
    border: 1px solid #eee;
    margin-right: 2px;
    margin-top: 2px;
    > i {
      font-size: 16px;
    }
  }
  .ant-tag{
    margin-bottom: 5px;
  }
}

.control-center-panel-select-ghost {
  opacity: 0.5;
  background: #d9d9d9 !important;
}
</style>