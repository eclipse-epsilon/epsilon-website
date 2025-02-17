import {programPanel, consolePanel, firstModelPanel, firstMetamodelPanel, secondModelPanel, secondMetamodelPanel, secondProgramPanel, thirdModelPanel, thirdMetamodelPanel, outputPanel} from './Playground.js'

class SettingsDialog {

    showEditorLineNumbers = false;

    show(event) {
        event.preventDefault();

        var panels = window.getActivePanels();

        var visibilityCheckboxes = "";

        for (const panel of panels) {
            visibilityCheckboxes += this.createPanelVisibilityCheckbox(panel, true) + "<br/>";
        }

        var self = this;
        Metro.dialog.create({
            title: "Settings",
            content: `
            <h6>Editors</h6>
            `
                + self.createEditorLineNumbersCheckbox() +
                `
            <h6>Visible Panels</h6>
            `
                + visibilityCheckboxes +
                `
            `,
            actions: [
                {
                    caption: "Apply",
                    cls: "js-dialog-close success",
                    onclick: function () {
                        for (const panel of panels) {
                            var visible = document.getElementById(panel.getId() + "Visible").checked;
                            panel.setVisible(visible);
                        }
                        self.updateEditorLineNumbers();
                        updateGutterVisibility();
                        fit();
                    }
                },
                {
                    caption: "Cancel",
                    cls: "js-dialog-close"
                }
            ],
            closeButton: true
        });
    }

    updateEditorLineNumbers() {
        this.showEditorLineNumbers = document.getElementById("editorLineNumbers").checked;
        panels.forEach(p => {
            p.getEditor().updateOptions({
                lineNumbers: this.showEditorLineNumbers ? 'on' : 'off'
            });
        });
    }

    createEditorLineNumbersCheckbox() {
        var checked = this.showEditorLineNumbers ? "checked" : "";

        return '<input type="checkbox" id="editorLineNumbers" data-role="checkbox" data-caption="Show line numbers" ' + checked + '>';
    }

    createPanelVisibilityCheckbox(panel) {
        var checked = panel.isVisible() ? "checked" : "";
        
        return '<input type="checkbox" id="' + panel.getId() + 'Visible" data-role="checkbox" data-caption="' + panel.getTitle() + '" ' + checked + '>';
    }

    
}

export { SettingsDialog };