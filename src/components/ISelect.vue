<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id">
    <!--
      组件内部容器
      增加class="drag_container" 必选
      idm-ctrl-id：组件的id，这个必须不能为空
      idm-container-index  组件的内部容器索引，不重复唯一且不变，必选
    -->
    <div class="forms-common-container" v-show="propData.defaultStatus!='hidden'" :style="getStyle('root')">
      <div class="forms-select-container" :class="`layout-${propData.labelLayout||'horizontal'}`">
        <div class="fic-label-box" :style="getStyle('label')" v-if="propData.labelDisplay||propData.labelDisplay==undefined">
          <span class="required" v-if="propData.required&&propData.defaultStatus!='readonly'">* </span>
          <span class="label-content">{{IDM.env_dev?propData.label:"选择框"}}</span>
        </div>
        <div class="fic-select-box" v-if="propData.defaultStatus!='readonly'" :style="getStyle('content')">
          <a-select
           style="width:100%" 
           @change="change" 
           :dropdownClassName="'iselect-dropdown-'+moduleObject.id" 
           :labelInValue="propData.labelInValue||false" 
           :ref="'iselect'+moduleObject.id" 
           :mode="propData.selectMode||'default'" 
           :class="{'error-state':errorMessage}" 
           :disabled="propData.defaultStatus=='disabled'" 
           :notFoundContent="propData.notFoundContent||'Not Found'" 
           option-filter-prop="children"
           :showArrow="propData.showArrow!==false?true:false" 
           v-model="thisValue" 
           :size="propData.size" 
           :allowClear="propData.clearIcon" 
           :placeholder="propData.placeholder">
            <template v-if="optionList.length>0">
              <a-select-option v-for="(item) in optionList" :key="item.value">
                {{item.text}}
              </a-select-option>
            </template>
          </a-select>
        </div>
        <div class="fic-select-box fic-readonly-font" v-else :style="getStyle('content')">
          {{readonlyValue}}
        </div>
        <div class="fic-message-box" v-html="propData.descContent" v-if="propData.gridLayout=='6:12'&&propData.descPosition=='horizontal'&&propData.defaultStatus!='readonly'">
        </div>
      </div>
      <div v-if="!propData.closeCheck" class="forms-message-container" :class="`layout-${propData.labelLayout||'horizontal'}${!propData.retainBottomHeight?'':' retain-bottom-height'}`">
        <div class="fic-label-box" :style="getStyle('label')" v-if="(propData.labelDisplay||propData.labelDisplay==undefined)&&(propData.labelLayout=='horizontal'||propData.labelLayout==undefined)">
        </div>
        <div class="fic-select-box" :style="getStyle('content')">
          <span class="fic-desc-info" v-html="propData.descContent" v-if="propData.descPosition!='horizontal'&&propData.defaultStatus!='readonly'&&!errorMessage">
          </span>
          <span class="fic-error-message-info" v-if="errorMessage">
            {{errorMessage}}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ISelect',
  data(){
    return {
      errorMessage:"",
      //非只读情况下的值，下拉框是value，所以跟只读的不一样，这里可能会被回显值覆盖一次，如果回显有值了就不会取optionList的默认值了
      thisValue:this.$root.propData.selectMode=='default'?undefined:[],
      moduleObject:{},
      propData:this.$root.propData.compositeAttr||{},
      optionList:[],
      //只读情况下显示的内容
      readonlyValue:"",
      //回显的值，并且有值的时候也只是为了阻止optionList的默认值覆盖thisValue
      echoValue:null,
      //回显的值，第一次默认值刷新掉了回显值会存储到这里，然后再次绑定选项的时候判断真正的选项确定值
      echoAfterValue:null,
    }
  },
  props: {
  },
  created() {
    this.moduleObject = this.$root.moduleObject
    // console.log(this.moduleObject)
    // this.propData = testAttr;
    this.convertAttrToStyleObject();
  },
  mounted() {
  },
  destroyed() {},
  methods:{
    /**
     * 把属性转换成错误消息的文字样式
     */
    convertAttrToErrorMsgFontStyle(){
      var styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if(!element&&element!==false&&element!=0){
            continue;
          }
          switch (key) {
            case "errorMsgFont":
              IDM.style.setFontStyle(styleObject, element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id+" .fic-error-message-info",styleObject);
    },
    /**
     * 把属性转换成标题的文字样式
     */
    convertAttrToLabelFontStyle(){
      var styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if(!element&&element!==false&&element!=0){
            continue;
          }
          switch (key) {
            case "labelFont":
              IDM.style.setFontStyle(styleObject, element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id+" .fic-label-box .label-content",styleObject);
    },
    /**
     * 把属性转换成只读的文字样式
     */
    convertAttrToReadOnlyFontStyle(){
      var styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if(!element&&element!==false&&element!=0){
            continue;
          }
          switch (key) {
            case "contentReadFont":
              IDM.style.setFontStyle(styleObject, element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id+" .fic-readonly-font",styleObject);
    },
    /**
     * 把属性转换成下拉框的样式(默认)
     */
    convertAttrToSelectDefaultStyle() {
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
            case "borderDefault":
              IDM.style.setBorderStyle(styleObject, element)
              break;
            case "contentEditFont":
              IDM.style.setFontStyle(styleObject, element)
              var _itemObject = {};
              IDM.style.setFontStyle(_itemObject, element)

              window.IDM.setStyleToPageHead(
                ".iselect-dropdown-"+this.moduleObject.id+" .ant-select-dropdown-menu-item",
                _itemObject
              );
              window.IDM.setStyleToPageHead(
                ".iselect-dropdown-"+this.moduleObject.id+" .ant-select-dropdown-menu-item-disabled",
                {
                  "color":"rgba(0,0,0,.25) !important"
                }
              );
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .ant-select .ant-select-selection",
        styleObject
      );
      //其他内容元素
      
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .ant-select .ant-select-selection__clear",
        {
          "background":styleObject["background-color"]||"transparent"
        }
      );
      window.IDM.setStyleToPageHead(
        ".iselect-dropdown-"+this.moduleObject.id+" .ant-select-dropdown-menu-item-selected",
        {
          "background-color":"rgba(0, 0, 0, 0.15) !important"
        }
      );
      window.IDM.setStyleToPageHead(
        ".iselect-dropdown-"+this.moduleObject.id+" .ant-select-dropdown-menu-item-active",
        {
          "background-color":"rgba(0, 0, 0, 0.25) !important"
        }
      );
    },
    
    /**
     * 把属性转换成标签的样式
     */
    convertAttrToSelectTagsStyle() {
      var styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false) {
            continue;
          }
          switch (key) {
            case "tagsBgColor":
              if (element && element.hex8) {
                styleObject["background-color"] = element.hex8;
              }
              break;
            case "tagsBorder":
              IDM.style.setBorderStyle(styleObject, element)
              break;
            case "tagsFont":
              IDM.style.setFontStyle(styleObject, element)
              
              if (element.fontColors.hex8) {
                window.IDM.setStyleToPageHead(
                  this.moduleObject.id + " .ant-select .ant-select-selection--multiple .ant-select-selection__choice__remove",
                  {
                    "color":element.fontColors.hex8
                  }
                );
              }
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .ant-select .ant-select-selection--multiple .ant-select-selection__choice",
        styleObject
      );
    },
    /**
     * 把属性转换成下拉框的样式(焦点)
     */
    convertAttrToSelectFoucsStyle() {
      var styleObject = {};
      if (this.propData.bgSizeFocus && this.propData.bgSizeFocus == "custom") {
        styleObject["background-size"] =
          (this.propData.bgSizeWidthFocus
            ? this.propData.bgSizeWidthFocus.inputVal +
              this.propData.bgSizeWidthFocus.selectVal
            : "auto") +
          " " +
          (this.propData.bgSizeHeightFocus
            ? this.propData.bgSizeHeightFocus.inputVal +
              this.propData.bgSizeHeightFocus.selectVal
            : "auto");
      } else if (this.propData.bgSizeFocus) {
        styleObject["background-size"] = this.propData.bgSizeFocus;
      }
      if (
        this.propData.positionXFocus &&
        this.propData.positionXFocus.inputVal
      ) {
        styleObject["background-position-x"] =
          this.propData.positionXFocus.inputVal +
          this.propData.positionXFocus.selectVal;
      }
      if (
        this.propData.positionYFocus &&
        this.propData.positionYFocus.inputVal
      ) {
        styleObject["background-position-y"] =
          this.propData.positionYFocus.inputVal +
          this.propData.positionYFocus.selectVal;
      }
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false) {
            continue;
          }
          switch (key) {
            case "bgColorFocus":
              if (element && element.hex8) {
                styleObject["background-color"] = element.hex8;
              }
              break;
            case "bgImgUrlFocus":
              styleObject[
                "background-image"
              ] = `url(${window.IDM.url.getWebPath(element)})`;
              break;
            case "bgRepeatFocus":
              //平铺模式
              styleObject["background-repeat"] = element;
              break;
            case "bgAttachmentFocus":
              //背景模式
              styleObject["background-attachment"] = element;
              break;
            case "borderFocus":
              IDM.style.setBorderStyle(styleObject, element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .ant-select.ant-select-focused  .ant-select-selection,.iselect-dropdown-"+this.moduleObject.id+"",
        styleObject
      );
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .ant-select.ant-select-focused  .ant-select-selection",
        {
          "box-shadow": "none" 
        }
      );
    },
    /**
     * 把属性转换成文本框的样式(错误提示)
     */
    convertAttrToSelectErrorStyle() {
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
        this.moduleObject.id + " .ant-select.error-state .ant-select-selection",
        styleObject
      );
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData){
      this.propData = propData.compositeAttr||{};
      this.convertAttrToStyleObject();
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject(){
      //默认值
      this.thisValue = this.propData.selectMode=='default'?(this.propData.defaultValue||undefined):(this.propData.defaultValue?[this.propData.defaultValue]:[]);
      this.convertAttrToReadOnlyFontStyle();
      this.convertAttrToLabelFontStyle();
      this.convertAttrToErrorMsgFontStyle();
      this.convertAttrToSelectDefaultStyle();
      this.convertAttrToSelectFoucsStyle();
      this.convertAttrToSelectErrorStyle();
      //标签状态下的样式设置
      if(this.propData.selectMode!='default'){
        this.convertAttrToSelectTagsStyle();
      }
      //选项绑定（静态数据、数据接口、自定义函数、接收其他组件传值【参数、结果集】（结果集的话需要支持自定义显示字段、参数的话需要把整个内容传递到自定义接口中））
      this.optionBind();
      //结果联动（无、接收其他组件传值【显示字段、自定义渲染函数】）【其他组件也通用的】

      //数据联动其他组件范围
      
      //定制渲染只读态，渲染选项选择后的只读状态的样式
      //自定义渲染选择项
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
    optionListHandle(resultData){
      if(!resultData){
        return;
      }
      let newList = resultData.data||(resultData instanceof Array?resultData:[]);
      if(this.propData.byValResultValField){
        //给defaultValue设置dataFiled的值
        var filedExp = this.propData.byValResultValField,dataName="resultData";
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
            newList = window[item.name]&&window[item.name].call(this,{...item.param,moduleObject:this.moduleObject,optionList:newList});
          } catch (error) {
          }
        })
      }
      //text、value转换
      if(this.propData.replaceFields_text||this.propData.replaceFields_value){
        if(newList instanceof Array){
          newList.forEach(item=>{
            if(this.propData.replaceFields_text){
              item["text"] = item[this.propData.replaceFields_text]
            }
            if(this.propData.replaceFields_value){
              item["value"] = item[this.propData.replaceFields_value]
            }
          })
        }
      }
      this.optionList = newList;

    },
    /**
     * 选项绑定之后执行的操作
     */
    optionBindAfter(){
      //自定义渲染选择项
      if(this.propData.renderOptionFunction&&this.propData.renderOptionFunction.length>0){
        this.optionList.forEach(item=>{
            try {
              item.text = window[this.propData.renderOptionFunction[0].name]&&window[this.propData.renderOptionFunction[0].name].call(this,{...this.propData.renderOptionFunction[0].param,moduleObject:this.moduleObject,itemObject:item});
            } catch (error) {
            }
        })
      }
      var defaultValue=this.propData.selectMode=='default'?(this.propData.defaultValue||undefined):(this.propData.defaultValue?[this.propData.defaultValue]:[]);
      this.optionList.forEach(item=>{
        if(item.check){
          if(this.propData.selectMode=='default'){
            defaultValue=item.value;
          }else{
            defaultValue.push(item.value);
          }
        }
      })
      if(this.echoValue==null&&this.echoAfterValue==null){
        this.thisValue = defaultValue;
      }
      //触发变动事件
      if(this.thisValue!=undefined&&this.thisValue!=[]){
        this.change(this.thisValue, !this.propData.needDefaultChange ? true : '0')
      }
      //只读情况下调用只读显示值
      if(this.propData.defaultStatus=="readonly"){
        console.log("选项绑定后,回显值"+this.moduleObject.packageid,this.thisValue,this.optionList)
        this.readonlyValueSet();
      }

      //发现为空就不做任何后续修改值操作
      if(this.thisValue==undefined||(this.thisValue instanceof Array&&this.thisValue.length==0)){
        return;
      }
      //选项值重新绑定，value值要重新刷新
      if(this.propData.selectMode=='default'){
        //单选
        let hasExists = this.optionList.filter(item=>item.value==this.thisValue);
        if(!(hasExists&&hasExists.length>0)){
          if(this.echoValue==null){
            this.thisValue = undefined;
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
     * 联动结果值绑定
     */
    valueBind(byValData){
      let that = this;
      switch (this.propData.resType) {
        case "interfaceParam":
            let urlObject = window.IDM.url.queryObject(),
            pageId = window.IDM.broadcast&&window.IDM.broadcast.pageModule?window.IDM.broadcast.pageModule.id:"";
            let paramObject = {
              urlData:JSON.stringify(urlObject),
              pageId
            }
            paramObject[this.propData.resInterfaceParam] = JSON.stringify(byValData);
            this.propData.resInterfaceUrl&&window.IDM.http.get(this.propData.resInterfaceUrl, paramObject).then((res) => {
              if (res.data.code == 200) {
                that.thisValue = res.data.data;
              } else {
                that.thisValue = that.propData.selectMode=='default'?undefined:[];
              }
            })
          break;
        case "resultVal":
          let newValue = byValData;
          if(this.propData.resResultValField){
            //填写了
            newValue = window.IDM.express.replace.call(this, "@["+this.propData.resResultValField+"]", byValData);
          }
          this.thisValue = newValue;
          break;
        case "customFun":
          if(this.propData.resFunction&&this.propData.resFunction.length>0){
            var resValue = this.propData.selectMode=='default'?undefined:[];
            try {
              resValue = window[this.propData.resFunction[0].name]&&window[this.propData.resFunction[0].name].call(this,{...this.propData.resFunction[0].param,moduleObject:this.moduleObject,byVal:byValData});
            } catch (error) {
            }
            this.thisValue = resValue;
          }
          break;
      }
    },
    change(value, option){
      this.verifySelectValue('change')
      let selectObject=this.getSelectedOption(value);
      if(selectObject==null){
        return;
      }
      if(this.propData.linkageDemandPageModule&&this.propData.linkageDemandPageModule.length>0){
        var moduleIdArray = [];
        this.propData.linkageDemandPageModule.forEach(item=>{moduleIdArray.push(item.moduleId)});
        this.sendBroadcastMessage({
          type:"linkageDemand",
          message:selectObject,
          rangeModule:moduleIdArray,
          messageKey:this.propData.formFiledKey||this.propData.ctrlId,
          triggerType:option===true?'AT':(option?'MT':'OT')
        })
      }
      if(this.propData.linkageResultPageModule&&this.propData.linkageResultPageModule.length>0){
        var moduleIdArray = [];
        this.propData.linkageResultPageModule.forEach(item=>{moduleIdArray.push(item.moduleId)});
        this.sendBroadcastMessage({
          type:"linkageResult",
          message:selectObject,
          rangeModule:moduleIdArray,
          messageKey:this.propData.formFiledKey||this.propData.ctrlId,
          triggerType:option===true?'AT':(option?'MT':'OT')
        })
      }
      if(option&&option!==true){
        //调用自定义的值改变的函数
        if(this.propData.changeOptionFunction&&this.propData.changeOptionFunction.length>0){
          try {
            window[this.propData.changeOptionFunction[0].name]&&window[this.propData.changeOptionFunction[0].name].call(this,{...this.propData.changeOptionFunction[0].param,moduleObject:this.moduleObject,thisValue:this.thisValue,optionList:this.optionList});
          } catch (error) {
          }
        }
      }
    },
    /**
     * 获取只读情况下的值
     */
    readonlyValueSet(){
      //默认显示别名
      var readValue = "";
      if(this.propData.renderFunction&&this.propData.renderFunction.length>0){
        try {
          readValue = window[this.propData.renderFunction[0].name]&&window[this.propData.renderFunction[0].name].call(this,{...this.propData.renderFunction[0].param,moduleObject:this.moduleObject,thisValue:this.thisValue,optionList:this.optionList});
        } catch (error) {
        }
      }else{
        if(this.propData.selectMode=='default'){
          //单选
          let hasExists = this.optionList.filter(item=>item.value==this.thisValue);
          if(hasExists&&hasExists.length>0){
            readValue = hasExists[0].text;
          }
        }else if(this.thisValue instanceof Array){
          //多选
          let newValue = [];
          this.thisValue.forEach(sitem=>{
            this.optionList.forEach(item=>{
              if(item.value==sitem){
                newValue.push(item.text);
              }
            })
          });
          readValue = newValue.join(",");
        }
      }
      this.readonlyValue = readValue;
      return readValue;
    },
    /**
     * 重置组件的默认值
     */
    resetDefaultValue(object){
      var defaultValue=this.propData.selectMode=='default'?(this.propData.defaultValue||undefined):(this.propData.defaultValue?[this.propData.defaultValue]:[]);
      this.optionList.forEach(item=>{
        if(item.check){
          if(this.propData.selectMode=='default'){
            defaultValue=item.value;
          }else{
            defaultValue.push(item.value);
          }
        }
      })
      this.thisValue = defaultValue;
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
    receiveBroadcastMessage(object){
      console.log("组件收到消息:"+this.moduleObject.packageid, object);
      if(object.type&&object.type=="linkageDemand"){
        this.optionBind(object.message);
      }else if(object.type&&object.type=="linkageResult"){
        //结果值设置
        object.triggerType!="OT"&&this.valueBind(object.message)
      }else if(object.type&&object.type=="linkageResetDefaultValue"){
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
    sendBroadcastMessage(object){
        window.IDM.broadcast&&window.IDM.broadcast.send(object);
    },
    /**
     * 交互功能：设置组件的上下文内容值
     * @param {
     *  type:"定义的类型，已知类型：pageCommonInterface（页面统一接口返回值）、"
     *  key:"数据key标识，页面每个接口设置的数据集名称，方便识别获取自己需要的数据"
     *  data:"数据集，内容为：字符串 or 数组 or 对象"
     * }
     */
    setContextValue(object){
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
                var param = {...this.propData.echoFunction[0].param,moduleObject:this.moduleObject,optionList:this.optionList};
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
          this.change(this.thisValue)
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
            var param = {...this.propData.stateFunction[0].param,moduleObject:this.moduleObject,optionList:this.optionList,...newState};
            param[this.propData.echoDataName] = object.data;
            newState = window[this.propData.stateFunction[0].name]&&window[this.propData.stateFunction[0].name].call(this,param);
          } catch (error) {
          }
        }
        if(newState){
          this.propData.defaultStatus = newState;
        }
        console.log("回显值"+this.moduleObject.packageid,this.thisValue,this.optionList)
        this.propData.defaultStatus=="readonly"&&this.readonlyValueSet();
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
    getContextValue(){
      let result = {
        type:"success",
        message:"",
        key:this.propData.formFiledKey||this.propData.ctrlId
      };
      if(!this.verifySelectValue().success){
        result.type="error";
        result.message = this.verifySelectValue().message;
        this.$refs["iselect"+this.moduleObject.id].focus();
      }else{
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
    verifySelectValue(type){
      let that = this;
      let result = {
        success:true,
        message:""
      };
      if(this.propData.defaultStatus=="readonly"){
        this.errorMessage = "";
        return result;
      }
      let thisSelectVal = this.thisValue||(this.propData.selectMode=='default'?undefined:[]);
      // console.log("🚀 ~ file: ISelect.vue ~ line 793 ~ verifySelectValue ~ thisSelectVal", thisSelectVal)
      //这里开始判断执行是否需要校验
      if(this.propData.required&&thisSelectVal.length==0){
        //必填
        result.success = false;
        result.message = this.propData.requiredText||(this.propData.label+"不能为空");
      }else if(this.propData.customFun&&this.propData.customFunCode){
        try{
          var fun = IDM.express.eval(this.propData.customFunCode);
          if(!fun(thisSelectVal)){
            result.success = false;
            result.message = this.propData.customFunText||(this.propData.label+"格式错误");
          }
        }catch(e){

        }
      }else if(this.propData.interfaceVerify&&this.propData.interfaceVerifyUrl){
        //开启接口校验
        let urlObject = window.IDM.url.queryObject(),
        pageId = window.IDM.broadcast&&window.IDM.broadcast.pageModule?window.IDM.broadcast.pageModule.id:"";
        let paramObject = {
          urlData:JSON.stringify(urlObject),
          pageId,
          currentVal:thisSelectVal,
          currentOption:JSON.stringify(this.getSelectedOption(thisSelectVal))
        }
        //接口校验前置条件，执行自定义函数
        let interfaceVerifyPreconditionResult = true;
        if(this.propData.interfaceVerifyPreconditionFunction&&this.propData.interfaceVerifyPreconditionFunction.length>0){
          try {
            var param = {...this.propData.interfaceVerifyPreconditionFunction[0].param,moduleObject:this.moduleObject,...paramObject};
            interfaceVerifyPreconditionResult = window[this.propData.interfaceVerifyPreconditionFunction[0].name]&&window[this.propData.interfaceVerifyPreconditionFunction[0].name].call(this,param);
          } catch (error) {
          }
        }
        interfaceVerifyPreconditionResult!==false&&this.propData.interfaceVerifyUrl&&window.IDM.http.post(this.propData.interfaceVerifyUrl, paramObject).then((res) => {
          if (res.data.code == 200) {
            if(res.data.data===false||(res.data.data&&res.data.data.status===false)){
              //接口验证失败后
              result.success = false;
              result.message = that.propData.interfaceVerifyText;
              that.errorMessage = result.message;
              if(that.propData.interfaceVerifyConfrim){
                that.$confirm({
                  title: that.propData.interfaceVerifyConfrimText,
                  okText: "确定",
                  cancelText: "取消",
                  onOk() {
                    var interfaceVerifyConfrimOkAction = that.propData.interfaceVerifyConfrimOkAction;
                    interfaceVerifyConfrimOkAction&&interfaceVerifyConfrimOkAction.forEach(item=>{
                      window[item.name]&&window[item.name].call(that,{
                        urlData:urlObject,
                        pageId,
                        interfaceResultData:res.data,
                        customParam:item.param,
                        _this:that
                      });
                    })
                  },
                  onCancel() {
                  }
                });
              }
            }
          } else {
            
          }
        })
      }
      if(!result.success){
        this.errorMessage = result.message;
      }else{
        this.errorMessage = "";
      }
      return result;
    },
    /**
     * 获取已选择的选项
     */
    getSelectedOption(value){
      let selectObject={};
      if(this.propData.selectMode!='default'){
        let newValue = [];
        value.forEach(sitem=>{
          this.optionList.forEach(item=>{
            if(item.value==sitem){
              newValue.push(item);
            }
          })
        });
        selectObject = newValue;
      }else{
        selectObject = this.optionList.filter(item=>item.value==value);
        if(selectObject&&selectObject.length>0){
          selectObject = selectObject[0];
        }else{
          return null;
        }
      }
      return selectObject;
    },
    getStyle(key){
        let styles = {};
        switch (key) {
            case "label":
              if(this.propData.labelLayout=="horizontal"){
                switch (this.propData.gridLayout) {
                  case "6:12":
                  case "6:18":
                    styles["width"]="25%";
                    break;
                  case "12:12":
                    styles["width"]="50%";
                    break;
                  default:
                    break;
                }
              }
            break;
            case "content":
              if(this.propData.labelLayout=="horizontal"){
                switch (this.propData.gridLayout) {
                  case "close":
                    styles["width"]="100%";
                    break;
                  case "6:12":
                    styles["width"]="66.667%";
                    if(this.propData.descPosition=='horizontal'){
                      styles["width"]="100%";
                    }
                    break;
                  case "6:18":
                  case "12:12":
                    styles["width"]="100%";
                    break;
                }
              }
            break;
            case "root":
              if(this.propData.maxWidth&&this.propData.maxWidth.inputVal&&this.propData.maxWidth.selectVal){
                styles["max-width"] = this.propData.maxWidth.inputVal+this.propData.maxWidth.selectVal;
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
    }
  }
}
</script>
<style lang="scss">
@import "../style/formsCommon.scss";
</style>