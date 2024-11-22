import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { Plus } from '@element-plus/icons-vue'
import { View } from '../../../common/View.js';

const view = new View();

const app = createApp({
    setup() {
        return {
            isCreate: false,
            isUpdate: false,
            isPreview: false,
            Plus: Plus,
        }
    },
    created() {
        view.subscribe('app.Settings.AttendanceStatus.openDialog', this.onOpenDialog);
        view.subscribe('app.Settings.AttendanceStatus.openDialog.confirm', this.onConfirmDialog);
    },
    data: function () {
        return {
            entity: {}
        };
    },
    methods: {
        saveCreate: async function () {
        },
        onOpenDialog: function (event) {
            if (event.data.isCreate) {
                this.isCreate = true;
                this.isUpdate = false;
                this.isPreview = false;
                this.entity = {};
            } else if (event.data.isUpdate) {
                this.isCreate = false;
                this.isUpdate = true;
                this.isPreview = false;
                this.entity = event.data.entity;
            } else {
                this.isCreate = false;
                this.isUpdate = false;
                this.isPreview = true;
                this.entity = event.data.entity;
            }
        },
        onConfirmDialog: async function (event) {
            if (this.isCreate) {
                try {
                    const response = await fetch('/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/AttendanceStatusService.ts', {
                        method: 'POST',
                        body: JSON.stringify(this.entity)
                    });
                    if (response.status === 201) {
                        view.post('app.Settings.AttendanceStatus.refreshData');
                        view.showMessage(`Attendance Status successfully created.`);
                    } else {
                        const error = await response.json();
                        view.showErrorMessage('Failed to create Attendance Status', `Error message: ${error.message}`);
                    }
                } catch (e) {
                    const message = `Error message: ${e.message}`;
                    console.error(message, e);
                    view.showErrorMessage('Failed to create Attendance Status', message);
                }
            } else if (this.isUpdate) {
                try {
                    const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/AttendanceStatusService.ts/${this.entity.Id}`, {
                        method: 'PUT',
                        body: JSON.stringify(this.entity)
                    });
                    if (response.status === 200) {
                        view.post('app.Settings.AttendanceStatus.refreshData');
                        view.showMessage(`Attendance Status successfully updated.`);
                    } else {
                        const error = await response.json();
                        view.showErrorMessage('Failed to edit Attendance Status', `Error message: ${error.message}`);
                    }
                } catch (e) {
                    const message = `Error message: ${e.message}`;
                    console.error(message, e);
                    view.showErrorMessage('Failed to edit Attendance Status', message);
                }
            }
            view.closeDialog();
        },
    }
});

app.use(View.i18n);
app.use(ElementPlus);
app.mount('#app');
