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
                content: "<p>You can invite others to join this session by sharing the link below with them.</p><br/>" + 
                    "<input style='width:100%' value='" + liveShareManager.getShareURL() + "'>",
                    //"<a href='" + liveShareManager.getShareURL() + "'>" + liveShareManager.getShareURL() + "</a>",
                    
                actions: [
                    {
                        caption: "Copy URL to Clipboard",
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
                    
                ]
            });
        });
    }
    
}

export { LiveShareDialog };