import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { Plus } from '@element-plus/icons-vue'
// import { createI18n } from 'vue-i18n'

// import en from './locales/en.json' with { type: "json" };
// import bg from './locales/bg.json' with { type: "json" };

// const i18n = createI18n({
//     locale: 'en',
//     fallbackLocale: 'en',
//     messages: {
//         en: en,
//         bg: bg,
//     }
// });

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
        this.$messageHub.subscribe(this.onOpenDialog, 'app.EmployeeManagement.Department.openDialog');
        this.$messageHub.subscribe(this.onConfirmDialog, 'app.EmployeeManagement.Department.openDialog.confirm');
    },
    data: function () {
        return {
            entity: {}
        };
    },
    methods: {
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
                    const response = await fetch('/services/ts/codbex-edm-vue-element-plus/gen/model/api/EmployeeManagement/DepartmentService.ts', {
                        method: 'POST',
                        body: JSON.stringify(this.entity)
                    });
                    if (response.status === 201) {
                        this.$messageHub.post({}, 'app.EmployeeManagement.Department.refreshData');
                        this.$messageHub.post({
                            message: `Employees successfully created.`,
                            type: 'success',
                        }, 'app.showMessage');
                    } else {
                        const error = await response.json();
                        this.showErrorMessage('Failed to create Employees', `Error message: ${error.message}`);
                    }
                } catch (e) {
                    const message = `Error message: ${e.message}`;
                    console.error(message, e);
                    this.showErrorMessage('Failed to create Employees', message);
                }
            } else if (this.isUpdate) {
                try {
                    const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/EmployeeManagement/DepartmentService.ts/${this.entity.Id}`, {
                        method: 'PUT',
                        body: JSON.stringify(this.entity)
                    });
                    if (response.status === 200) {
                        this.$messageHub.post({}, 'app.EmployeeManagement.Department.refreshData');
                        this.$messageHub.post({
                            message: `Employees successfully updated.`,
                            type: 'success',
                        }, 'app.showMessage');
                    } else {
                        const error = await response.json();
                        this.showErrorMessage('Failed to edit Employees', `Error message: ${error.message}`);
                    }
                } catch (e) {
                    const message = `Error message: ${e.message}`;
                    console.error(message, e);
                    this.showErrorMessage('Failed to edit Employees', message);
                }
            }
            this.$messageHub.post({}, 'app.closeDialog');
        },
        saveCreate: async function () {
        },
        showErrorMessage: function (title, message) {
            this.$messageHub.post({
                title: title,
                message: message,
                type: 'error',
                duration: 0,
            }, 'app.showNotification');
        },
    }
});

app.config.globalProperties.$messageHub = new FramesMessageHub();

// app.use(i18n);
app.use(ElementPlus);
app.mount('#app');