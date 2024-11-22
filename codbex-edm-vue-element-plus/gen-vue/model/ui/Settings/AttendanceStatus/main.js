import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { Plus } from '@element-plus/icons-vue'
import { createI18n } from 'vue-i18n'

import en from '../../locales/en.json' with { type: "json" };
import bg from '../../locales/bg.json' with { type: "json" };

const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
        en: en,
        bg: bg,
    }
});

const app = createApp({
    setup() {
        return {
            tourButtonCreate: null,
            tourButtonDetail: null,
            tourButtonEdit: null,
            tourButtonDelete: null,
            Plus: Plus,
        }
    },
    created() {
        this.$messageHub.subscribe(this.onStartToure, 'app.startTour');
        this.$messageHub.subscribe(this.onChangeLocale, 'app.changeLocale');
        this.$messageHub.subscribe(this.onConfirmDelete, 'app.Settings.AttendanceStatus.confirmDelete');
        this.$messageHub.subscribe(this.refreshData, 'app.Settings.AttendanceStatus.refreshData');
    },
    data: function () {
        return {
            currentPage: 1,
            pageSize: 10,
            total: 0,
            startTour: false,
            loading: true,
            tableData: [],
            dialogDetailVisible: false,
            dialogEditVisible: false,
            dialogCreateVisible: false,
            selectedEntity: null,
            selectedEntityIndex: null,
        };
    },
    methods: {
        showDetail: function (_index, entity) {
            this.$messageHub.post({
                title: 'app.Settings.AttendanceStatus.dialog.Detail',
                path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/Settings/AttendanceStatus/dialog/index.html',
                dialogTopic: 'app.Settings.AttendanceStatus.openDialog',
                dialogData: {
                    isPreview: true,
                    entity: JSON.parse(JSON.stringify(entity))
                },
            }, 'app.openDialog');
        },
        handleEdit: function (index, entity) {
            this.$messageHub.post({
                title: 'app.Settings.AttendanceStatus.dialog.Edit',
                path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/Settings/AttendanceStatus/dialog/index.html',
                dialogTopic: 'app.Settings.AttendanceStatus.openDialog',
                dialogData: {
                    isUpdate: true,
                    entity: JSON.parse(JSON.stringify(entity))
                },
            }, 'app.openDialog');
        },
        handleCreate: function () {
            this.$messageHub.post({
                title: 'app.Settings.AttendanceStatus.dialog.Create',
                path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/Settings/AttendanceStatus/dialog/index.html',
                dialogTopic: 'app.Settings.AttendanceStatus.openDialog',
                dialogData: {
                    isCreate: true,
                },
            }, 'app.openDialog');
        },
        handleDelete: async function (index, entity) {
            this.selectedIndex = index;
            this.selectedEntity = entity;
            const event = {
                title: 'Delete Attendance Status?',
                description: 'Are you sure you want to delete Attendance Status? This action cannot be undone.',
                options: {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No',
                    type: 'warning',
                },
                confirmTopic: 'app.Settings.AttendanceStatus.confirmDelete',
            }
            this.$messageHub.post(event, 'app.showConfirm');
        },
        handlePageChange: async function (currentPage, pageSize) {
            this.currentPage = currentPage;
            this.pageSize = pageSize;

            await this.refreshData();
        },
        showErrorMessage: function (title, message) {
            this.$messageHub.post({
                title: title,
                message: message,
                type: 'error',
                duration: 0,
            }, 'app.showNotification');
        },
        onStartToure: function () {
            this.startTour = true;
        },
        onConfirmDelete: async function (event) {
            if (event.isConfirmed) {
                try {
                    const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/AttendanceStatusService.ts/${this.selectedEntity.Id}`, { method: 'DELETE' })
                    if (response.status === 204) {
                        this.tableData.splice(this.selectedIndex, 1);
                        this.$messageHub.post({
                            message: `Attendance Status was deleted successfully.`,
                            type: 'success',
                        }, 'app.showMessage');
                    } else {
                        const error = await response.json();
                        this.showErrorMessage('Failed to delete Attendance Status', `Error message: ${error.message}`);
                    }
                } catch (e) {
                    const message = `Error message: ${e.message}`;
                    console.error(message, e);
                    this.showErrorMessage('Failed to delete Attendance Status', message);
                }
            }
            this.selectedIndex = undefined;
            this.selectedEntity = undefined;
        },
        onChangeLocale: function (event) {
            i18n.global.locale = event.data;
        },
        refreshData: async function () {
            this.loading = true;

            const responseCount = await fetch('/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/AttendanceStatusService.ts/count');
            if (!responseCount.ok) {
                const error = await responseCount.json();
                this.showErrorMessage('Failed to get Attendance Status count', `Error message: ${error.message}`);
                throw new Error(`Response status: ${responseCount.status}`);
            }

            this.total = parseInt(await responseCount.text());

            const offset = (this.currentPage - 1) * this.pageSize;
            const limit = this.pageSize;

            const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/AttendanceStatusService.ts?$offset=${offset}&$limit=${limit}`);
            if (!response.ok) {
                const error = await response.json();
                this.showErrorMessage('Failed to load Attendance Status', `Error message: ${error.message}`);
                throw new Error(`Response status: ${response.status}`);
            }
            this.tableData = await response.json();


            this.loading = false
        },
    },
    mounted: async function () {
        await this.refreshData();
    }
});

app.config.globalProperties.$messageHub = new FramesMessageHub();

app.use(i18n);
app.use(ElementPlus);
app.mount('#app');
