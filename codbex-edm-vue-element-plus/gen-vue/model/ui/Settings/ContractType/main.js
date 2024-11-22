import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { Plus } from '@element-plus/icons-vue'
import { createI18n } from 'vue-i18n'
import { View } from '../../common/View.js';

import en from '../../locales/en.json' with { type: "json" };
import bg from '../../locales/bg.json' with { type: "json" };


const view = new View({
    topic: 'app.Settings.ContractType.openDialog',
    path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/Settings/ContractType/dialog/index.html',
});

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
        view.subscribe('app.startTour', this.onStartToure);
        view.subscribe('app.changeLocale', this.onChangeLocale);
        view.subscribe('app.Settings.ContractType.confirmDelete', this.onConfirmDelete);
        view.subscribe('app.Settings.ContractType.refreshData', this.refreshData);
    },
    data: function () {
        return {
            currentPage: 1,
            pageSize: 10,
            total: 0,
            startTour: false,
            loading: true,
            tableData: [],
            selectedEntity: null,
        };
    },
    methods: {
        showDetail: function (_index, entity) {
            view.showDialog('app.Settings.ContractType.dialog.Detail', {
                isPreview: true,
                entity: JSON.parse(JSON.stringify(entity))
            });
        },
        handleEdit: function (_index, entity) {
            view.showDialog('app.Settings.ContractType.dialog.Edit', {
                isUpdate: true,
                entity: JSON.parse(JSON.stringify(entity))
            });
        },
        handleCreate: function () {
            view.showDialog('app.Settings.ContractType.dialog.Create', {
                isCreate: true,
            });
        },
        handleDelete: async function (_index, entity) {
            this.selectedEntity = entity;
            view.post('app.showConfirm', {
                title: 'Delete Contract Type?',
                description: 'Are you sure you want to delete Contract Type? This action cannot be undone.',
                options: {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No',
                    type: 'warning',
                },
                confirmTopic: 'app.Settings.ContractType.confirmDelete',
            });
        },
        handlePageChange: async function (currentPage, pageSize) {
            this.currentPage = currentPage;
            this.pageSize = pageSize;

            await this.refreshData();
        },
        onStartToure: function () {
            this.startTour = true;
        },
        onConfirmDelete: async function (event) {
            if (event.isConfirmed) {
                try {
                    const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/ContractTypeService.ts/${this.selectedEntity.Id}`, { method: 'DELETE' })
                    if (response.status === 204) {
                        view.showMessage(`Contract Type was deleted successfully.`);
                        this.refreshData();
                    } else {
                        const error = await response.json();
                        view.showErrorMessage('Failed to delete Contract Type', `Error message: ${error.message}`);
                    }
                } catch (e) {
                    const message = `Error message: ${e.message}`;
                    console.error(message, e);
                    view.showErrorMessage('Failed to delete Contract Type', message);
                }
            }
            this.selectedEntity = undefined;
        },
        onChangeLocale: function (event) {
            i18n.global.locale = event.data;
        },
        refreshData: async function () {
            this.loading = true;

            const responseCount = await fetch('/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/ContractTypeService.ts/count');
            if (!responseCount.ok) {
                const error = await responseCount.json();
                view.showErrorMessage('Failed to get Contract Type count', `Error message: ${error.message}`);
                throw new Error(`Response status: ${responseCount.status}`);
            }

            this.total = parseInt(await responseCount.text());

            const offset = (this.currentPage - 1) * this.pageSize;
            const limit = this.pageSize;

            const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/ContractTypeService.ts?$offset=${offset}&$limit=${limit}`);
            if (!response.ok) {
                const error = await response.json();
                view.showErrorMessage('Failed to load Contract Type', `Error message: ${error.message}`);
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

// app.config.globalProperties.view = new View({
//     topic: 'app.Settings.ContractType.openDialog',
//     path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/Settings/ContractType/dialog/index.html',
// });

app.use(i18n);
app.use(ElementPlus);
app.mount('#app');
