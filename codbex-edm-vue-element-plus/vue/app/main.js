import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import * as icons from '@element-plus/icons-vue'

const app = createApp({
    setup() {
        return {
            ...icons
        }
    },
    created() {
        this.$messageHub.subscribe(this.openDialog, 'app.openDialog');
        this.$messageHub.subscribe(this.closeDialog, 'app.closeDialog');
    },
    data: function () {
        return {
            isNavigationCollapsed: false,
            dialogVisible: false,
            dialogTitle: null,
            view: '/services/web/codbex-sample-vue-element-plus/components/Space/',
            navigation: [
                {
                    name: 'Employees',
                    menuItems: [
                        {
                            name: 'Employees',
                            path: '/services/web/codbex-edm-vue-element-plus/vue/Employees/'
                        }, {
                            name: 'Organizations',
                            path: '/services/web/codbex-sample-vue-element-plus/components/Button/'
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
                                    path: '/services/web/codbex-sample-vue-element-plus/components/Checkbox/'
                                }, {
                                    name: 'Purchase Invoices',
                                    path: '/services/web/codbex-sample-vue-element-plus/components/ColorPicker/'
                                }, {
                                    name: 'Supplier Payments',
                                    path: '/services/web/codbex-sample-vue-element-plus/components/DatePicker/'
                                }
                            ]
                        },
                        {
                            name: 'Sales',
                            menuItems: [
                                {
                                    name: 'Sales Orders',
                                    path: '/services/web/codbex-sample-vue-element-plus/components/DateTimePicker/'
                                }, {
                                    name: 'Sales Invoices',
                                    path: '/services/web/codbex-sample-vue-element-plus/components/Dialog/'
                                }, {
                                    name: 'Customer Payments',
                                    path: '/services/web/codbex-sample-vue-element-plus/components/Form/'
                                }, {
                                    name: 'Debit Note',
                                    path: '/services/web/codbex-sample-vue-element-plus/components/LayoutContainer/'
                                }, {
                                    name: 'Credit Note',
                                    path: '/services/web/codbex-sample-vue-element-plus/components/Link/'
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
        openDialog(event) {
            debugger
            this.dialogVisible = true;
            this.dialogTitle = event.title;
            this.dialogPath = event.path;
        },
        closeDialog() {
            this.dialogVisible = false;
            this.dialogTitle = null;
            this.dialogPath = null;
        },
        handleSelect(key, keyPath) {
            this.view = key;
            console.log(key, keyPath)
        },
        openInNewTab(url) {
            window.open(url);
        },
        logout() {
            location.replace('/logout');
        }
    },
});


Object.keys(icons).forEach(iconName => app.component(iconName.toLowerCase(), icons[iconName]));

app.config.globalProperties.$messageHub = new FramesMessageHub();

app.use(ElementPlus);

app.mount('#app');
