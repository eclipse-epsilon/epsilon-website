import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { MonacoBinding } from 'y-monaco'
import * as monaco from 'monaco-editor'
import { backend, consolePanel, outputPanel, programPanel } from './Playground';

// TODO: Join session via URL, disconnect, start new session -> the window url is different to the new share URL and this can cause confusion
class LiveShareManager {

    sessionId;
    providers = [];

    init() {
        if (this.willJoinSession()) {
            this.sessionId = this.getOrCreateSessionId();
            this.joinSession(true);
        }
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
        this.providers.forEach(provider => provider.disconnect());
        this.providers = [];
        this.sessionId = undefined;
        this.showLiveShareStatus(false);
    }

    joinSession(existing) {
        this.sessionId = this.getOrCreateSessionId();
        
        this.showLiveShareStatus(true);
        // const ydoc = new Y.Doc();
        // const provider = new WebsocketProvider(backend.getYjsService(), 'epsilon-playground-' + this.sessionId + "-test", ydoc);
        // provider.on('status', event => {
        //     console.log(event.status); //console.log(event.status) // logs "connected" or "disconnected"
        // });
        // console.log(provider + ydoc.getText('monaco'));

        for (const panel of window.getActivePanels()) {
            if (panel != consolePanel && panel != outputPanel) {
                const ydoc = new Y.Doc();
                // const provider = new WebsocketProvider('wss://demos.yjs.dev/ws', 'epsilon-playground-' + this.sessionId + "-" + panel.getId(), ydoc);
                const provider = new WebsocketProvider(backend.getYjsService(), 'epsilon-playground-' + this.sessionId + "-" + panel.getId(), ydoc);
                this.providers.push(provider);
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
        var parameters = new URLSearchParams(window.location.search);
        if (parameters.has("session")) return parameters.get("session");
        else return this.generateUUID();
    }

    willJoinSession() {
        var parameters = new URLSearchParams(window.location.search);
        return parameters.has("session") && ! this.willStartSession();
    }

    willStartSession() {
        var parameters = new URLSearchParams(window.location.search);
        return parameters.has("start");
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