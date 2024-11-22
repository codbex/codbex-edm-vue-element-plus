import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import * as icons from '@element-plus/icons-vue'
import { View } from './ui/common/View.js';

const view = new View();

const app = createApp({
    setup() {
        return {
            ...icons
        }
    },
    created() {
        // Subscribe handlers on view events
        view.subscribe('app.openDialog', this.onOpenDialog);
        view.subscribe('app.closeDialog', this.onCloseDialog);
        view.subscribe('app.showMessage', this.onShowMessage);
        view.subscribe('app.showNotification', this.onShowNotification);
        view.subscribe('app.showConfirm', this.onShowConfirm);

        this.view = this.navigationSingleView[0].path;
    },
    data() {
        return {
            isNavigationCollapsed: false,
            isDialogVisible: false,
            dialogTitle: '',
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
                {
                    name: 'Recruitment & Onboarding',
                    icon: 'Files',
                    menuItems: [
                        {
                            name: 'Candidate Application',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/RecruitmentAndOnboarding/CandidateApplication/index.html'
                        }, {
                            name: 'Job Posting',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/RecruitmentAndOnboarding/JobPosting/index.html'
                        }
                    ]
                },
                {
                    name: 'Performance & Attendance',
                    icon: 'Postcard',
                    menuItems: [
                        {
                            name: 'Performance Review',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/PerformanceAndAttendance/PerformanceReview/index.html'
                        }, {
                            name: 'Attendance Record',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/PerformanceAndAttendance/AttendanceRecord/index.html'
                        }
                    ]
                },
                {
                    name: 'Settings',
                    icon: 'Setting',
                    menuItems: [
                        {
                            name: 'Contract Type',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/Settings/ContractType/index.html'
                        }, {
                            name: 'Attendance Status',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/Settings/AttendanceStatus/index.html'
                        }
                    ]
                },
            ],
            menu: [{
                name: 'Processes',
                path: '/services/web/inbox/index.html'
            }, {
                name: 'Documents',
                path: '/services/web/documents/index.html'
            }, {
                name: 'Help',
                menuItems: [{
                    name: 'Help Portal',
                    url: 'https://www.dirigible.io/help/'
                }, {
                    name: 'Contact Support',
                    url: 'https://github.com/eclipse/dirigible/issues'
                }, {
                    name: 'Suggest a Feature',
                    url: 'https://github.com/eclipse/dirigible/issues/new?assignees=&labels=&template=feature_request.md&title=[New%20Feature]'
                }, {
                    name: `What's New`,
                    url: 'https://www.dirigible.io/blogs/'
                }, {
                    name: 'Check for Updates',
                    url: 'https://download.dirigible.io/'
                }]
            }]
        };
    },
    computed: {
        navigationSingleView() {
            return this.perspectives.filter(e => e.path);
        },
        navigationHorizontalSingleView() {
            return this.menu.filter(e => e.path);
        },
        navigationMenu() {
            return this.perspectives.filter(e => e.path === undefined);
        },
        navigationHorizontalMenu() {
            return this.menu.filter(e => e.path === undefined);
        },
    },
    methods: {
        getIcon(iconName) {
            return icons[iconName] ?? icons['Document'];
        },
        changeLocale(locale) {
            view.post('app.changeLocale', locale);
        },
        startTour() {
            view.post('app.startTour');
        },
        selectNavigation(key) {
            this.view = key;
        },
        confirmDialog() {
            view.post(`${this.dialogTopic}.confirm`);
        },
        openInNewTab(url) {
            window.open(url);
        },
        logout() {
            location.replace('/logout');
        },

        // View Event Handlers
        onOpenDialog(event) {
            this.isDialogVisible = true;
            this.dialogTitle = event.title;
            this.dialogPath = event.path;
            this.dialogTopic = event.dialogTopic;

            // TODO: Is there a better way how to handle data transfer?
            // This is a workaround, to ensure that the messageHub is loaded in the target dialog (iframe)
            setTimeout(() => {
                view.post(event.dialogTopic, { data: event.dialogData });
            }, 500);
        },
        onCloseDialog() {
            this.isDialogVisible = false;
            this.dialogTitle = '';
            this.dialogPath = null;
            this.dialogTopic = null;
        },
        onShowMessage(event) {
            const message = View.getTranslation(event.message);

            ElMessage({
                ...event,
                message
            });
        },
        onShowNotification(event) {
            const message = View.getTranslation(event.message);

            ElNotification({
                ...event,
                message
            });
        },
        async onShowConfirm(event) {
            try {
                const description = View.getTranslation(event.description);
                const title = View.getTranslation(event.title);
                const confirmButtonText = View.getTranslation(event.options.confirmButtonText);
                const cancelButtonText = View.getTranslation(event.options.cancelButtonText);

                await ElMessageBox.confirm(description, title, {
                    ...event.options,
                    confirmButtonText,
                    cancelButtonText,
                });
                view.post(event.confirmTopic, { isConfirmed: true });
            } catch (e) {
                view.post(event.confirmTopic, { isConfirmed: false },);
            }
        },
    },
});

Object.keys(icons).forEach(iconName => app.component(iconName.toLowerCase(), icons[iconName]));

app.use(View.i18n);
app.use(ElementPlus);
app.mount('#app');
