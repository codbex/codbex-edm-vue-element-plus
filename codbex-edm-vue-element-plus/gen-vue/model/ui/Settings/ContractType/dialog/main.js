import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { Plus } from '@element-plus/icons-vue'
import { createI18n } from 'vue-i18n'
import { View } from '../../../common/View.js';

import en from '../../../locales/en.json' with { type: "json" };
import bg from '../../../locales/bg.json' with { type: "json" };


const view = new View();

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
            isCreate: false,
            isUpdate: false,
            isPreview: false,
            Plus: Plus,
        }
    },
    created() {
        view.subscribe('app.Settings.ContractType.openDialog', this.onOpenDialog);
        view.subscribe('app.Settings.ContractType.openDialog.confirm', this.onConfirmDialog);
        view.subscribe('app.changeLocale', this.onChangeLocale);
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
                    const response = await fetch('/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/ContractTypeService.ts', {
                        method: 'POST',
                        body: JSON.stringify(this.entity)
                    });
                    if (response.status === 201) {
                        view.post('app.Settings.ContractType.refreshData');
                        view.showMessage(`Contract Type successfully created.`);
                    } else {
                        const error = await response.json();
                        view.showErrorMessage('Failed to create Contract Type', `Error message: ${error.message}`);
                    }
                } catch (e) {
                    const message = `Error message: ${e.message}`;
                    console.error(message, e);
                    view.showErrorMessage('Failed to create Contract Type', message);
                }
            } else if (this.isUpdate) {
                try {
                    const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/ContractTypeService.ts/${this.entity.Id}`, {
                        method: 'PUT',
                        body: JSON.stringify(this.entity)
                    });
                    if (response.status === 200) {
                        view.post('app.Settings.ContractType.refreshData');
                        view.showMessage(`Contract Type successfully updated.`);
                    } else {
                        const error = await response.json();
                        view.showErrorMessage('Failed to edit Contract Type', `Error message: ${error.message}`);
                    }
                } catch (e) {
                    const message = `Error message: ${e.message}`;
                    console.error(message, e);
                    view.showErrorMessage('Failed to edit Contract Type', message);
                }
            }
            view.closeDialog();
        },
        onChangeLocale: function (event) {
            i18n.global.locale = event.data;
        },
    }
});

app.use(i18n);
app.use(ElementPlus);
app.mount('#app');
