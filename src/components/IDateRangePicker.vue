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
        <a-range-picker
            v-model="thisValue"
            :format="propData.format"
            :locale="locale"
            :allowClear="false"
        >
        </a-range-picker>
    </div>
</template>

<script>
import 'moment/locale/zh-cn'
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
export default {
    data() {
        return {
            locale,
            thisValue: [],
            moduleObject: {},
            propData: this.$root.propData.compositeAttr || {},
        }
    },
    props: {},
    created() {
        this.moduleObject = this.$root.moduleObject
    },
    mounted() {
        this.setDefaultValue()
    },
    methods: {
        setDefaultValue() {
            this.thisValue = window.IDM.invokeCustomFunctions
                .call(this, this.propData.defaultValueFuncs)
                .flat()
        },
        /**
         * 提供父级组件调用的刷新prop数据组件
         */
        propDataWatchHandle(propData) {
            this.propData = propData.compositeAttr || {}
        },

        /**
         * 结果值绑定
         */
        valueBind(byValData) {
            let that = this
            switch (this.propData.resType) {
                case 'interfaceParam':
                    let urlObject = window.IDM.url.queryObject(),
                        pageId =
                            window.IDM.broadcast &&
                            window.IDM.broadcast.pageModule
                                ? window.IDM.broadcast.pageModule.id
                                : ''
                    let paramObject = {
                        urlData: JSON.stringify(urlObject),
                        pageId,
                    }
                    paramObject[this.propData.resInterfaceParam] =
                        JSON.stringify(byValData)
                    this.propData.resInterfaceUrl &&
                        window.IDM.http
                            .get(this.propData.resInterfaceUrl, paramObject)
                            .then(res => {
                                if (res.data.code == 200) {
                                    that.thisValue = res.data.data
                                } else {
                                    that.thisValue = ''
                                }
                            })
                    break
                case 'resultVal':
                    let newValue = byValData
                    if (this.propData.resResultValField) {
                        //填写了
                        newValue = window.IDM.express.replace.call(
                            this,
                            '@[' + this.propData.resResultValField + ']',
                            byValData
                        )
                    }
                    this.thisValue = newValue
                    break
                case 'customFun':
                    if (
                        this.propData.resFunction &&
                        this.propData.resFunction.length > 0
                    ) {
                        var resValue = ''
                        try {
                            resValue =
                                window[this.propData.resFunction[0].name] &&
                                window[this.propData.resFunction[0].name].call(
                                    this,
                                    {
                                        ...this.propData.resFunction[0].param,
                                        moduleObject: this.moduleObject,
                                        byVal: byValData,
                                    }
                                )
                        } catch (error) {}
                        this.thisValue = resValue
                    }
                    break
            }
        },

        /**
         * 内容变更事件
         */
        change(value) {
            if (this.propData.linkageDemandPageModule?.length > 0) {
                this.sendBroadcastMessage({
                    type: 'linkageDemand',
                    message: value,
                    rangeModule: this.propData.linkageDemandPageModule.map(
                        n => n.moduleId
                    ),
                    messageKey: this.propData.ctrlId,
                })
            }
            if (this.propData.linkageResultPageModule?.length > 0) {
                this.sendBroadcastMessage({
                    type: 'linkageResult',
                    message: value,
                    rangeModule: this.propData.linkageResultPageModule.map(
                        n => n.moduleId
                    ),
                    messageKey: this.propData.ctrlId,
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
            console.log('组件收到消息:' + this.moduleObject.packageid, object)
            if (object.type && object.type == 'linkageResult') {
                if (
                    window.IDM.getExpressData(
                        this.propData.resCondition,
                        object
                    )
                ) {
                    this.valueBind(object.message)
                }
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
            window.IDM.broadcast && window.IDM.broadcast.send(object)
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
            console.log('统一接口设置的值', object)
            if (object.type != 'pageCommonInterface') {
                return
            }
            //先取出回显的值
            if (object.key == this.propData.echoDataName) {
                var filedExp, _thisValue
                switch (this.propData.echoType) {
                    case 'customFiled': //自定义字段
                        filedExp = this.propData.echoDataFiled
                        break
                    case 'customFunction': //自定义函数
                        if (
                            this.propData.echoFunction &&
                            this.propData.echoFunction.length > 0
                        ) {
                            try {
                                let param = {
                                    ...this.propData.echoFunction[0].param,
                                    moduleObject: this.moduleObject,
                                    optionList: this.optionList,
                                }
                                param[this.propData.echoDataName] = object.data
                                _thisValue =
                                    window[
                                        this.propData.echoFunction[0].name
                                    ] &&
                                    window[
                                        this.propData.echoFunction[0].name
                                    ].call(this, param)
                            } catch (error) {}
                        }
                        break
                    default:
                        //同表单标识
                        filedExp =
                            this.propData.formFiledKey || this.propData.ctrlId
                        break
                }

                var dataObject = { IDM: window.IDM }
                dataObject[this.propData.echoDataName] = object.data

                if (filedExp) {
                    filedExp =
                        this.propData.echoDataName +
                        (filedExp.startsWiths('[') ? '' : '.') +
                        filedExp
                    _thisValue = window.IDM.express.replace.call(
                        this,
                        '@[' + filedExp + ']',
                        dataObject
                    )
                }
                if (_thisValue) {
                    this.echoValue = _thisValue
                    this.thisValue = _thisValue
                }
                //取出控件的状态，给propData.defaultStatus赋值,如果为readonly时需要重新readonlyValueSet();
                var stateFiledExp, newState
                stateFiledExp = this.propData.stateDataFiled
                if (stateFiledExp) {
                    stateFiledExp =
                        this.propData.echoDataName +
                        (stateFiledExp.startsWiths('[') ? '' : '.') +
                        stateFiledExp
                    newState = window.IDM.express.replace.call(
                        this,
                        '@[' + filedExp + ']',
                        dataObject
                    )
                }
                if (
                    this.propData.stateFunction &&
                    this.propData.stateFunction.length > 0
                ) {
                    try {
                        let param = {
                            ...this.propData.stateFunction[0].param,
                            moduleObject: this.moduleObject,
                            optionList: this.optionList,
                            ...newState,
                        }
                        param[this.propData.echoDataName] = object.data
                        newState =
                            window[this.propData.stateFunction[0].name] &&
                            window[this.propData.stateFunction[0].name].call(
                                this,
                                param
                            )
                    } catch (error) {}
                }
                if (newState) {
                    this.propData.defaultStatus = newState
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
                type: 'success',
                message: '',
                key: this.propData.formFiledKey || this.propData.ctrlId,
            }
            if (!this.verifyInputValue().success) {
                result.type = 'error'
                result.message = this.verifyInputValue().message
                if (!this.propData.password) {
                    this.$refs['iinput' + this.moduleObject.id].focus()
                } else {
                    this.$refs['iinputpwd' + this.moduleObject.id].focus()
                }
            } else {
                result.data = this.thisValue
            }
            return result
        },
    },
    watch: {
        thisValue: {
            handler() {
                this.change(this.thisValue)
            },
        },
    },
}
</script>
<style lang="scss">
@import '../style/formsCommon.scss';
</style>
