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
            IDM.env_dev ? propData.label : "多行输入框"
          }}</span>
        </div>
        <div
          class="fic-input-box"
          v-if="propData.defaultStatus != 'readonly'"
          :style="getStyle('content')"
        >
          <a-textarea
            :ref="'iinput' + moduleObject.id"
            :class="{ 'error-state': errorMessage }"
            :disabled="propData.defaultStatus == 'disabled'"
            v-model="thisValue"
            :size="propData.size"
            :allowClear="propData.clearIcon"
            :placeholder="propData.placeholder"
            :autoSize="{minRows: propData.minRows||1, maxRows: propData.maxRows||6}"
            @blur="blurChange"
          >
            <a-tooltip
              slot="suffix"
              :title="propData.suffixContent"
              v-if="propData.suffixContent && propData.suffixType == 'tip'"
            >
              <a-icon type="info-circle" style="color: rgba(0, 0, 0, 0.45)" />
            </a-tooltip>
            <template
              slot="suffix"
              v-else-if="
                propData.suffixContent && propData.suffixType == 'font'
              "
              >{{ propData.suffixContent }}</template
            >
            <template slot="prefix" v-if="propData.prefixContent">{{
              propData.prefixContent
            }}</template>
          </a-textarea>
        </div>
        <div
          class="fic-input-box fic-readonly-font"
          v-else
          :style="getStyle('content')"
        >
          {{ thisValue }}
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
export default {
  name: "ITextarea",
  data() {
    return {
      errorMessage: "",
      thisValue: "",
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      //回显的值，并且有值的时候也只是为了阻止表单联动的时候覆盖thisValue，有回显值第一次不覆盖thisValue，后面继续覆盖
      echoValue:null
    };
  },
  props: {},
  created() {
    this.moduleObject = this.$root.moduleObject;
    // console.log(this.moduleObject)
    // this.propData = testAttr;
    this.convertAttrToStyleObject();
  },
  mounted() {},
  destroyed() {},
  methods: {
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
              styleObject["font-family"] = element.fontFamily;
              if (element.fontColors.hex8) {
                styleObject["color"] = element.fontColors.hex8;
              }
              styleObject["font-weight"] =
                element.fontWeight && element.fontWeight.split(" ")[0];
              styleObject["font-style"] = element.fontStyle;
              styleObject["font-size"] =
                element.fontSize + element.fontSizeUnit;
              styleObject["line-height"] =
                element.fontLineHeight +
                (element.fontLineHeightUnit == "-"
                  ? ""
                  : element.fontLineHeightUnit);
              styleObject["text-align"] = element.fontTextAlign;
              styleObject["text-decoration"] = element.fontDecoration;
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
      var styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false) {
            continue;
          }
          switch (key) {
            case "contentReadFont":
              IDM.style.setFontStyle(styleObject, element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .fic-readonly-font",
        styleObject
      );
    },
    /**
     * 把属性转换成文本框的样式(默认)
     */
    convertAttrToInputDefaultStyle() {
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
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " textarea",
        styleObject
      );
    },
    /**
     * 把属性转换成文本框的样式(焦点)
     */
    convertAttrToInputFoucsStyle() {
      var styleObject = { "box-shadow": "none" };
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
        this.moduleObject.id + " textarea:focus",
        styleObject
      );
    },
    /**
     * 把属性转换成文本框的样式(错误提示)
     */
    convertAttrToInputErrorStyle() {
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
        this.moduleObject.id + " textarea.error-state",
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
      //默认值
      this.thisValue = this.propData.defaultValue || "";
      this.convertAttrToInputDefaultStyle();
      this.convertAttrToInputFoucsStyle();
      this.convertAttrToReadOnlyFontStyle();
      this.convertAttrToLabelFontStyle();
      this.convertAttrToErrorMsgFontStyle();
      this.convertAttrToInputErrorStyle();
    },
    /**
     * 结果值绑定
     */
    valueBind(byValData){
      let that = this;
      if(this.echoValue!=null){
        this.echoValue=null;
        return;
      }
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
                that.thisValue = '';
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
            var resValue = '';
            try {
              resValue = window[this.propData.resFunction[0].name]&&window[this.propData.resFunction[0].name].call(this,{...this.propData.resFunction[0].param,moduleObject:this.moduleObject,byVal:byValData});
            } catch (error) {
            }
            this.thisValue = resValue;
          }
          break;
      }
    },
    /**
     * 重置组件的默认值
     */
    resetDefaultValue(object){
      this.thisValue = this.propData.defaultValue || "";
    },
    /**
     * 内容变更事件
     */
    change(value){
      let selectObject=value;
      if(this.propData.linkageDemandPageModule&&this.propData.linkageDemandPageModule.length>0){
        var moduleIdArray = [];
        this.propData.linkageDemandPageModule.forEach(item=>{moduleIdArray.push(item.moduleId)});
        this.sendBroadcastMessage({
          type:"linkageDemand",
          message:selectObject,
          rangeModule:moduleIdArray,
          messageKey:this.propData.formFiledKey||this.propData.ctrlId
        })
      }
      if(this.propData.linkageResultPageModule&&this.propData.linkageResultPageModule.length>0){
        var moduleIdArray = [];
        this.propData.linkageResultPageModule.forEach(item=>{moduleIdArray.push(item.moduleId)});
        this.sendBroadcastMessage({
          type:"linkageResult",
          message:selectObject,
          rangeModule:moduleIdArray,
          messageKey:this.propData.formFiledKey||this.propData.ctrlId
        })
      }
    },
    /**
     * 失去焦点事件
     */
    blurChange(){
      let selectObject=this.thisValue;
      if(this.propData.blurLinkageDemandPageModule&&this.propData.blurLinkageDemandPageModule.length>0){
        var moduleIdArray = [];
        this.propData.blurLinkageDemandPageModule.forEach(item=>{moduleIdArray.push(item.moduleId)});
        this.sendBroadcastMessage({
          type:"linkageDemand",
          message:selectObject,
          rangeModule:moduleIdArray,
          messageKey:this.propData.formFiledKey||this.propData.ctrlId
        })
      }
      if(this.propData.blurLinkageResultPageModule&&this.propData.blurLinkageResultPageModule.length>0){
        var moduleIdArray = [];
        this.propData.blurLinkageResultPageModule.forEach(item=>{moduleIdArray.push(item.moduleId)});
        this.sendBroadcastMessage({
          type:"linkageResult",
          message:selectObject,
          rangeModule:moduleIdArray,
          messageKey:this.propData.formFiledKey||this.propData.ctrlId
        })
      }
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
      console.log("组件收到消息:"+this.moduleObject.packageid, object);
      if(object.type&&object.type=="linkageResult"){
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
        }
        if(_thisValue){
          this.echoValue = _thisValue;
          this.thisValue = _thisValue;
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
        this.$refs["iinput" + this.moduleObject.id].focus();
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
      let that = this;
      let result = {
        success: true,
        message: "",
      };
      if(this.propData.defaultStatus=="readonly"){
        this.errorMessage = "";
        return result;
      }
      let thisInputVal = this.thisValue.trim();
      //这里开始判断执行是否需要校验
      if (this.propData.required && thisInputVal == "") {
        //必填
        result.success = false;
        result.message =
          this.propData.requiredText || this.propData.label + "不能为空";
      } else if (
        this.propData.minLength &&
        thisInputVal.length < this.propData.minLengthNumber
      ) {
        result.success = false;
        result.message =
          this.propData.minLengthText ||
          this.propData.label + "最小长度为" + this.propData.minLengthNumber;
      } else if (
        this.propData.maxLength &&
        thisInputVal.length > this.propData.maxLengthNumber
      ) {
        result.success = false;
        result.message =
          this.propData.maxLengthText ||
          this.propData.label + "最大长度为" + this.propData.maxLengthNumber;
      } else if (this.propData.customFun && this.propData.customFunCode) {
        try {
          var fun = IDM.express.eval(this.propData.customFunCode);
          if (!fun(thisInputVal)) {
            result.success = false;
            result.message =
              this.propData.customFunText || this.propData.label + "格式错误";
          }
        } catch (e) {}
      }else if(this.propData.interfaceVerify&&this.propData.interfaceVerifyUrl){
        //开启接口校验
        let urlObject = window.IDM.url.queryObject(),
        pageId = window.IDM.broadcast&&window.IDM.broadcast.pageModule?window.IDM.broadcast.pageModule.id:"";
        let paramObject = {
          urlData:JSON.stringify(urlObject),
          pageId,
          currentVal:thisInputVal
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
  watch: {
    thisValue: {
      handler() {
        this.verifyInputValue("change");
        this.change(this.thisValue);
      },
    },
  },
};
</script>
<style lang="scss">
@import "../style/formsCommon.scss";
</style>