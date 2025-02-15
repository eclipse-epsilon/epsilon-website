import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { MonacoBinding } from 'y-monaco'
import * as monaco from 'monaco-editor'
import { backend, consolePanel, outputPanel, preloader } from './Playground';
import 'metro4';

// TODO: Join session via URL, disconnect, start new session -> the window url is different to the new share URL and this can cause confusion
class LiveShareManager {

    sessionId;
    providers = [];

    init() {
        var parameters = new URLSearchParams(window.location.search);
        this.sessionId = parameters.get("session");

        if (this.willJoinSession()) {
            var self = this;
            // Try to join the session and if it fails, initialise
            // panels from the fields of the example instead
            preloader.progress("Joining live sharing session");
            this.attempt(function () {
                self.sessionId = self.getOrCreateSessionId();
                self.joinSession(true);
                preloader.hide();
            }, function() {
                initialisePanelValues()
                preloader.hide();
            });
        }
        else {
            preloader.hide();
        }
    }

    attempt(onServiceAvailable, onServiceUnavailable = () => {}, notify = true) {
        console.log("attempting" + backend.getYjsService());
        const ws = new WebSocket(backend.getYjsService());
        ws.onopen = () => {
            onServiceAvailable();
        };
        ws.onerror = () => {
            onServiceUnavailable();
            if (notify) {
                Metro.notify.create("Live sharing is not available at the moment.", null, {keepOpen: false, cls: "alert", width: 300});
            }
        };
    }

    showLiveShareStatus(status) {
        var liveShareStatus = document.getElementById("liveShareStatus");
        if (status) liveShareStatus.style.display = "block";
        else liveShareStatus.style.display = "none";
    }

    startSession() {
        this.joinSession(false);
    }

    leaveSession() {
        this.providers.forEach(provider => provider.destroy());
        this.providers = [];
        this.sessionId = undefined;
        this.showLiveShareStatus(false);
    }

    joinSession(existing) {

        var self = this;
        self.sessionId = self.getOrCreateSessionId();
        self.showLiveShareStatus(true);

        for (const panel of window.getActivePanels()) {
            if (panel != consolePanel && panel != outputPanel) {
                const ydoc = new Y.Doc();
                const provider = new WebsocketProvider(backend.getYjsService(), 'epsilon-playground-' + self.sessionId + "-" + panel.getId(), ydoc);
                self.providers.push(provider);
                const ytext = ydoc.getText('monaco');
                var editor = panel.getEditor();
                var value = panel.getEditor().getValue();
                const monacoBinding = new MonacoBinding(ytext, (editor.getModel()), new Set([editor]), provider.awareness);
                if (!existing) panel.getEditor().setValue(value);
            }
        }
       
    }

    inSession() {
        return this.sessionId != undefined;
    }

    getOrCreateSessionId() {
        if (this.sessionId != undefined) return this.sessionId;
        else return this.generateUUID();
    }

    willJoinSession() {
        var parameters = new URLSearchParams(window.location.search);
        return parameters.has("session");
    }

    getShareURL() {
        const url = new URL(window.location.href);
        url.searchParams.set("session", this.sessionId);
        url.searchParams.delete("start");
        return url.toString();
    }

    generateUUID() { // Public Domain/MIT
        var d = new Date().getTime();//Timestamp
        var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if(d > 0){//Use timestamp until depleted
                r = (d + r)%16 | 0;
                d = Math.floor(d/16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r)%16 | 0;
                d2 = Math.floor(d2/16);
            }
            return (c==='x' ? r : (r&0x3|0x8)).toString(16);
        });
    }

}

export {LiveShareManager};