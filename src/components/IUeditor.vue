<template>
    <div idm-ctrl="idm_module"
    :id="moduleObject.id" 
    :idm-ctrl-id="moduleObject.id" class="idm-forms-ueditor">
    <span class="editor-label">{{ propData.label }}</span>
    <VueUeditorWrap v-model="content" :editorDependencies="editorDependencies" class="ueditor-container" :config="editorConfig" @ready="ready"></VueUeditorWrap>
   </div>
</template>
<script>

import VueUeditorWrap from 'vue-ueditor-wrap'; 
export default {
name: 'IUeditor',
data() {
    return {
        moduleObject:{},
        propData:this.$root.propData.compositeAttr||{},
        content: '',
        editorDependencies: ['ueditor.config.js', 'ueditor.all.js']
    }
},
components: {
  VueUeditorWrap
},
computed: {
  editorConfig() {
    return {
      autoHeightEnabled: false,
      enableAutoSave: this.propData.enableAutoSave, //自动保存
      serverUrl: IDM.url.getWebPath('/external/ueditor/jsp/controller.jsp'),
      UEDITOR_HOME_URL: IDM.url.getWebPath('/external/ueditor/')
    }
  }
},
created() {
    this.moduleObject = this.$root.moduleObject
    this.convertAttrToStyleObject();
},
methods: {
  ready() {},
    propDataWatchHandle(propData){
        this.propData = propData.compositeAttr||{};
        this.convertAttrToStyleObject();
    },
    convertAttrToStyleObject(){
        var styleObject = {},
          labelStyleObject = {}
        for (const key in this.propData) {
          if (this.propData.hasOwnProperty.call(this.propData, key)) {
            const element = this.propData[key];
            if(!element&&element!==false&&element!=0){
              continue;
            }
            switch (key) {
              case "width":
              case "height":
                styleObject[key]=element;
                break;
              case 'box':
                IDM.style.setBoxStyle(styleObject, element)
                break
              case 'border':
                IDM.style.setBorderStyle(styleObject, element)
                break
              case 'labelBox': 
                IDM.style.setBoxStyle(labelStyleObject, element)
                break

            }
          }
        }
        window.IDM.setStyleToPageHead(this.moduleObject.id,styleObject);
        window.IDM.setStyleToPageHead(this.moduleObject.id + ' .editor-label', labelStyleObject);
        window.IDM.setStyleToPageHead(this.moduleObject.id + ' .edui-editor-toolbarbox', {
          display: this.propData.isShowToolBar ? 'block': 'none'
        });
        this.initData();
    },
    reload(){
        //请求数据源
        this.initData();
    },
    initData(){
        let that = this;
        //所有地址的url参数转换
        var params = that.commonParam();
        switch (this.propData.dataSourceType) {
          case "customInterface":
            this.propData.customInterfaceUrl&&window.IDM.http.get(this.propData.customInterfaceUrl,params)
            .then((res) => {
              //res.data
              that.$set(that.propData,"fontContent",that.getExpressData("resultData",that.propData.dataFiled,res.data));
              // that.propData.fontContent = ;
            })
            .catch(function (error) {});
            break;
          case "pageCommonInterface":
            //使用通用接口直接跳过，在setContextValue执行
            break;
          case "customFunction":
            if(this.propData.customFunction&&this.propData.customFunction.length>0){
              var resValue = "";
              try {
                resValue = window[this.propData.customFunction[0].name]&&window[this.propData.customFunction[0].name].call(this,{...params,...this.propData.customFunction[0].param,moduleObject:this.moduleObject});
              } catch (error) {
              }
              that.propData.fontContent = resValue;
            }
            break;
        }
      },
      getExpressData(dataName, dataFiled, resultData) {
        //给defaultValue设置dataFiled的值
        var _defaultVal = undefined;
        if (dataFiled) {
          var filedExp = dataFiled;
          filedExp = dataName + (filedExp.startsWiths("[") ? "" : ".") + filedExp;
          var dataObject = { IDM: window.IDM };
          dataObject[dataName] = resultData;
          _defaultVal = window.IDM.express.replace.call(
            this,
            "@[" + filedExp + "]",
            dataObject
          );
        }
        //对结果进行再次函数自定义
        if (
          this.propData.customFunction &&
          this.propData.customFunction.length > 0
        ) {
          var params = this.commonParam();
          var resValue = "";
          try {
            resValue =
              window[this.propData.customFunction[0].name] &&
              window[this.propData.customFunction[0].name].call(this, {
                ...params,
                ...this.propData.customFunction[0].param,
                moduleObject: this.moduleObject,
                expressData: _defaultVal,
                interfaceData: resultData,
              });
          } catch (error) {}
          _defaultVal = resValue;
        }
  
        return _defaultVal;
      },
      receiveBroadcastMessage(object){
        console.log("组件收到消息",object)
        if(object.type&&object.type=="linkageShowModule"){
          this.showThisModuleHandle();
        }else if(object.type&&object.type=="linkageHideModule"){
          this.hideThisModuleHandle();
        }
      },
      setContextValue(object) {
        console.log("统一接口设置的值", object);
        if (object.type != "pageCommonInterface") {
          return;
        }
        //这里使用的是子表，所以要循环匹配所有子表的属性然后再去设置修改默认值
        if (object.key == this.propData.dataName) {
          // this.propData.fontContent = this.getExpressData(this.propData.dataName,this.propData.dataFiled,object.data);
          this.$set(this.propData,"fontContent",this.getExpressData(this.propData.dataName,this.propData.dataFiled,object.data));
        }
      },
      sendBroadcastMessage(object){
        window.IDM.broadcast&&window.IDM.broadcast.send(object);
      },
      /**
     * 通用的url参数对象
     * 所有地址的url参数转换
     */
    commonParam(){
      let urlObject = IDM.url.queryObject();
      var params = {
        pageId:
          window.IDM.broadcast && window.IDM.broadcast.pageModule
            ? window.IDM.broadcast.pageModule.id
            : "",
        urlData: JSON.stringify(urlObject),
      };
      return params;
    },
}
};
</script>

<style lang="scss">
#edui1_bottombar {
  .edui-default{
    display: none;
  }
}
.ueditor-container{
  > .edui-default{
    height: 100%;
  }
    .edui-editor{
      width: 100% !important;
    }
    .edui-editor-iframeholder{
      height: 100% !important;
    }
  }
</style>

<style lang="scss" scoped>
.idm-forms-ueditor{
  display: flex;
  .ueditor-container{
    overflow: hidden;
    ::v-deep(.edui-editor){
      width: 100% !important;
    }
  }
}
</style>