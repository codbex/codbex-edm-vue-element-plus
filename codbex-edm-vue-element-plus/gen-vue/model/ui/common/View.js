import { createI18n } from 'vue-i18n'

import en from '../locales/en.json' with { type: "json" };
import bg from '../locales/bg.json' with { type: "json" };

export class View {

    static i18n;

    messageHub;
    dialog;

    constructor(dialog = { path: '', topic: '' }) {
        this.messageHub = new FramesMessageHub();
        this.dialog = dialog;

        View.i18n = createI18n({
            locale: localStorage.getItem('app.locale') ?? 'en',
            fallbackLocale: 'en',
            messages: {
                en: en,
                bg: bg,
            }
        });

        this.subscribe('app.changeLocale', this.onChangeLocale);
    }

    static getTranslation(key) {
        return View.i18n.global.messages[View.i18n.global.locale][key];
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
        this.messageHub.subscribe(callback, topic);
    }

    post(topic, data = {}) {
        this.messageHub.post(data, topic);
    }

    onChangeLocale(event) {
        localStorage.setItem('app.locale', event.data);
        View.i18n.global.locale = event.data;

        // Workaround as the method is executed as a callback and "this" doesn't have access to the class instance
        new FramesMessageHub().post({
            message: 'app.locale.change',
            type: 'info',
        }, 'app.showMessage');
    }
}
