import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { Plus } from '@element-plus/icons-vue'
import { View } from '../../common/View.js';

const view = new View({
    topic: 'app.Settings.ContractType.openDialog',
    path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/Settings/ContractType/dialog/index.html',
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
        showDetail: function (entity) {
            view.showDialog('i18n.Settings.ContractType.dialog.Detail', {
                isPreview: true,
                entity: JSON.parse(JSON.stringify(entity))
            });
        },
        handleEdit: function (entity) {
            view.showDialog('i18n.Settings.ContractType.dialog.Edit', {
                isUpdate: true,
                entity: JSON.parse(JSON.stringify(entity))
            });
        },
        handleCreate: function () {
            view.showDialog('i18n.Settings.ContractType.dialog.Create', {
                isCreate: true,
            });
        },
        handleDelete: async function (entity) {
            this.selectedEntity = entity;
            view.showConfirm('i18n.Settings.ContractType.confirm.Delete', 'i18n.Settings.ContractType.confirm.Delete.description', 'app.Settings.ContractType.confirmDelete');
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
                        view.showMessage('i18n.Settings.ContractType.Delete.successful');
                        this.refreshData();
                    } else {
                        const error = await response.json();
                        const errorMessage = View.getTranslation('i18n.generic.error.message') + ": " + error.message;
                        view.showErrorMessage('i18n.Settings.ContractType.Delete.failed', errorMessage);
                    }
                } catch (e) {
                    console.error(`Error message: ${e.message}`, e);
                    const errorMessage = View.getTranslation('i18n.generic.error.message') + ": " + e.message;
                    view.showErrorMessage('i18n.Settings.ContractType.Delete.failed', errorMessage);
                }
            }
            this.selectedEntity = undefined;
        },
        refreshData: async function () {
            this.loading = true;

            const responseCount = await fetch('/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/ContractTypeService.ts/count');
            if (!responseCount.ok) {
                const error = await responseCount.json();
                const errorMessage = View.getTranslation('i18n.generic.error.message') + ": " + error.message;
                view.showErrorMessage('i18n.Settings.ContractType.Count.failed', errorMessage);
                throw new Error(`Response status: ${responseCount.status}`);
            }

            this.total = parseInt(await responseCount.text());

            const offset = (this.currentPage - 1) * this.pageSize;
            const limit = this.pageSize;

            const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/ContractTypeService.ts?$offset=${offset}&$limit=${limit}`);
            if (!response.ok) {
                const error = await response.json();
                const errorMessage = View.getTranslation('i18n.generic.error.message') + ": " + error.message;
                view.showErrorMessage('i18n.Settings.ContractType.Load.failed', errorMessage);
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

app.use(View.i18n);
app.use(ElementPlus);
app.mount('#app');
