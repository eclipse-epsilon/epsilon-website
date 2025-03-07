import {programPanel, consolePanel, firstModelPanel, firstMetamodelPanel, secondModelPanel, secondMetamodelPanel, secondProgramPanel, thirdModelPanel, thirdMetamodelPanel, outputPanel, liveShareManager} from './Playground.js'

class LiveShareDialog {

    showEditorLineNumbers = false;

    //TODO: Show a message to inform the user that we are trying to connect to the live sharing server as this can take a while sometimes
    show(event) {
        event.preventDefault();

        liveShareManager.attempt( function () {
            if (!liveShareManager.inSession()) {
                liveShareManager.startSession();
            }

            Metro.dialog.create({
                title: "Live Sharing",
                content: "<p>You can invite others to join this session by sharing " + 
                    //"<input style='width:100%' value='" + liveShareManager.getShareURL() + "'>",
                    "<a href='" + liveShareManager.getShareURL() + "'>this link</a> with them. " +
                    "Please note that live sharing should be used for <a href='https://eclipse.dev/epsilon/doc/articles/playground/#save-and-share-your-work' target='_blank'>ephemeral collaboration only</a>.",
                actions: [
                    {
                        caption: "Copy Link to Clipboard",
                        cls: "js-dialog-close success",
                        onclick: function(){
                            copyToClipboard(liveShareManager.getShareURL());
                        }
                    },
                    {
                        caption: "Stop Live Sharing",
                        cls: "js-dialog-close alert",
                        onclick: function () {
                            liveShareManager.leaveSession();
                        }
                    },
                    {
                        caption: "Close",
                        cls: "js-dialog-close"
                    }
                    
                ],
                closeButton: true
            });
        });
    }
    
}

export { LiveShareDialog };