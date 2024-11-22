export class View {

    messageHub;
    dialog;

    constructor(dialog = { path: '', topic: '' }) {
        this.messageHub = new FramesMessageHub();
        this.dialog = dialog;
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
}
