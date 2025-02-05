import { Panel } from "./Panel.js";

class ConsolePanel extends Panel {

    constructor() {
        super("console");
        this.editor.updateOptions({ readOnly: true });
        this.setValue("");
        this.createButtons();
        this.setTitleAndIcon("Console", "console");
    }

    getButtons() {
        return [{
            html: this.buttonHtml("clear", "Clear the console"),
            cls: "sys-button",
            onclick: "consolePanel.setValue('')"
        }];
    }

    setOutput(str) {
        this.setLanguage("out");
        this.editor.updateOptions({wordWrap: "off"});
        this.setValue(str);
    }

    setError(str) {
        this.setLanguage("err");
        this.editor.updateOptions({wordWrap: "on"});
        this.setValue(str);
    }

    fit() {
        var editorElement = document.getElementById(this.id + "Editor");
        if (editorElement != null) {
            editorElement.parentNode.style = "flex-basis: calc(100% - 4px);";
        }
    }

    createElement() {
        var root = document.createElement("div");
        root.setAttribute("data-role", "panel");
        root.setAttribute("id", this.id + "Panel");

        var editor = document.createElement("div");
        editor.setAttribute("id", this.id + "Editor");
        editor.setAttribute("class", "editor");

        root.appendChild(editor);

        return root;
    }
}

export { ConsolePanel };
