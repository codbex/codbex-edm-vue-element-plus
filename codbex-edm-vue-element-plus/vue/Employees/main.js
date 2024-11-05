import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'
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
})

const app = createApp({
    setup() {
        return {
            tourSearchInput: null,
            tourEditButton: null,
            tourDeleteButton: null,
            Plus: Plus,
        }
    },
    data: function () {
        return {
            selectedLocale: null,
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
            this.dialogDetailVisible = true;
            this.selectedEntity = entity;
        },
        handleEdit: function (index, entity) {
            this.dialogEditVisible = true;
            this.selectedEntity = { ...entity };
            this.selectedEntityIndex = index;
        },
        saveChanges: async function () {
            const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/entities/EmployeesService.ts/${this.selectedEntity.Id}`, {
                method: 'PUT',
                body: JSON.stringify(this.selectedEntity)
            });
            if (response.status === 200) {
                const updatedEntity = await response.json();
                this.tableData[this.selectedEntityIndex] = updatedEntity;
                ElMessage({
                    message: `Employees successfully updated.`,
                    type: 'success',
                });
            } else {
                const error = await response.json();
                ElNotification({
                    title: 'Failed to edit Employees',
                    message: `Error message: ${error.message}`,
                    type: 'error',
                    duration: 0,
                });
            }
            this.dialogEditVisible = false;
        },
        cancelChanges: function () {
            this.selectedEntity = null;
            this.selectedEntityIndex = null;
            this.dialogEditVisible = false;
        },
        handleCreate: function () {
            this.dialogCreateVisible = true;
            this.selectedEntity = {};
        },
        saveCreate: async function () {
            const response = await fetch('/services/ts/codbex-edm-vue-element-plus/gen/model/api/entities/EmployeesService.ts', {
                method: 'POST',
                body: JSON.stringify(this.selectedEntity)
            });
            if (response.status === 201) {
                const newEntity = await response.json();
                this.tableData.push(newEntity);
                ElMessage({
                    message: `Employees successfully created.`,
                    type: 'success',
                });
            } else {
                const error = await response.json();
                ElNotification({
                    title: 'Failed to create Employees',
                    message: `Error message: ${error.message}`,
                    type: 'error',
                    duration: 0,
                });
            }
            this.dialogCreateVisible = false;
        },
        cancelCreate: function () {
            this.selectedEntity = null;
            this.dialogCreateVisible = false;
        },
        handleDelete: async function (index, entity) {
            ElMessageBox.confirm('Are you sure you want to delete Employees? This action cannot be undone.', 'Delete Employees?', {
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                type: 'warning',
            }).then(async () => {
                const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/entities/EmployeesService.ts/${entity.Id}`, { method: 'DELETE' })
                if (response.status === 204) {
                    this.tableData.splice(index, 1);
                    ElMessage({
                        message: `Entity was deleted successfully.`,
                        type: 'success',
                    });
                } else {
                    const error = await response.json();
                    ElNotification({
                        title: 'Failed to delete Employees',
                        message: `Error message: ${error.message}`,
                        type: 'error',
                        duration: 0,
                    });
                }
            });

        },
        changeLocale: function () {
            i18n.global.locale = this.selectedLocale;
        }
    },
    mounted: async function () {
        const response = await fetch('/services/ts/codbex-edm-vue-element-plus/gen/model/api/entities/EmployeesService.ts');
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        setTimeout(async function (context) {
            context.loading = false
            context.tableData = await response.json();
        }, 1000, this);
    }
});

app.use(i18n);
app.use(ElementPlus);
app.mount('#app');
