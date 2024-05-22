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
            IDM.env_dev ? propData.label : "上传图片"
          }}</span>
        </div>
        <div
          class="fic-input-box"
          v-if="propData.defaultStatus != 'readonly'"
          :style="getStyle('content')"
        >
          <div :class="{ 'error-state': errorMessage }">
            <a-upload
              name="file"
              :list-type="propData.listStyle||'picture-card'"
              :file-list="thisValue"
              :customRequest="uploadImage"
              :multiple="propData.multipleMode||false"
              :accept="propData.uploadSuffix||'image/*'"
              @preview="handlePreview"
              @change="handleChange"
              :disabled="propData.defaultStatus == 'disabled'"
            >
              <template v-if="propData.listStyle=='picture-card'">
                <div v-if="thisValue.length < propData.maxUploadLength">
                  <a-icon type="plus" />
                  <div class="ant-upload-text">
                    {{propData.placeholder||'上传'}}
                  </div>
                </div>
              </template>
              <template v-else>
                <a-button class="ant-upload-btn" v-if="thisValue.length < propData.maxUploadLength"> <a-icon type="upload" /> {{propData.placeholder||'上传'}} </a-button>
              </template>
            </a-upload>
          </div>
        </div>
        <div
          class="fic-input-box fic-readonly-font"
          v-else
          :style="getStyle('content')"
        >
          <div :class="`ant-upload-list ant-upload-list-picture${propData.listStyle=='picture-card'?'-card':''}`">
            <div v-for="(item,index) in thisValue" :key="index" :class="propData.listStyle=='picture-card'?'ant-upload-list-picture-card-container':''">
              <span>
                <div @click="handlePreview(item)" style="cursor: pointer;" :class="`ant-upload-list-item ant-upload-list-item-done ant-upload-list-item-list-type-${propData.listStyle}`">
                  <div class="ant-upload-list-item-info">
                    <span>
                      <a class="ant-upload-list-item-thumbnail">
                      <img :src="item.url" :alt="item.name" class="ant-upload-list-item-image">
                      </a>
                      <a rel="noopener noreferrer" :title="item.name" class="ant-upload-list-item-name ant-upload-list-item-name-icon-count-1">
                      {{item.name}}
                      </a>
                    </span>
                  </div>
                  <span v-if="propData.listStyle=='picture-card'" class="ant-upload-list-item-actions">
                    <a rel="noopener noreferrer" title="Preview file">
                      <a-icon type="eye-o" />
                    </a>
                  </span>
                </div>
              </span>
            </div>
          </div>
        </div>
        <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
          <img alt="example" style="width: 100%" :src="previewImage" />
        </a-modal>
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
function iuploadimgGetBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

import 'ant-design-vue/lib/upload/style/css';
import {
  Upload
} from 'ant-design-vue';

export default {
  name: "IUploadImg",
  data() {
    return {
      errorMessage: "",
      thisValue: [
      ],
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {
        maxUploadLength: 2
      },
      previewVisible: false,
      previewImage: '',
    };
  },
  components: {
    [Upload.name]: Upload
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
        this.moduleObject.id + " .ant-upload-list-item-info a",
        styleObject
      );
    },
    /**
     * 把属性转换成文本框的样式(默认)
     */
    convertAttrToUploadDefaultStyle() {
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
              if (element.border.top.width > 0) {
                styleObject["border-top-width"] =
                  element.border.top.width + element.border.top.widthUnit;
                styleObject["border-top-style"] = element.border.top.style;
                if (element.border.top.colors.hex8) {
                  styleObject["border-top-color"] =
                    element.border.top.colors.hex8;
                }
              }
              if (element.border.right.width > 0) {
                styleObject["border-right-width"] =
                  element.border.right.width + element.border.right.widthUnit;
                styleObject["border-right-style"] = element.border.right.style;
                if (element.border.right.colors.hex8) {
                  styleObject["border-right-color"] =
                    element.border.right.colors.hex8;
                }
              }
              if (element.border.bottom.width > 0) {
                styleObject["border-bottom-width"] =
                  element.border.bottom.width + element.border.bottom.widthUnit;
                styleObject["border-bottom-style"] =
                  element.border.bottom.style;
                if (element.border.bottom.colors.hex8) {
                  styleObject["border-bottom-color"] =
                    element.border.bottom.colors.hex8;
                }
              }
              if (element.border.left.width > 0) {
                styleObject["border-left-width"] =
                  element.border.left.width + element.border.left.widthUnit;
                styleObject["border-left-style"] = element.border.left.style;
                if (element.border.left.colors.hex8) {
                  styleObject["border-left-color"] =
                    element.border.left.colors.hex8;
                }
              }

              styleObject["border-top-left-radius"] =
                element.radius.leftTop.radius +
                element.radius.leftTop.radiusUnit;
              styleObject["border-top-right-radius"] =
                element.radius.rightTop.radius +
                element.radius.rightTop.radiusUnit;
              styleObject["border-bottom-left-radius"] =
                element.radius.leftBottom.radius +
                element.radius.leftBottom.radiusUnit;
              styleObject["border-bottom-right-radius"] =
                element.radius.rightBottom.radius +
                element.radius.rightBottom.radiusUnit;
              break;
            case "contentEditFont":
              var styleObject1={};
              styleObject1["font-family"] = element.fontFamily;
              if (element.fontColors.hex8) {
                styleObject1["color"] = element.fontColors.hex8;
              }
              styleObject1["font-weight"] =
                element.fontWeight && element.fontWeight.split(" ")[0];
              styleObject1["font-style"] = element.fontStyle;
              styleObject1["font-size"] =
                element.fontSize + element.fontSizeUnit;
              styleObject1["line-height"] =
                element.fontLineHeight +
                (element.fontLineHeightUnit == "-"
                  ? ""
                  : element.fontLineHeightUnit);
              styleObject1["text-align"] = element.fontTextAlign;
              styleObject1["text-decoration"] = element.fontDecoration;

              window.IDM.setStyleToPageHead(
                this.moduleObject.id + " .ant-upload,#"+this.moduleObject.id + " .ant-upload-btn",
                styleObject1
              );
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .ant-upload-list-item",
        styleObject
      );
    },
    /**
     * 把属性转换成文本框的样式(焦点)
     */
    convertAttrToUploadFoucsStyle() {
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
              if (element.border.top.width > 0) {
                styleObject["border-top-width"] =
                  element.border.top.width + element.border.top.widthUnit;
                styleObject["border-top-style"] = element.border.top.style;
                if (element.border.top.colors.hex8) {
                  styleObject["border-top-color"] =
                    element.border.top.colors.hex8;
                }
              }
              if (element.border.right.width > 0) {
                styleObject["border-right-width"] =
                  element.border.right.width + element.border.right.widthUnit;
                styleObject["border-right-style"] = element.border.right.style;
                if (element.border.right.colors.hex8) {
                  styleObject["border-right-color"] =
                    element.border.right.colors.hex8;
                }
              }
              if (element.border.bottom.width > 0) {
                styleObject["border-bottom-width"] =
                  element.border.bottom.width + element.border.bottom.widthUnit;
                styleObject["border-bottom-style"] =
                  element.border.bottom.style;
                if (element.border.bottom.colors.hex8) {
                  styleObject["border-bottom-color"] =
                    element.border.bottom.colors.hex8;
                }
              }
              if (element.border.left.width > 0) {
                styleObject["border-left-width"] =
                  element.border.left.width + element.border.left.widthUnit;
                styleObject["border-left-style"] = element.border.left.style;
                if (element.border.left.colors.hex8) {
                  styleObject["border-left-color"] =
                    element.border.left.colors.hex8;
                }
              }

              styleObject["border-top-left-radius"] =
                element.radius.leftTop.radius +
                element.radius.leftTop.radiusUnit;
              styleObject["border-top-right-radius"] =
                element.radius.rightTop.radius +
                element.radius.rightTop.radiusUnit;
              styleObject["border-bottom-left-radius"] =
                element.radius.leftBottom.radius +
                element.radius.leftBottom.radiusUnit;
              styleObject["border-bottom-right-radius"] =
                element.radius.rightBottom.radius +
                element.radius.rightBottom.radiusUnit;
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .ant-upload.ant-upload-select-picture-card,#"+this.moduleObject.id + " .ant-upload-btn",
        styleObject
      );
    },
    /**
     * 把属性转换成文本框的样式(错误提示)
     */
    convertAttrToUploadErrorStyle() {
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
              if (element.border.top.width > 0) {
                styleObject["border-top-width"] =
                  element.border.top.width + element.border.top.widthUnit;
                styleObject["border-top-style"] = element.border.top.style;
                if (element.border.top.colors.hex8) {
                  styleObject["border-top-color"] =
                    element.border.top.colors.hex8;
                }
              }
              if (element.border.right.width > 0) {
                styleObject["border-right-width"] =
                  element.border.right.width + element.border.right.widthUnit;
                styleObject["border-right-style"] = element.border.right.style;
                if (element.border.right.colors.hex8) {
                  styleObject["border-right-color"] =
                    element.border.right.colors.hex8;
                }
              }
              if (element.border.bottom.width > 0) {
                styleObject["border-bottom-width"] =
                  element.border.bottom.width + element.border.bottom.widthUnit;
                styleObject["border-bottom-style"] =
                  element.border.bottom.style;
                if (element.border.bottom.colors.hex8) {
                  styleObject["border-bottom-color"] =
                    element.border.bottom.colors.hex8;
                }
              }
              if (element.border.left.width > 0) {
                styleObject["border-left-width"] =
                  element.border.left.width + element.border.left.widthUnit;
                styleObject["border-left-style"] = element.border.left.style;
                if (element.border.left.colors.hex8) {
                  styleObject["border-left-color"] =
                    element.border.left.colors.hex8;
                }
              }

              styleObject["border-top-left-radius"] =
                element.radius.leftTop.radius +
                element.radius.leftTop.radiusUnit;
              styleObject["border-top-right-radius"] =
                element.radius.rightTop.radius +
                element.radius.rightTop.radiusUnit;
              styleObject["border-bottom-left-radius"] =
                element.radius.leftBottom.radius +
                element.radius.leftBottom.radiusUnit;
              styleObject["border-bottom-right-radius"] =
                element.radius.rightBottom.radius +
                element.radius.rightBottom.radiusUnit;
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
      //默认值
      // this.thisValue = this.propData.defaultValue || [];
      this.convertAttrToUploadDefaultStyle();
      this.convertAttrToReadOnlyFontStyle();
      this.convertAttrToLabelFontStyle();
      this.convertAttrToErrorMsgFontStyle();
      this.convertAttrToUploadErrorStyle();
      this.convertAttrToUploadFoucsStyle();
      //增加最小最大必填校验

      //样式修改
    },
    // 上传头像
    uploadImage(file) {
      if(!this.propData.uploadUrl){
        return;
      }
      let that = this;
      let newObject = {
        uid: new Date().getTime()+IDM.uuid(),
        name: file.file.name,
        status: 'uploading',
        // url: IDM.url.getWebPath(resultData.filePath),
      }
      that.thisValue.push(newObject);
      IDM.http.upload(this.propData.uploadUrl,file.file,{"type":"forms_uploadimage_ctrl",...IDM.setting.webRoot}).then(res=>{
        var resultData = res.data.data;
        /**
         * 返回结果：
         * {
         * fileName: "tab设置.png"
         * filePath: "/upload/idmfiles\f22081da-9410-40bc-afa0-6b3106c45c1c.png"
         * fileSize: "218KB"
         * }
         */
        // console.log("上传数据结果",resultData);
        newObject.status = "done";
        newObject.url = IDM.url.getWebPath(resultData.filePath);
        newObject.ourl = resultData.filePath;
        //方便其他地方使用
        newObject.src = newObject.ourl;
        newObject.size = resultData.fileSize;
        newObject.width = resultData.imageWidth;
        newObject.height = resultData.imageHeight;
        // this.visible = !this.visible;
        // this.spinning = !this.spinning;

        // this.$message.success(`${file.file.name} 上传成功.`);
      }).catch(err=>{
        // this.$message.error(`${file.file.name} 上传失败.`);
        newObject.status = "error";
      });
    },
    handleCancel() {
      this.previewVisible = false;
    },
    async handlePreview(file) {
      if (!file.url && !file.preview) {
        file.preview = await iuploadimgGetBase64(file.originFileObj);
      }
      this.previewImage = file.url || file.preview;
      this.previewVisible = true;
    },
    handleChange({ fileList }) {
      // this.fileList = fileList;
      this.thisValue.forEach((fitem,index)=>{
        const isExists = fileList.filter(item=>item.uid==fitem.uid);
        if(!isExists||(isExists&&isExists.length==0)){
          this.thisValue.splice(index, 1)
        }
      })
    },
    /**
     * 重置组件的默认值
     */
    resetDefaultValue(object){
      this.thisValue = [];
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
      let thisInputVal = this.thisValue;
      //这里开始判断执行是否需要校验
      if (this.propData.required && thisInputVal.length==0) {
        //必填
        result.success = false;
        result.message =
          this.propData.requiredText || this.propData.label + "不能为空";
      }
      
       else if (
        this.propData.minSize &&
        thisInputVal.length < this.propData.minSizeNumber
      ) {
        result.success = false;
        result.message =
          this.propData.minSizeText ||
          this.propData.label + "最少值为" + this.propData.minSizeNumber;
      } else if (
        this.propData.maxSize &&
        thisInputVal.length > this.propData.maxSizeNumber
      ) {
        result.success = false;
        result.message =
          this.propData.maxSizeText ||
          this.propData.label + "最多值为" + this.propData.maxSizeNumber;
      }
      else if (this.propData.customFun && this.propData.customFunCode) {
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
  watch: {
    thisValue: {
      handler() {
        this.verifyInputValue("change");
      },
    },
  },
};
</script>
<style lang="scss">
@import "../style/formsCommon.scss";
</style>