import { ModelPanel } from "./ModelPanel.js";
import { language } from "./Playground.js";

class OutputPanel extends ModelPanel {

    outputType;
    outputLanguage;
    language;
    generatedFiles;

    constructor(id, language, outputType, outputLanguage) {
        super(id, false, null);
        this.outputType = outputType;
        this.outputLanguage = outputLanguage;
        this.language = language;
        this.createButtons();
        this.getEditor().getSession().setMode("ace/mode/" + outputLanguage.toLowerCase());
        //this.getEditor().getSession().setUseWrapMode(false);
    }

    setupSyntaxHighlighting() {}

    getButtons() {
        return (this.outputType == "code") ? [{
            html: this.buttonHtml("highlight", "Set generated text language"),
            cls: "sys-button",
            onclick: this.id + "Panel.setOutputLanguage()"
        }] : [{
            html: this.buttonHtml("fit-diagram", "Fit the diagram", this.getFitDiagramButtonId()),
            cls: "sys-button",
            onclick: this.id + "Panel.fitDiagram()"
        }];
    }

    getSelect() {
        return Metro.getPlugin("#generatedFiles", 'select');
    }

    setGeneratedFiles(generatedFiles) {
        this.generatedFiles = generatedFiles;

        var options = new Map();
        for (const generatedFile of generatedFiles) {
            options.set(generatedFile.path, "<span>" + generatedFile.path + "</span>");
        }

        var select = this.getSelect();
        var previousSelection = select.getSelected();
        
        select.data(Object.fromEntries(options));

        var selection = generatedFiles.find(f => f.path == previousSelection) != null ? previousSelection : generatedFiles[0]?.path;
        select.val(selection);
        this.displayGeneratedFile(selection);
    }

    setOutputLanguage() {
        var self = this;
        Metro.dialog.create({
            title: "Set Generated Text Language",
            content: "<p>You can set the language of the generated text to <a href='https://github.com/ajaxorg/ace/tree/master/lib/ace/mode'>any language</a> supported by the <a href='https://ace.c9.io/'>ACE editor</a>. </p><br><input type='text' id='language' data-role='input' value='" + self.outputLanguage + "'>",
            actions: [
                {
                    caption: "OK",
                    cls: "js-dialog-close success",
                    onclick: function () {
                        var outputLanguage = document.getElementById("language").value;
                        self.getEditor().getSession().setMode("ace/mode/" + outputLanguage.toLowerCase());
                    }
                },
                {
                    caption: "Cancel",
                    cls: "js-dialog-close"
                }
            ]
        });
    }

    displayGeneratedFile(path) {
        for (const generatedFile of this.generatedFiles) {
            if (generatedFile.path == path) {
                this.setValue(generatedFile.content);
                // Set the right syntax highlighting for the file extension
                var modelist = ace.require("ace/ext/modelist");
                this.getEditor().getSession().setMode(modelist.getModeForPath(path + "").mode);
                return;
            }
        }

        // If the generated path is invalid, reset the editor
        this.setValue("");
        this.getEditor().getSession().setMode("ace/mode/text");
    }

    generatedFileSelected() {
        this.displayGeneratedFile(this.getSelect().getSelected()[0]);
    }

    createElement() {
        var root = super.createElement();
        root.setAttribute("style", "padding: 0px");

        if (language == "egx" || language == "pinset") {
            var select = document.createElement("select");
            select.setAttribute("data-role", "select");
            select.setAttribute("data-on-item-select", "outputPanel.generatedFileSelected()");
            select.setAttribute("id", "generatedFiles");
            select.setAttribute("style","width:100%");
            root.insertBefore(select, root.children[0]);
        }

        return root;
    }

    init() {
        super.init();
        this.setFitDiagramButtonVisible(true);
    }
}

export { OutputPanel };
