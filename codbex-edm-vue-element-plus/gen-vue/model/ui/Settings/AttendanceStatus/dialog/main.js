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
                        view.showMessage('i18n.Settings.AttendanceStatus.Create.successful');
                    } else {
                        const error = await response.json();
                        const errorMessage = view.getTranslation('i18n.generic.error.message') + ": " + error.message;
                        view.showErrorMessage('i18n.Settings.AttendanceStatus.Create.failed', errorMessage);
                    }
                } catch (e) {
                    console.error(`Error message: ${e.message}`, e);
                    const errorMessage = view.getTranslation('i18n.generic.error.message') + ": " + e.message;
                    view.showErrorMessage('i18n.Settings.AttendanceStatus.Create.failed', errorMessage);
                }
            } else if (this.isUpdate) {
                try {
                    const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/AttendanceStatusService.ts/${this.entity.Id}`, {
                        method: 'PUT',
                        body: JSON.stringify(this.entity)
                    });
                    if (response.status === 200) {
                        view.post('app.Settings.AttendanceStatus.refreshData');
                        view.showMessage('i18n.Settings.AttendanceStatus.Edit.successful');
                    } else {
                        const error = await response.json();
                        const errorMessage = view.getTranslation('i18n.generic.error.message') + ": " + error.message;
                        view.showErrorMessage('i18n.Settings.AttendanceStatus.Edit.failed', errorMessage);
                    }
                } catch (e) {
                    console.error(`Error message: ${e.message}`, e);
                    const errorMessage = view.getTranslation('i18n.generic.error.message') + ": " + e.message;
                    view.showErrorMessage('i18n.Settings.AttendanceStatus.Edit.failed', errorMessage);
                }
            }
            view.closeDialog();
        },
    }
});

app.use(View.i18n);
app.use(ElementPlus);
app.mount('#app');
