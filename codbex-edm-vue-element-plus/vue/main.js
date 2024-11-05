import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { ElMessage, ElNotification } from 'element-plus'
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
        }
    },
    data: function () {
        return {
            selectedLocale: null,
            startTour: false,
            loading: true,
            search: null,
            tableData: [],
        };
    },
    computed: {
        filterTableData: function () {
            return this.tableData.filter((data) => {
                if (!this.search) {
                    return true;
                }
                for (const next in data) {
                    if (("" + data[next]).toLowerCase().includes(this.search.toLowerCase())) {
                        return true;
                    }
                }
                return false;
            })
        }
    },
    methods: {
        handleEdit: function (index, entity) {
            ElNotification({
                title: 'Failed to Edit Entity',
                dangerouslyUseHTMLString: true,
                message: `The edit functionality is not implemented yet: <hr> ${JSON.stringify(entity, null, 4)}`,
                type: 'error',
            });
        },
        handleDelete: async function (index, entity) {
            // const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/entities/EmployeesService.ts/${entity.Id}`, { method: 'DELETE' })
            this.tableData.splice(index, 1);
            ElMessage({
                message: `Entity with Id = ${entity.Id} was deleted successfully.`,
                type: 'success',
            })
        },
        changeLocale: function () {
            debugger
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
