import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { Plus } from '@element-plus/icons-vue'
import { createI18n } from 'vue-i18n'

import en from './locales/en.json' with { type: "json" };
import bg from './locales/bg.json' with { type: "json" };

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
            tourSearchInput: null,
            tourEditButton: null,
            tourDeleteButton: null,
            Plus: Plus,
        }
    },
    created() {
        this.$messageHub.subscribe(this.start, 'app.startTour');
        this.$messageHub.subscribe(this.changeLocale, 'app.changeLocale');
        this.$messageHub.subscribe(this.confirmDelete, 'app.Employees.confirmDelete');
        this.$messageHub.subscribe(this.refreshData, 'app.Employees.refreshData');
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
        start: function () {
            this.startTour = true;
        },
        showDetail: function (_index, entity) {
            this.$messageHub.post({
                title: 'Employee Details',
                path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/entities/Employees/dialog/index.html',
                dialogTopic: 'app.Employees.openDialog',
                dialogData: {
                    isPreview: true,
                    entity: JSON.parse(JSON.stringify(entity))
                },
            }, 'app.openDialog');
        },
        handleEdit: function (index, entity) {
            this.$messageHub.post({
                title: 'Update Employee',
                path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/entities/Employees/dialog/index.html',
                dialogTopic: 'app.Employees.openDialog',
                dialogData: {
                    isUpdate: true,
                    entity: JSON.parse(JSON.stringify(entity))
                },
            }, 'app.openDialog');
        },
        handleCreate: function () {
            this.$messageHub.post({
                title: 'Create Employee',
                path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/entities/Employees/dialog/index.html',
                dialogTopic: 'app.Employees.openDialog',
                dialogData: {
                    isCreate: true,
                },
            }, 'app.openDialog');
        },
        showErrorMessage: function (title, message) {
            this.$messageHub.post({
                title: title,
                message: message,
                type: 'error',
                duration: 0,
            }, 'app.showNotification');
        },
        handleDelete: async function (index, entity) {
            this.selectedIndex = index;
            this.selectedEntity = entity;
            const event = {
                title: 'Delete Employee?',
                description: 'Are you sure you want to delete Employee? This action cannot be undone.',
                options: {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No',
                    type: 'warning',
                },
                confirmTopic: 'app.Employees.confirmDelete',
            }
            this.$messageHub.post(event, 'app.showConfirm');
        },
        confirmDelete: async function (event) {
            if (event.isConfirmed) {
                try {
                    const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/entities/EmployeesService.ts/${this.selectedEntity.Id}`, { method: 'DELETE' })
                    if (response.status === 204) {
                        this.tableData.splice(this.selectedIndex, 1);
                        this.$messageHub.post({
                            message: `Entity was deleted successfully.`,
                            type: 'success',
                        }, 'app.showMessage');
                    } else {
                        const error = await response.json();
                        this.showErrorMessage('Failed to delete Employee', `Error message: ${error.message}`);
                    }
                } catch (e) {
                    const message = `Error message: ${e.message}`;
                    console.error(message, e);
                    this.showErrorMessage('Failed to delete Employee', message);
                }
            }
            this.selectedIndex = undefined;
            this.selectedEntity = undefined;
        },
        changeLocale: function (event) {
            i18n.global.locale = event.data;
        },
        refreshData: async function () {
            this.loading = true;

            const responseCount = await fetch('/services/ts/codbex-edm-vue-element-plus/gen/model/api/entities/EmployeesService.ts/count');
            if (!responseCount.ok) {
                const error = await responseCount.json();
                this.showErrorMessage('Failed to get Employees count', `Error message: ${error.message}`);
                throw new Error(`Response status: ${responseCount.status}`);
            }

            this.total = parseInt(await responseCount.text());

            const offset = (this.currentPage - 1) * this.pageSize;
            const limit = this.pageSize;

            const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/entities/EmployeesService.ts?$offset=${offset}&$limit=${limit}`);
            if (!response.ok) {
                const error = await response.json();
                this.showErrorMessage('Failed to load Employees', `Error message: ${error.message}`);
                throw new Error(`Response status: ${response.status}`);
            }

            setTimeout(async function (context) {
                context.loading = false
                context.tableData = await response.json();
            }, 1000, this);
        },
        handlePageChange: async function (currentPage, pageSize) {
            this.currentPage = currentPage;
            this.pageSize = pageSize;

            await this.refreshData();
        }
    },
    mounted: async function () {
        await this.refreshData();
    }
});

app.config.globalProperties.$messageHub = new FramesMessageHub();

app.use(i18n);
app.use(ElementPlus);
app.mount('#app');