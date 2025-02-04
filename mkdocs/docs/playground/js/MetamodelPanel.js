import { ModelPanel } from './ModelPanel.js';
import * as monaco from 'monaco-editor';

class MetamodelPanel extends ModelPanel {
    constructor(id) {
        super(id, true, null);
        this.createButtons();
        this.setTitleAndIcon("Metamodel", "emfatic");
    }

    setupSyntaxHighlighting() {
        monaco.editor.setModelLanguage(this.editor.getModel(), "emf");
    }

    getButtons() {
        return [{
            html: this.buttonHtml("help", "Emfatic language reference"),
            cls: "sys-button",
            onclick: "window.open('https://www.eclipse.org/epsilon/doc/articles/playground/#emfatic-metamodels-in-the-playground');"
        },{
            html: this.buttonHtml("diagram", "Show/hide the metamodel class diagram", this.getDiagramButtonId()),
            cls: "sys-button",
            onclick: this.id + "Panel.toggleDiagram()"
        },{
            html: this.buttonHtml("refresh", "Refresh the metamodel class diagram", this.getDiagramRefreshButtonId()),
            cls: "sys-button",
            onclick: this.id + "Panel.refreshDiagram()"
        }, {
            html: this.buttonHtml("fit-diagram", "Fit the metamodel class diagram", this.getFitDiagramButtonId()),
            cls: "sys-button",
            onclick: this.id + "Panel.fitDiagram()"
        }];
    }
    
    refreshDiagram() {
        this.refreshDiagramImpl(backend.getEmfaticToPlantUMLService(), "EmfaticToPlantUML", this.id + "Diagram", "metamodel", null, this.getEditor());
    }

}

export { MetamodelPanel };