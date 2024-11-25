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
            entityForm: null,
            Plus: Plus,
        }
    },
    created() {
        view.subscribe('app.RecruitmentAndOnboarding.CandidateApplication.openDialog', this.onOpenDialog);
        view.subscribe('app.RecruitmentAndOnboarding.CandidateApplication.openDialog.confirm', this.onConfirmDialog);
    },
    data: function () {
        return {
            entity: {},
            validationRules: {
                CandidateName: [
                    {
                        required: true,
                        message: View.getTranslation('i18n.RecruitmentAndOnboarding.CandidateApplication.form.CandidateName.required'),
                        trigger: 'blur',
                    }
                ],
                Email: [
                    {
                        required: true,
                        message: View.getTranslation('i18n.RecruitmentAndOnboarding.CandidateApplication.form.Email.required'),
                        trigger: 'blur',
                    },
                    {
                        type: 'email',
                        message: View.getTranslation('i18n.generic.form.invalid.email'),
                        trigger: 'blur',
                    }
                ],
                ResumeLink: [
                    {
                        required: true,
                        message: View.getTranslation('i18n.RecruitmentAndOnboarding.CandidateApplication.form.ResumeLink.required'),
                        trigger: 'blur',
                    },
                    {
                        type: 'url',
                        message: View.getTranslation('i18n.generic.form.invalid.url'),
                        trigger: 'blur',
                    }],
                PhoneNumber: [
                    {
                        required: true,
                        message: View.getTranslation('i18n.RecruitmentAndOnboarding.CandidateApplication.form.PhoneNumber.required'),
                        trigger: 'blur',
                    },
                    {
                        required: true,
                        validator: (_rule, value, _callback) => {
                            const phoneRegex = /^(\+?\d{1,3})?[-.\s]?(\(?\d{1,4}\)?)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
                            if (!phoneRegex.test(value)) {
                                throw new Error(View.getTranslation('i18n.generic.form.invalid.phone'));
                            }
                            return true;
                        },
                        trigger: 'blur',
                    }
                ],
                PreferredStartDate: [
                    {
                        required: true,
                        type: 'date',
                        message: View.getTranslation('i18n.RecruitmentAndOnboarding.CandidateApplication.form.PreferredStartDate.required'),
                        trigger: 'blur',
                    }
                ],
                ExpectedSalary: [
                    {
                        required: true,
                        type: 'number',
                        min: 0,
                        max: 10_000,
                        message: View.getTranslation('i18n.RecruitmentAndOnboarding.CandidateApplication.form.ExpectedSalary.required'),
                        trigger: 'blur',
                    }
                ],
            }
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
            const isValid = await this.entityForm.validate();
            if (!isValid) {
                return;
            }
            if (this.isCreate) {
                try {
                    const response = await fetch('/services/ts/codbex-edm-vue-element-plus/gen/model/api/RecruitmentAndOnboarding/CandidateApplicationService.ts', {
                        method: 'POST',
                        body: JSON.stringify(this.entity)
                    });
                    if (response.status === 201) {
                        view.post('app.RecruitmentAndOnboarding.CandidateApplication.refreshData');
                        view.showMessage('i18n.RecruitmentAndOnboarding.CandidateApplication.Create.successful');
                    } else {
                        const error = await response.json();
                        const errorMessage = View.getTranslation('i18n.generic.error.message') + ": " + error.message;
                        view.showErrorMessage('i18n.RecruitmentAndOnboarding.CandidateApplication.Create.failed', errorMessage);
                    }
                } catch (e) {
                    console.error(`Error message: ${e.message}`, e);
                    const errorMessage = View.getTranslation('i18n.generic.error.message') + ": " + e.message;
                    view.showErrorMessage('i18n.RecruitmentAndOnboarding.CandidateApplication.Create.failed', errorMessage);
                }
            } else if (this.isUpdate) {
                try {
                    const response = await fetch(`/services/ts/codbex-edm-vue-element-plus/gen/model/api/RecruitmentAndOnboarding/CandidateApplicationService.ts/${this.entity.Id}`, {
                        method: 'PUT',
                        body: JSON.stringify(this.entity)
                    });
                    if (response.status === 200) {
                        view.post('app.RecruitmentAndOnboarding.CandidateApplication.refreshData');
                        view.showMessage('i18n.RecruitmentAndOnboarding.CandidateApplication.Edit.successful');
                    } else {
                        const error = await response.json();
                        const errorMessage = View.getTranslation('i18n.generic.error.message') + ": " + error.message;
                        view.showErrorMessage('i18n.RecruitmentAndOnboarding.CandidateApplication.Edit.failed', errorMessage);
                    }
                } catch (e) {
                    console.error(`Error message: ${e.message}`, e);
                    const errorMessage = View.getTranslation('i18n.generic.error.message') + ": " + e.message;
                    view.showErrorMessage('i18n.RecruitmentAndOnboarding.CandidateApplication.Edit.failed', errorMessage);
                }
            }
            view.closeDialog();
        },
    }
});

app.use(View.i18n);
app.use(ElementPlus);
app.mount('#app');
