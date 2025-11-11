import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { MonacoBinding } from './y-monaco.js'
import * as monaco from 'monaco-editor'
import { backend, consolePanel, outputPanel, preloader } from './Playground';
import '../node_modules/metro4/build/metro.js';

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
        const ws = new WebSocket(backend.getYjsService());
        ws.onopen = () => {
            onServiceAvailable();
            ws.close();
        };
        ws.onerror = () => {
            onServiceUnavailable();
            if (notify) {
                Metro.notify.create("<b>Connection Error</b><br>Live sharing is not available at the moment.", null, {keepOpen: false, cls: "warning", width: 300});
                ws.close();
            }
        };
    }

    showLiveShareStatus(status) {
        var liveShareBadges = document.getElementById("liveShareBadges");
        var liveShareTitleBadges = document.getElementById("liveShareTitleBadges");
        
        if (status) {
            liveShareBadges.style.display = "block";
            liveShareTitleBadges.style.display = "inline";
        }
        else {
            liveShareBadges.style.display = "none";
            liveShareTitleBadges.style.display = "none";
        }
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
        else return this.createSessionId();
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

    createSessionId() { 
        let result = '';
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < 6) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }

}

export {LiveShareManager};