import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import * as icons from '@element-plus/icons-vue'

const app = createApp({
    setup() {
        return {
            ...icons
        }
    },
    created() {
        this.$messageHub.subscribe(this.onOpenDialog, 'app.openDialog');
        this.$messageHub.subscribe(this.onCloseDialog, 'app.closeDialog');
        this.$messageHub.subscribe(this.onShowMessage, 'app.showMessage');
        this.$messageHub.subscribe(this.onShowNotification, 'app.showNotification');
        this.$messageHub.subscribe(this.onShowConfirm, 'app.showConfirm');
        this.view = this.navigationSingleView[0].path;
    },
    data() {
        return {
            isNavigationCollapsed: false,
            isDialogVisible: false,
            dialogTitle: null,
            dialogTopic: null,
            view: null,
            perspectives: [
                {
                    name: 'Home',
                    icon: 'House',
                    path: '/services/web/codbex-edm-vue-element-plus/gen/model/ui/launchpad/Home/index.html'
                },
                {
                    name: 'Employee Management',
                    icon: 'User',
                    menuItems: [
                        {
                            name: 'Employee',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/EmployeeManagement/Employee/index.html'
                        }, {
                            name: 'Employment Contract',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/EmployeeManagement/EmploymentContract/index.html'
                        }, {
                            name: 'Department',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/EmployeeManagement/Department/index.html'
                        }
                    ]
                },
            ]
        };
    },
    computed: {
        navigationSingleView() {
            return this.perspectives.filter(e => e.path);
        },
        navigationMenu() {
            return this.perspectives.filter(e => e.path === undefined);
        },
    },
    methods: {
        getIcon(iconName) {
            return icons[iconName] ?? icons['Document'];
        },
        changeLocale(locale) {
            this.$messageHub.post(locale, 'app.changeLocale');
        },
        startTour() {
            this.$messageHub.post({}, 'app.startTour');
        },
        handleSelect(key, keyPath) {
            this.view = key;
        },
        openInNewTab(url) {
            window.open(url);
        },
        logout() {
            location.replace('/logout');
        },
        onOpenDialog(event) {
            this.isDialogVisible = true;
            this.dialogTitle = event.title;
            this.dialogPath = event.path;
            this.dialogTopic = event.dialogTopic;

            // TODO: Is there a better way how to handle data transfer?
            // This is a workaround, to ensue that the messageHub is loaded in the target dialog (iframe)
            setTimeout(() => {
                this.$messageHub.post({ data: event.dialogData }, event.dialogTopic);
            }, 500);
        },
        onCloseDialog() {
            this.isDialogVisible = false;
            this.dialogTitle = null;
            this.dialogPath = null;
            this.dialogTopic = null;
        },
        onShowMessage(event) {
            ElMessage(event);
        },
        confirmDialog() {
            this.$messageHub.post({}, `${this.dialogTopic}.confirm`);
        },
        onShowNotification(event) {
            ElNotification(event);
        },
        async onShowConfirm(event) {
            try {
                await ElMessageBox.confirm(event.description, event.title, event.options);
                this.$messageHub.post({ isConfirmed: true }, event.confirmTopic);
            } catch (e) {
                this.$messageHub.post({ isConfirmed: false }, event.confirmTopic);
            }
        }
    },
});

Object.keys(icons).forEach(iconName => app.component(iconName.toLowerCase(), icons[iconName]));

app.config.globalProperties.$messageHub = new FramesMessageHub();

app.use(ElementPlus);

app.mount('#app');
