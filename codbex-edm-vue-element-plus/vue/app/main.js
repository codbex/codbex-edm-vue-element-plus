import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { ElMessage } from 'element-plus'
import * as icons from '@element-plus/icons-vue'

import { ref } from 'vue'

const activeIndex = ref('1')
const activeIndex2 = ref('1')
const value1 = ref('Option1')
const value2 = ref(['Option1'])

const app = createApp({
    setup() {
        return {
            ...icons
        }
    },
    created() {
        this.$messageHub.subscribe(this.handleMessage, 'vue.test');
    },
    data: function () {
        return {
            isCollapse: false,
            dialogDetailVisible: true,
            view: '/services/web/codbex-sample-vue-element-plus/components/Space/index.html',
            sampleTitle: 'Button - Basic usage',
            sampleUrl: 'https://element-plus.org/en-US/component/button.html#basic-usage',
            activeIndex: activeIndex,
            activeIndex2: activeIndex2,
            activities: [
                {
                    content: 'Event start',
                    timestamp: '2018-04-15',
                },
                {
                    content: 'Approved',
                    timestamp: '2018-04-13',
                },
                {
                    content: 'Success',
                    timestamp: '2018-04-11',
                },
            ],
            tableData: [
                {
                    date: '2016-05-03',
                    name: 'Tom',
                    address: 'No. 189, Grove St, Los Angeles',
                },
                {
                    date: '2016-05-02',
                    name: 'Tom',
                    address: 'No. 189, Grove St, Los Angeles',
                },
                {
                    date: '2016-05-04',
                    name: 'Tom',
                    address: 'No. 189, Grove St, Los Angeles',
                },
                {
                    date: '2016-05-01',
                    name: 'Tom',
                    address: 'No. 189, Grove St, Los Angeles',
                },
            ],
            options: [
                {
                    value: 'Option1',
                    label: 'Label1',
                },
                {
                    value: 'Option2',
                    label: 'Label2',
                },
                {
                    value: 'Option3',
                    label: 'Label3',
                },
                {
                    value: 'Option4',
                    label: 'Label4',
                },
                {
                    value: 'Option5',
                    label: 'Label5',
                }
            ],
            value1: value1,
            value2: value2,
            navigation: [
                {
                    name: 'Employees',
                    menuItems: [
                        {
                            name: 'Employees',
                            path: '/services/web/codbex-edm-vue-element-plus/vue/Employees/index.html'
                        }, {
                            name: 'Organizations',
                            path: '/services/web/codbex-sample-vue-element-plus/components/Button/index.html'
                        }
                    ]
                },
                {
                    name: 'Documents',
                    subMenus: [
                        {
                            name: 'Purchasing',
                            menuItems: [
                                {
                                    name: 'Purchase Orders',
                                    path: '/services/web/codbex-sample-vue-element-plus/components/Checkbox/index.html'
                                }, {
                                    name: 'Purchase Invoices',
                                    path: '/services/web/codbex-sample-vue-element-plus/components/ColorPicker/index.html'
                                }, {
                                    name: 'Supplier Payments',
                                    path: '/services/web/codbex-sample-vue-element-plus/components/DatePicker/index.html'
                                }
                            ]
                        },
                        {
                            name: 'Sales',
                            menuItems: [
                                {
                                    name: 'Sales Orders',
                                    path: '/services/web/codbex-sample-vue-element-plus/components/DateTimePicker/index.html'
                                }, {
                                    name: 'Sales Invoices',
                                    path: '/services/web/codbex-sample-vue-element-plus/components/Dialog/index.html'
                                }, {
                                    name: 'Customer Payments',
                                    path: '/services/web/codbex-sample-vue-element-plus/components/Form/index.html'
                                }, {
                                    name: 'Debit Note',
                                    path: '/services/web/codbex-sample-vue-element-plus/components/LayoutContainer/index.html'
                                }, {
                                    name: 'Credit Note',
                                    path: '/services/web/codbex-sample-vue-element-plus/components/Link/index.html'
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    },
    methods: {
        changeLocale(locale) {
            this.$messageHub.post(locale, 'app.changeLocale');
        },
        startTour() {
            this.$messageHub.post({}, 'app.startTour');
        },
        handleMessage(event) {
            ElMessage({
                message: `Message Hub Integrated! key = ${event.key}, keyPath = ${event.keyPath}`,
                type: 'success',
            });
        },
        handleSelect(key, keyPath) {
            this.$messageHub.post({
                key: key,
                keyPath: keyPath
            }, 'vue.test');
            this.view = key;
            console.log(key, keyPath)
        },
    },
});


Object.keys(icons).forEach(iconName => app.component(iconName.toLowerCase(), icons[iconName]));

app.config.globalProperties.$messageHub = new FramesMessageHub();

app.use(ElementPlus);

app.mount('#app');
