import {programPanel, consolePanel, firstModelPanel, firstMetamodelPanel, secondModelPanel, secondMetamodelPanel, secondProgramPanel, thirdModelPanel, thirdMetamodelPanel, outputPanel, liveShareManager} from './Playground.js'

class LiveShareDialog {

    showEditorLineNumbers = false;

    show(event) {
        event.preventDefault();

        if (!liveShareManager.inSession()) {
            liveShareManager.startSession();
        }

        Metro.dialog.create({
            title: "Live Sharing",
            content: "<p>You can invite others to join this session by sharing with them the URL below.</p><br/>" + 
                //"<input style='width:100%' value='" + liveShareManager.getShareURL() + "'>",
                "<a href='" + liveShareManager.getShareURL() + "'>" + liveShareManager.getShareURL() + "</a>",
                
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
    }
    
}

export { LiveShareDialog };