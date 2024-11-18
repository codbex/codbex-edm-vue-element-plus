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
    },
    data: function () {
        return {
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
                this.$messageHub.post({
                    message: `Employees successfully updated.`,
                    type: 'success',
                }, 'app.showMessage');
            } else {
                const error = await response.json();
                this.$messageHub.post({
                    title: 'Failed to edit Employees',
                    message: `Error message: ${error.message}`,
                    type: 'error',
                    duration: 0,
                }, 'app.showNotification');
            }
            this.dialogEditVisible = false;
        },
        cancelChanges: function () {
            this.selectedEntity = null;
            this.selectedEntityIndex = null;
            this.dialogEditVisible = false;
        },
        handleCreate: function () {
            this.selectedEntity = {};
            this.$messageHub.post({
                title: 'Demo Title',
                path: '/services/web/codbex-edm-vue-element-plus/vue/app/index.html'
            }, 'app.openDialog');
        },
        saveCreate: async function () {
            const response = await fetch('/services/ts/codbex-edm-vue-element-plus/gen/model/api/entities/EmployeesService.ts', {
                method: 'POST',
                body: JSON.stringify(this.selectedEntity)
            });
            if (response.status === 201) {
                const newEntity = await response.json();
                this.tableData.push(newEntity);
                this.$messageHub.post({
                    message: `Employees successfully created.`,
                    type: 'success',
                }, 'app.showMessage');
            } else {
                const error = await response.json();
                this.$messageHub.post({
                    title: 'Failed to create Employees',
                    message: `Error message: ${error.message}`,
                    type: 'error',
                    duration: 0,
                }, 'app.showNotification');
            }
            this.dialogCreateVisible = false;
        },
        cancelCreate: function () {
            this.selectedEntity = null;
            this.dialogCreateVisible = false;
        },
        confirmDelete: async function (event) {
            if (event.isConfirmed) {
                const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/entities/EmployeesService.ts/${this.selectedEntity.Id}`, { method: 'DELETE' })
                if (response.status === 204) {
                    this.tableData.splice(this.selectedIndex, 1);
                    this.$messageHub.post({
                        message: `Entity was deleted successfully.`,
                        type: 'success',
                    }, 'app.showMessage');
                } else {
                    const error = await response.json();
                    this.$messageHub.post({
                        title: 'Failed to delete Employees',
                        message: `Error message: ${error.message}`,
                        type: 'error',
                        duration: 0,
                    }, 'app.showNotification');
                }
            }
            this.selectedIndex = undefined;
            this.selectedEntity = undefined;
        },
        handleDelete: async function (index, entity) {
            this.selectedIndex = index;
            this.selectedEntity = entity;
            const event = {
                title: 'Delete Employees?',
                description: 'Are you sure you want to delete Employees? This action cannot be undone.',
                options: {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No',
                    type: 'warning',
                },
                confirmTopic: 'app.Employees.confirmDelete',
            }
            this.$messageHub.post(event, 'app.showConfirm');
        },
        changeLocale: function (event) {
            i18n.global.locale = event.data;
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

app.config.globalProperties.$messageHub = new FramesMessageHub();

app.use(i18n);
app.use(ElementPlus);
app.mount('#app');
