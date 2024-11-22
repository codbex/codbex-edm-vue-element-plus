import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { Plus } from '@element-plus/icons-vue'
import { View } from '../../common/View.js';

const view = new View({
    topic: 'app.Settings.AttendanceStatus.openDialog',
    path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/Settings/AttendanceStatus/dialog/index.html',
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
        view.subscribe('app.Settings.AttendanceStatus.confirmDelete', this.onConfirmDelete);
        view.subscribe('app.Settings.AttendanceStatus.refreshData', this.refreshData);
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
            view.showDialog('app.Settings.AttendanceStatus.dialog.Detail', {
                isPreview: true,
                entity: JSON.parse(JSON.stringify(entity))
            });
        },
        handleEdit: function (_index, entity) {
            view.showDialog('app.Settings.AttendanceStatus.dialog.Edit', {
                isUpdate: true,
                entity: JSON.parse(JSON.stringify(entity))
            });
        },
        handleCreate: function () {
            view.showDialog('app.Settings.AttendanceStatus.dialog.Create', {
                isCreate: true,
            });
        },
        handleDelete: async function (_index, entity) {
            this.selectedEntity = entity;
            view.post('app.showConfirm', {
                title: 'Delete Attendance Status?',
                description: 'Are you sure you want to delete Attendance Status? This action cannot be undone.',
                options: {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No',
                    type: 'warning',
                },
                confirmTopic: 'app.Settings.AttendanceStatus.confirmDelete',
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
                    const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/AttendanceStatusService.ts/${this.selectedEntity.Id}`, { method: 'DELETE' })
                    if (response.status === 204) {
                        view.showMessage(`Attendance Status was deleted successfully.`);
                        this.refreshData();
                    } else {
                        const error = await response.json();
                        view.showErrorMessage('Failed to delete Attendance Status', `Error message: ${error.message}`);
                    }
                } catch (e) {
                    const message = `Error message: ${e.message}`;
                    console.error(message, e);
                    view.showErrorMessage('Failed to delete Attendance Status', message);
                }
            }
            this.selectedEntity = undefined;
        },
        refreshData: async function () {
            this.loading = true;

            const responseCount = await fetch('/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/AttendanceStatusService.ts/count');
            if (!responseCount.ok) {
                const error = await responseCount.json();
                view.showErrorMessage('Failed to get Attendance Status count', `Error message: ${error.message}`);
                throw new Error(`Response status: ${responseCount.status}`);
            }

            this.total = parseInt(await responseCount.text());

            const offset = (this.currentPage - 1) * this.pageSize;
            const limit = this.pageSize;

            const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/AttendanceStatusService.ts?$offset=${offset}&$limit=${limit}`);
            if (!response.ok) {
                const error = await response.json();
                view.showErrorMessage('Failed to load Attendance Status', `Error message: ${error.message}`);
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
