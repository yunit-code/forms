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
            IDM.env_dev ? propData.label : "字体图标"
          }}</span>
        </div>
        <div
          class="fic-input-box"
          v-if="propData.defaultStatus != 'readonly'"
          :style="getStyle('content')"
        >
          <div
            :ref="'iiconselect' + moduleObject.id"
            :class="{ 'error-state': errorMessage }"
            class="fic-icon-box"
          >
            <template v-if="propData.multipleSelect">
              <div
                v-for="(item, index) in thisValue"
                :key="index"
                class="fic-icon-inner-box"
              >
                <i class="fic-icon-show" :class="item"></i>
              </div>
            </template>
            <template v-else-if="thisValue">
              <div class="fic-icon-inner-box">
                <i class="fic-icon-show" :class="thisValue"></i>
              </div>
            </template>

            <a-popover
              v-if="propData.defaultStatus != 'disabled'"
              trigger="click"
              placement="bottomLeft"
              :overlayClassName="'fic_common_popover'"
            >
              <template slot="content">
                <div
                  class="fic_common_popover_content"
                  :class="`popover_` + moduleObject.id"
                >
                  <div
                    class="fic_tipinfo"
                    v-if="propData.multipleSelect && showClickMsg"
                  >
                    <a-alert
                      :message="`最多只能选择${propData.multipleMaxCount}项`"
                      type="warning"
                      closable
                    />
                  </div>
                  <div
                    v-for="(item, index) in iconJsonInfo.glyphs"
                    :key="index"
                    class="fic-icon-item-wrapper"
                    @click="iconClick(item)"
                  >
                    <a-tooltip :title="item.name">
                      <div class="fic-icon-item-node">
                        <i
                          :class="`${iconJsonInfo.font_family} ${iconJsonInfo.css_prefix_text}${item.font_class}`"
                        ></i>
                      </div>
                      <!--是否选中效果-->
                      <div class="check_layer" v-if="item.active">
                        <a-icon type="check" class="check_icon" />
                      </div>
                    </a-tooltip>
                  </div>
                </div>
              </template>
              <a-button type="link" style="padding: 0px 10px"> 选择 </a-button>
            </a-popover>
            <a-button
              v-if="propData.defaultStatus == 'disabled'"
              disabled
              type="link"
              style="padding: 0px 10px"
            >
              选择
            </a-button>
            <a-button
              :disabled="propData.defaultStatus == 'disabled'"
              v-if="thisValue.length > 0"
              @click="clearValue"
              type="link"
              style="padding: 0px 10px"
            >
              清空
            </a-button>
          </div>
        </div>
        <div
          class="fic-input-box fic-readonly-font"
          v-else
          :style="getStyle('content')"
        >
          <div class="fic-icon-box">
            <template v-if="propData.multipleSelect">
              <div
                v-for="(item, index) in thisValue"
                :key="index"
                class="fic-icon-inner-box"
              >
                <i class="fic-icon-show" :class="item"></i>
              </div>
            </template>
            <template v-else-if="thisValue">
              <div class="fic-icon-inner-box">
                <i class="fic-icon-show" :class="thisValue"></i>
              </div>
            </template>
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
export default {
  name: "IIconselect",
  data() {
    return {
      errorMessage: "",
      thisValue: "",
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      iconJsonInfo: { glyphs: [] },
      showClickMsg: false,
    };
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
              styleObject["font-family"] = element.fontFamily;
              if (element.fontColors.hex8) {
                styleObject["color"] = element.fontColors.hex8;
                styleObject1["color"] = element.fontColors.hex8;
              }
              styleObject["font-weight"] =
                element.fontWeight && element.fontWeight.split(" ")[0];
              styleObject["font-style"] = element.fontStyle;
              styleObject["font-size"] =
                element.fontSize + element.fontSizeUnit;
              styleObject1["font-size"] =
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
        this.moduleObject.id + " .fic-readonly-font .fic-icon-inner-box",
        styleObject
      );
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .fic-readonly-font .fic-icon-inner-box>i",
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
                    " .fic-icon-item-wrapper .check_layer",
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
              if (element.marginTopVal) {
                styleObject["margin-top"] = `${element.marginTopVal}`;
              }
              if (element.marginRightVal) {
                styleObject["margin-right"] = `${element.marginRightVal}`;
              }
              if (element.marginBottomVal) {
                styleObject["margin-bottom"] = `${element.marginBottomVal}`;
              }
              if (element.marginLeftVal) {
                styleObject["margin-left"] = `${element.marginLeftVal}`;
              }
              if (element.paddingTopVal) {
                styleObject["padding-top"] = `${element.paddingTopVal}`;
              }
              if (element.paddingRightVal) {
                styleObject["padding-right"] = `${element.paddingRightVal}`;
              }
              if (element.paddingBottomVal) {
                styleObject["padding-bottom"] = `${element.paddingBottomVal}`;
              }
              if (element.paddingLeftVal) {
                styleObject["padding-left"] = `${element.paddingLeftVal}`;
              }
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
              var styleObject1 = {};
              styleObject["font-family"] = element.fontFamily;
              if (element.fontColors.hex8) {
                styleObject["color"] = element.fontColors.hex8;
                styleObject1["color"] = styleObject["color"];
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
              styleObject1["font-size"] = styleObject["font-size"];
              window.IDM.setStyleToPageHead(
                this.moduleObject.id + " .fic-icon-inner-box>i",
                styleObject1
              );
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .fic-icon-inner-box",
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
      //判断是否有填写图标库地址
      if (this.propData.iconfonturl) {
        let baseUrl =
          this.propData.iconfonturl +
          (this.propData.iconfonturl.substring(
            this.propData.iconfonturl.length - 1,
            this.propData.iconfonturl.length
          ) == "/"
            ? ""
            : "/");
        IDM.http
          .get(baseUrl + "iconfont.json", {})
          .then((res) => {
            if (!res.data) {
              return;
            }
            that.iconJsonInfo = res.data;
            //存在，加载css
            IDM.module.loadCss(
              IDM.url.getWebPath(baseUrl + "iconfont.css"),
              true
            );
            that.setPopoverListStatus();
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    },
    iconClick(fitem) {
      let hasExists = false;
      if (this.propData.multipleSelect) {
        this.thisValue.forEach((item, index) => {
          if (
            this.iconJsonInfo.font_family +
              " " +
              this.iconJsonInfo.css_prefix_text +
              fitem.font_class ==
            item
          ) {
            hasExists = true;
            this.thisValue.splice(index, 1);
          }
        });
      } else if (
        this.iconJsonInfo.font_family +
          " " +
          this.iconJsonInfo.css_prefix_text +
          fitem.font_class ==
        this.thisValue
      ) {
        hasExists = true;
        this.thisValue = "";
      }
      if (!hasExists) {
        const newClass =
          this.iconJsonInfo.font_family +
          " " +
          this.iconJsonInfo.css_prefix_text +
          fitem.font_class;
        if (this.propData.multipleSelect) {
          if (
            this.propData.multipleMaxCount &&
            this.propData.multipleMaxCount <= this.thisValue.length
          ) {
            //不能选择
            this.showClickMsg = true;
            setTimeout(() => {
              this.showClickMsg = false;
            }, 3000);
          } else {
            fitem.active = true;
            this.thisValue.push(newClass);
          }
        } else {
          this.thisValue = newClass;
          this.setPopoverListStatus();
        }
      } else {
        fitem.active = false;
      }
      this.verifyInputValue("change");
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
      this.setPopoverListStatus();
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
        }
        if(_thisValue){
          this.thisValue = _thisValue;
          this.setPopoverListStatus();
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
          var fun = eval(this.propData.customFunCode);
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
.fic-icon-box {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  .fic-icon-inner-box {
    padding: 0px 5px;
    border: 1px solid #eee;
    margin-right: 2px;
    margin-top: 2px;
    > i {
      font-size: 16px;
    }
  }
}
</style>