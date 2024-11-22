import { createI18n } from 'vue-i18n'

import en from '../locales/en.json' with { type: "json" };
import bg from '../locales/bg.json' with { type: "json" };

export class View {

    static messageHub = new FramesMessageHub();
    static i18n = createI18n({
        locale: localStorage.getItem('app.locale') ?? 'en',
        fallbackLocale: 'en',
        messages: {
            en: en,
            bg: bg,
        }
    });

    dialog;

    constructor(dialog = { path: '', topic: '' }) {
        this.dialog = dialog;

        this.subscribe('app.changeLocale', this.onChangeLocale);
    }

    static getTranslation(key) {
        return View.i18n.global.messages[View.i18n.global.locale][key] ?? View.i18n.global.messages[View.i18n.global.fallbackLocale][key] ?? key;
    }

    showMessage(message, type = "success") {
        this.post('app.showMessage', {
            message: message,
            type: type,
        });
    }

    showErrorMessage(message) {
        this.post('app.showNotification', {
            title: title,
            message: message,
            type: 'error',
            duration: 0,
        });
    }

    showConfirm(title, description, confirmTopic) {
        this.post('app.showConfirm', {
            title: title,
            description: description,
            options: {
                confirmButtonText: 'i18n.generic.confirm.yes',
                cancelButtonText: 'i18n.generic.confirm.no',
                type: 'warning',
            },
            confirmTopic: confirmTopic,
        });
    }

    showDialog(title, data) {
        this.post('app.openDialog', {
            title: title,
            path: this.dialog.path,
            dialogTopic: this.dialog.topic,
            dialogData: data,
        });
    }

    closeDialog() {
        this.post('app.closeDialog');
    }

    subscribe(topic, callback) {
        View.messageHub.subscribe(callback, topic);
    }

    post(topic, data = {}) {
        View.messageHub.post(data, topic);
    }

    onChangeLocale(event) {
        localStorage.setItem('app.locale', event.data);
        View.i18n.global.locale = event.data;

        View.messageHub.post({
            message: 'i18n.locale.change',
            type: 'info',
        }, 'app.showMessage');
    }
}
