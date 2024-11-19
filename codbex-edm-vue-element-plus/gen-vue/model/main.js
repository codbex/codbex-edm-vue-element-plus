import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
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
        this.$messageHub.subscribe(this.showMessage, 'app.showMessage');
        this.$messageHub.subscribe(this.showNotification, 'app.showNotification');
        this.$messageHub.subscribe(this.showConfirm, 'app.showConfirm');
    },
    data: function () {
        return {
            isNavigationCollapsed: false,
            dialogVisible: false,
            dialogTitle: null,
            dialogTopic: null,
            view: '/services/web/codbex-sample-vue-element-plus/components/Space/',
            navigation: [
                {
                    name: 'Employees',
                    menuItems: [
                        {
                            name: 'Employees',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/entities/Employees/'
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
            this.dialogVisible = true;
            this.dialogTitle = event.title;
            this.dialogPath = event.path;
            this.dialogTopic = event.dialogTopic;

            // TODO: Is there a better way how to handle data transfer?
            // This is a workaround, to ensue that the messageHub is loaded in the target dialog (iframe)
            setTimeout(() => {
                this.$messageHub.post({ data: event.dialogData }, event.dialogTopic);
            }, 500);
        },
        closeDialog() {
            this.dialogVisible = false;
            this.dialogTitle = null;
            this.dialogPath = null;
            this.dialogTopic = null;
        },
        confirmDialog() {
            this.$messageHub.post({}, `${this.dialogTopic}.confirm`);
        },
        showMessage(event) {
            ElMessage(event);
        },
        showNotification(event) {
            ElNotification(event);
        },
        async showConfirm(event) {
            try {
                await ElMessageBox.confirm(event.description, event.title, event.options);
                this.$messageHub.post({ isConfirmed: true }, event.confirmTopic);
            } catch (e) {
                this.$messageHub.post({ isConfirmed: false }, event.confirmTopic);
            }
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