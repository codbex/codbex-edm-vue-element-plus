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
                    name: 'i18n.menu.Home',
                    icon: 'House',
                    path: '/services/web/codbex-edm-vue-element-plus/gen/model/ui/launchpad/Home/index.html'
                },
                {
                    name: 'i18n.menu.EmployeeManagement',
                    icon: 'User',
                    menuItems: [
                        {
                            name: 'i18n.menu.EmployeeManagement.Employee',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/EmployeeManagement/Employee/index.html'
                        }, {
                            name: 'i18n.menu.EmployeeManagement.EmploymentContract',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/EmployeeManagement/EmploymentContract/index.html'
                        }, {
                            name: 'i18n.menu.EmployeeManagement.Department',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/EmployeeManagement/Department/index.html'
                        }
                    ]
                },
                {
                    name: 'i18n.menu.RecruitmentAndOnboarding',
                    icon: 'Files',
                    menuItems: [
                        {
                            name: 'i18n.menu.RecruitmentAndOnboarding.CandidateApplication',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/RecruitmentAndOnboarding/CandidateApplication/index.html'
                        }, {
                            name: 'i18n.menu.RecruitmentAndOnboarding.JobPosting',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/RecruitmentAndOnboarding/JobPosting/index.html'
                        }
                    ]
                },
                {
                    name: 'i18n.menu.PerformanceAndAttendance',
                    icon: 'Postcard',
                    menuItems: [
                        {
                            name: 'i18n.menu.PerformanceAndAttendance.PerformanceReview',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/PerformanceAndAttendance/PerformanceReview/index.html'
                        }, {
                            name: 'i18n.menu.PerformanceAndAttendance.AttendanceRecord',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/PerformanceAndAttendance/AttendanceRecord/index.html'
                        }
                    ]
                },
                {
                    name: 'i18n.menu.Settings',
                    icon: 'Setting',
                    menuItems: [
                        {
                            name: 'i18n.menu.Settings.ContractType',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/Settings/ContractType/index.html'
                        }, {
                            name: 'i18n.menu.Settings.AttendanceStatus',
                            path: '/services/web/codbex-edm-vue-element-plus/gen-vue/model/ui/Settings/AttendanceStatus/index.html'
                        }
                    ]
                },
            ],
            menu: [
                {
                    name: 'i18n.menu.Processes',
                    path: '/services/web/inbox/index.html'
                },
                {
                    name: 'i18n.menu.Documents',
                    path: '/services/web/documents/index.html'
                },
                {
                    name: 'i18n.menu.Help',
                    menuItems: [
                        {
                            name: 'i18n.menu.Help.HelpPortal',
                            url: 'https://www.dirigible.io/help/'
                        },
                        {
                            name: 'i18n.menu.Help.ContactSupport',
                            url: 'https://github.com/eclipse/dirigible/issues'
                        },
                        {
                            name: 'i18n.menu.Help.SuggestAFeature',
                            url: 'https://github.com/eclipse/dirigible/issues/new?assignees=&labels=&template=feature_request.md&title=[New%20Feature]'
                        },
                        {
                            name: `i18n.menu.Help.WhatsNew`,
                            url: 'https://www.dirigible.io/blogs/'
                        },
                        {
                            name: 'i18n.menu.Help.CheckForUpdates',
                            url: 'https://download.dirigible.io/'
                        }
                    ]
                }
            ],
            locales: [
                {
                    id: 'en',
                    name: 'i18n.menu.User.Locale.English'
                },
                {
                    id: 'bg',
                    name: 'i18n.menu.User.Locale.Bulgarian'
                }
            ]
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
