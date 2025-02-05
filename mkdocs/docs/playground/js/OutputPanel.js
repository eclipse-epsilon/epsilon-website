import { ModelPanel } from "./ModelPanel.js";
import { language } from "./Playground.js";
import * as monaco from 'monaco-editor';

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
        this.setLanguage(outputLanguage.toLowerCase());
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
        var previousSelection = select.getSelected()[0];
        
        select.data(Object.fromEntries(options));

        var selection = generatedFiles.find(f => f.path == previousSelection) != null ? previousSelection : generatedFiles[0]?.path;
        select.val(selection);
        this.displayGeneratedFile(selection);
    }

    setOutputLanguage() {
        var self = this;
        Metro.dialog.create({
            title: "Set Generated Text Language",
            content: "<p>You can set the language of the generated text to <a href='https://github.com/microsoft/monaco-editor/tree/main/src/basic-languages'>any language</a> supported by the Monaco editor. </p><br><input type='text' id='language' data-role='input' value='" + self.outputLanguage + "'>",
            actions: [
                {
                    caption: "OK",
                    cls: "js-dialog-close success",
                    onclick: function () {
                        var outputLanguage = document.getElementById("language").value;
                        self.setLanguage(outputLanguage.toLowerCase());
                    }
                },
                {
                    caption: "Cancel",
                    cls: "js-dialog-close"
                }
            ]
        });
    }

    getLanguageForPath(path) {
        const ext = path.split('.').pop(); // Extract file extension
        return monaco.languages.getLanguages().find(lang =>
            lang.extensions?.includes(`.${ext}`)
        )?.id || 'plaintext'; // Default to plaintext if unknown
    }

    setLanguage(language) {
        super.setLanguage(language);
        this.outputLanguage = language;
    }

    displayGeneratedFile(path) {
        for (const generatedFile of this.generatedFiles) {
            if (generatedFile.path == path) {
                // Set the detected language to the editor model
                this.setLanguage(this.getLanguageForPath(path));
                this.setValue(generatedFile.content);
                return;
            }
        }
        
        // If the generated path is invalid, reset the editor
        this.setValue("");
        this.setLanguage("plaintext");
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
