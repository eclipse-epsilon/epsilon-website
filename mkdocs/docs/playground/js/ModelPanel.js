import { Panel } from "./Panel.js";
import { Splitter } from "./Splitter.js";
import * as monaco from 'monaco-editor'

import svgPanZoom from 'svg-pan-zoom';

class ModelPanel extends Panel {

    editable;
    metamodelPanel;
    diagramSvg;

    constructor(id, editable, metamodelPanel) {
        super(id);
        this.editable = editable;
        this.metamodelPanel = metamodelPanel;
        
        this.createButtons();
        this.setTitleAndIcon("Model", "flexmi");
    }

    init() {
        super.init();
        this.setDiagramRefreshButtonVisible(false);
        this.setFitDiagramButtonVisible(!this.editable);
        this.setupSyntaxHighlighting();
    }

    showDiagram() {
        $("#" + this.id + "Diagram").show();
    }

    hideDiagram() {
        $("#" + this.id + "Diagram").hide();
    }

    showEditor() {
        $("#" + this.id + "Editor").show();
    }

    hideEditor() {
        $("#" + this.id + "Editor").hide();
    }

    refreshDiagram() {
        this.refreshDiagramImpl(backend.getFlexmiToPlantUMLService(), "FlexmiToPlantUML", this.id + "Diagram", "model", this.getEditor(), this.metamodelPanel.getEditor());
    }

    setupSyntaxHighlighting() {
        // this.editor.updateOptions({language: "xml"});
        //var model = this.editor.getModel();
        monaco.editor.setModelLanguage(this.editor.getModel(), 'xml');
        // this.editor.getSession().setMode("ace/mode/xml");
        // this.updateSyntaxHighlighting();
        // var self = this;
        // this.editor.getSession().on('change', function () {
        //     self.updateSyntaxHighlighting();
        // });
    }

    /**
     * Updates the syntax highlighting mode of a Flexmi
     * editor based on its content. If the content starts with
     * < then the XML flavour is assumed, otherwise, the YAML
     * flavour is assumed
     */
    updateSyntaxHighlighting() {
        var val = this.editor.getSession().getValue();
        if ((val.trim() + "").startsWith("<")) {
            this.editor.getSession().setMode("ace/mode/xml");
        }
        else {
            this.editor.getSession().setMode("ace/mode/yaml");
        }
    }

    getButtons() {
        return this.editable ? [{
            html: this.buttonHtml("help", "Flexmi language reference"),
            cls: "sys-button",
            onclick: "window.open('https://www.eclipse.org/epsilon/doc/flexmi');"
        }, {
            html: this.buttonHtml("diagram", "Show/hide the model object diagram", this.getDiagramButtonId()),
            cls: "sys-button",
            onclick: this.id + "Panel.toggleDiagram()"
        }, {
            html: this.buttonHtml("refresh", "Refresh the model object diagram", this.getDiagramRefreshButtonId()),
            cls: "sys-button",
            onclick: this.id + "Panel.refreshDiagram()"
        }, {
            html: this.buttonHtml("fit-diagram", "Fit the model object diagram", this.getFitDiagramButtonId()),
            cls: "sys-button",
            onclick: this.id + "Panel.fitDiagram()"
        }] : [{
            html: this.buttonHtml("fit-diagram", "Fit the model object diagram", this.getFitDiagramButtonId()),
            cls: "sys-button",
            onclick: this.id + "Panel.fitDiagram()"
        }];
    }

    toggleDiagram() {
        var element = document.getElementById(this.id + "Diagram");
        if (element == null) return;
    
        if (getComputedStyle(element).display == "none") {
            element.style.display = "flex";
            this.getDiagramButton().className = "mif-diagram-hide";
            if (element.innerHTML.length == 0) {
                this.refreshDiagram();
            }
            this.setDiagramRefreshButtonVisible(true);
            this.setFitDiagramButtonVisible(true);
        }
        else {
            element.style.display = "none";
            this.getDiagramButton().className = "mif-diagram";
            this.setDiagramRefreshButtonVisible(false);
            this.setFitDiagramButtonVisible(false);
        }
        this.fit();
        updateGutterVisibility();
    }

    getDiagramButtonId() {
        return this.id + "DiagramButton";
    }

    getFitDiagramButtonId() {
        return this.id + "FitDiagramButton";
    }

    getDiagramButton() {
        return document.getElementById(this.getDiagramButtonId());
    }

    getDiagramRefreshButtonId() {
        return this.id + "DiagramRefreshButton";
    }

    setDiagramRefreshButtonVisible(visible) {
        var diagramRefreshButton = document.getElementById(this.getDiagramRefreshButtonId());
        if (diagramRefreshButton != null) {
            diagramRefreshButton.parentElement.style.display = visible ? "flex" : "none";
        }
    }

    setFitDiagramButtonVisible(visible) {
        var fitDiagramButton = document.getElementById(this.getFitDiagramButtonId());
        if (fitDiagramButton != null) {
            fitDiagramButton.parentElement.style.display = visible ? "flex" : "none";
        }
    }

    fitDiagram() {
        if (this.diagramSvg) {
            this.renderDiagram(this.diagramSvg);
        }
    }

    /* TODO: Rename to something more sensible */
    refreshDiagramImpl(url, functionName, diagramId, diagramName, modelEditor, metamodelEditor) {

        var diagramElement = document.getElementById(diagramId);
        diagramElement.innerHTML = '<img src="images/preloader.gif" style="width:100px;margin:auto"/>'

        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        var self = this;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var json = JSON.parse(xhr.responseText);

                    // FIXME: Make both functions return the PlantUML diagram in a "diagram" field
                    var jsonField = "modelDiagram";
                    if (diagramId.endsWith("etamodelDiagram"))
                        jsonField = "metamodelDiagram";

                    var message = "A diagram cannot be shown due to the following error ";
                    if (jsonField == "metamodelDiagram") {
                        message += " in the metamodel.";
                    }
                    else {
                        message += " in the model or its metamodel.";
                    }

                    if (json.hasOwnProperty("error")) {
                        diagramElement.innerHTML = '<div class="model-rendering-error">' + message + '<div class="model-rendering-error-message">' + json.error + '</div></div>';
                        self.diagramSvg = null;
                    }
                    else {
                        self.renderDiagram(json[jsonField]);
                    }
                }
            }
        };
        var data = this.modelToJsonObject(modelEditor, metamodelEditor);
        data.function = functionName;
        xhr.send(JSON.stringify(data));
    }

    renderDiagram(svg) {
        var diagramId = this.id + "Diagram";
        var diagramElement = document.getElementById(diagramId);
        
        this.diagramSvg = svg;

        if (diagramId == "outputDiagram") {
            diagramElement.parentElement.style.padding = "0px";
        }
        
        svgPanZoom(this.embed(svg, diagramElement), {
          minZoom: 0
        });
    }

    embed(svg, container) {

        var parser = new DOMParser();
        var doc = parser.parseFromString(svg, "image/svg+xml");
        svg = doc.documentElement;

        var svgHeight = svg.height.baseVal.value;
        var svgWidth = svg.width.baseVal.value;

        var containerHeight = container.offsetHeight;
        var containerWidth = container.offsetWidth;

        // For some reason, every time the SVG is inserted under the container,
        // the container's height grows by 6px, which causes the SVG to 
        // move downwards with every re-generation. Interestingly, this only
        // happens with diagrams in the output panel.
        // This is a temporary fix until we get to the bottom of this.
        if (this.id == "output" || !this.editable) containerHeight = containerHeight - 6;

        var scaleX = containerWidth / svgWidth;
        var scaleY = containerHeight / svgHeight;
        
        var viewBoxWidthBeforeScaling = svg.viewBox.baseVal.width;
        var viewBoxHeightBeforeScaling = svg.viewBox.baseVal.height;

        var viewBoxWidth;
        var viewBoxHeight;

        if (svgHeight > containerHeight || svgWidth > containerWidth) {
            var scale = Math.min(scaleX, scaleY);
            svgHeight = Math.floor(svgHeight * scale);
            svgWidth = Math.floor(svgWidth * scale);

            svg.style.height = containerHeight + "px";
            svg.style.width = containerWidth + "px";

            viewBoxWidth = viewBoxWidthBeforeScaling * (containerWidth / svgWidth);
            viewBoxHeight = viewBoxHeightBeforeScaling * (containerHeight / svgHeight);

            svg.viewBox.baseVal.width = viewBoxWidth;
            svg.viewBox.baseVal.height = viewBoxHeight;
        }
        else {
            viewBoxWidth = viewBoxWidthBeforeScaling * scaleX;
            viewBoxHeight = viewBoxHeightBeforeScaling * scaleY;
            svg.viewBox.baseVal.height = viewBoxHeight;
            svg.viewBox.baseVal.width = viewBoxWidth;
            
            svg.style.width = containerWidth + "px";
            svg.style.height = containerHeight + "px";
        }

        svg.viewBox.baseVal.x = svg.viewBox.baseVal.x - ((viewBoxWidth - viewBoxWidthBeforeScaling) / 2);
        svg.viewBox.baseVal.y = svg.viewBox.baseVal.y - ((viewBoxHeight - viewBoxHeightBeforeScaling) / 2);
        
        container.innerHTML = svg.outerHTML;
        return container.firstElementChild;
    }

    modelToJsonObject(modelEditor, metamodelEditor) {
        return {
            "flexmi": modelEditor != null ? modelEditor.getValue() : "",
            "emfatic": metamodelEditor != null ? metamodelEditor.getValue() : ""
        };
    }

    modelToJson(modelEditor, metamodelEditor) {
        return JSON.stringify(
            this.modelToJsonObject(modelEditor, metamodelEditor)
        );
    }

    fit() {
        // Fit the editor
        var editorElement = document.getElementById(this.id + "Editor");
        if (editorElement != null) {
            editorElement.parentNode.parentNode.style = "flex-basis: calc(100% - 4px); padding: 0px";
            var parentElement = editorElement.parentElement.parentElement.parentElement;
            editorElement.style.width = parentElement.offsetWidth + "px";
            editorElement.style.height = parentElement.offsetHeight - 42 + "px";
        }

        // this.editor.resize();
        
        // Fit the diagram
        var diagramElement = document.getElementById(this.id + "Diagram");
        if (diagramElement != null) {
            var svg = diagramElement.firstElementChild;
            if (svg != null) {
                if (svg.tagName == "svg") {
                    diagramElement = diagramElement.parentElement.parentElement.parentElement;
                    svg.style.width = diagramElement.offsetWidth + "px";
                    svg.style.height = diagramElement.offsetHeight - 42 + "px";
                }
            }
        }
    }

    createElement() {
        var root = document.createElement("div");

        root.setAttribute("data-role", "panel");
        root.setAttribute("class", "modelPanel");
        root.setAttribute("id", this.id + "Panel");

        var editor = document.createElement("div");
        editor.setAttribute("id", this.id + "Editor");
        editor.setAttribute("class", "editor");
        
        var diagram = document.createElement("div");
        diagram.setAttribute("id", this.id + "Diagram");
        diagram.setAttribute("class", "diagram");
        
        var splitter = new Splitter(editor, diagram, "horizontal", "0,100").getElement(); //Layout.createHorizontalSplitter([editor, diagram], "0,100");
        splitter.setAttribute("class", "h-100");

        root.appendChild(splitter);

        return root;
    }


}

export { ModelPanel };