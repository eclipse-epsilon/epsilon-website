import 'ace-builds/src-min-noconflict/ace';
import 'ace-builds/src-min-noconflict/theme-eclipse';
import 'ace-builds/src-min-noconflict/mode-xml';
import 'ace-builds/src-min-noconflict/mode-yaml';
import 'ace-builds/src-min-noconflict/mode-java';
import 'ace-builds/src-min-noconflict/mode-html';
import 'ace-builds/src-min-noconflict/ext-modelist';

import { ModelPanel } from './ModelPanel.js';
import { ConsolePanel } from "./ConsolePanel.js";
import { ProgramPanel } from "./ProgramPanel.js";
import { OutputPanel } from "./OutputPanel.js";
import { ExampleManager } from './ExampleManager.js';
import { DownloadDialog } from './DownloadDialog.js';
import { MetamodelPanel } from './MetamodelPanel.js';
import { SettingsDialog } from './SettingsDialog.js';
import { Preloader } from './Preloader.js';
import { Backend } from './Backend.js';
import { Layout } from './Layout.js';
import 'metro4';
import './highlighting/highlighting.js';

export var language = "eol";
var outputType = "text";
var outputLanguage = "text";
var example;
var url = window.location + "";
var questionMark = url.indexOf("?");

export var programPanel = new ProgramPanel();
export var secondProgramPanel = new ProgramPanel("secondProgram");
export var firstMetamodelPanel = new MetamodelPanel("firstMetamodel");
export var secondMetamodelPanel = new MetamodelPanel("secondMetamodel");
export var thirdMetamodelPanel = new MetamodelPanel("thirdMetamodel");
export var firstModelPanel = new ModelPanel("firstModel", true, firstMetamodelPanel);
export var thirdModelPanel = new ModelPanel("thirdModel", true, thirdMetamodelPanel);
export var secondModelPanel;
export var outputPanel;

export var consolePanel = new ConsolePanel();
var downloadDialog = new DownloadDialog();
var settingsDialog = new SettingsDialog();
var preloader = new Preloader();
export var backend = new Backend();
export var examplesManager = new ExampleManager();
var panels = [];

backend.configure();

example = examplesManager.getSelectedExample();
setup();

function setup() {

    if (example.eol != null) { example.program = example.eol; language = "eol";}
    else {language = example.language};

    if (example.outputType != null) {outputType = example.outputType;}
    if (example.outputLanguage != null) {outputLanguage = example.outputLanguage;}

    var secondModelEditable = !(language == "etl" || language == "emg" || language == "flock" || language == "eml");

    secondModelPanel = new ModelPanel("secondModel", secondModelEditable, secondMetamodelPanel);
    outputPanel = new OutputPanel("output", language, outputType, outputLanguage);

    new Layout().create("navview-content", language);

    panels = [programPanel, secondProgramPanel, consolePanel, firstModelPanel, firstMetamodelPanel, secondModelPanel, secondMetamodelPanel, thirdModelPanel, thirdMetamodelPanel, outputPanel];

    arrangePanels();

    //TODO: Fix "undefined" when fields are empty
    programPanel.setLanguage(language);
    if (language == "egx") secondProgramPanel.setLanguage("egl");
    if (language == "eml") secondProgramPanel.setLanguage("ecl");

    programPanel.setValue(example.program);
    secondProgramPanel.setValue(example.secondProgram);
    firstModelPanel.setValue(example.flexmi);
    firstMetamodelPanel.setValue(example.emfatic);
    secondModelPanel.setValue(example.secondFlexmi);
    secondMetamodelPanel.setValue(example.secondEmfatic);
    thirdModelPanel.setValue(example.thirdFlexmi);
    thirdMetamodelPanel.setValue(example.thirdEmfatic);

    document.getElementById("navview").style.display = "block";

    document.addEventListener('click', function(evt) {
        if (evt.target == document.getElementById("toggleNavViewPane")) {
            setTimeout(function(){ fit(); }, 1000);
        }
    });

    $(window).keydown(function(event) {
      if ((event.metaKey && event.keyCode == 83) || (event.ctrlKey && event.keyCode == 83)) {
        runProgram();
        event.preventDefault();
      }
    });

    Metro.init();
    panels.forEach(panel => panel.init());
    examplesManager.openActiveExamplesSubMenu();
    fit();
}


function copyShortenedLink(event) {
    event.preventDefault();
    var content = btoa(editorsToJson());
    var xhr = new XMLHttpRequest();

    xhr.open("POST", backend.getShortURLService(), true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);

                if (questionMark > 0) {
                    var baseUrl = (window.location+"").substring(0, questionMark);
                }
                else {
                    baseUrl = window.location;
                }
                Metro.notify.killAll();
                Metro.dialog.create({
                    title: "Share link",
                    content: "<p>The link below contains a snapshot of the contents of all the editors in the playground. Anyone who visits this link should be able to view and run your example.</p><br/> <input style='width:100%' value='" + baseUrl + "?" + json.shortened + "'>",
                    closeButton: true,
                    actions: [
                    {
                        caption: "Copy to clipboard",
                        cls: "js-dialog-close success",
                        onclick: function(){
                            copyToClipboard(baseUrl + "?" + json.shortened);
                        }
                    }]
                });
            }
            Metro.notify.killAll();
        }
    };
    var data = JSON.stringify({"content": content, "function": "ShortURL"});
    xhr.send(data);
    longNotification("Generating short link");
    return false;
}

function copyToClipboard(str) {
    var el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

function arrangePanels() {

    if (language == "egl" || language == "egx") {
        if (outputType == "dot") {
            outputPanel.showDiagram();
            outputPanel.setTitleAndIcon("Graphviz", "diagram");
        }
        else if (outputType == "html") {
            outputPanel.showDiagram();
            outputPanel.setTitleAndIcon("HTML", "html");
        }
        else if (outputType == "puml") {
            outputPanel.showDiagram();
            outputPanel.setTitleAndIcon("PlantUML", "diagram");
        }
        else if (outputType == "code") {
            outputPanel.hideDiagram();
            outputPanel.showEditor();

            outputPanel.setTitleAndIcon("Generated Text", "editor");
        }
    }
    else if (language == "etl") {
        secondModelPanel.showDiagram();
        secondModelPanel.hideEditor();

        firstModelPanel.setTitle("Source Model");
        firstMetamodelPanel.setTitle("Source Metamodel");
        secondModelPanel.setTitle("Target Model");
        secondMetamodelPanel.setTitle("Target Metamodel");
        secondModelPanel.setIcon("diagram");
    }
    else if (language == "emg") {
        secondModelPanel.showDiagram();
        secondModelPanel.hideEditor();

        firstMetamodelPanel.setTitle("Metamodel");
        secondModelPanel.setTitle("Generated Model");
        secondModelPanel.setIcon("diagram");
    }
    else if (language == "pinset") {
        outputPanel.hideDiagram();
        outputPanel.showEditor();

        outputPanel.setTitleAndIcon("Generated CSVs", "editor");
    }
    else if (language == "eml") {
        secondModelPanel.showDiagram();
        secondModelPanel.hideEditor();

        firstModelPanel.setTitle("Left Model");
        firstMetamodelPanel.setTitle("Left Metamodel");

        thirdModelPanel.setTitle("Right Model");
        thirdMetamodelPanel.setTitle("Right Metamodel");

        secondModelPanel.setTitle("Merged Model");
        secondMetamodelPanel.setTitle("Target Metamodel");
        secondModelPanel.setIcon("diagram");
    }
    else if (language == "flock") {
        secondModelPanel.showDiagram();
        secondModelPanel.hideEditor();

        firstModelPanel.setTitle("Original Model");
        firstMetamodelPanel.setTitle("Original Metamodel");
        secondModelPanel.setTitle("Migrated Model");
        secondMetamodelPanel.setTitle("Evolved Metamodel");
        secondModelPanel.setIcon("diagram");
    }
    else if (language == "evl" || language == "epl") {
        outputPanel.showDiagram();

        if (language == "evl") {
            outputPanel.setTitleAndIcon("Problems", "problems");
        }
        else {
            outputPanel.setTitleAndIcon("Pattern Matches", "diagram");
        }
    }
}

function editorsToJsonObject() {
    return {
        "language": language,
        "outputType": outputType,
        "outputLanguage": outputLanguage,
        "program": programPanel.getValue(),
        "secondProgram": secondProgramPanel.getValue(),
        "emfatic": firstMetamodelPanel.getValue(),
        "flexmi": firstModelPanel.getValue(),
        "secondEmfatic": secondMetamodelPanel.getValue(),
        "secondFlexmi": secondModelPanel.getValue(),
        "thirdEmfatic": thirdMetamodelPanel.getValue(),
        "thirdFlexmi": thirdModelPanel.getValue(),
    };
}

function editorsToJson() {
    return JSON.stringify(editorsToJsonObject());
}

function fit() {

    var splitter = document.getElementById("splitter");
    splitter.style.minHeight = window.innerHeight + "px";
    splitter.style.maxHeight = window.innerHeight + "px";

    panels.forEach(panel => panel.fit());
    preloader.hide();
}

function runProgram() {

    var xhr = new XMLHttpRequest();
    var url = backend.getRunEpsilonService();

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);

                if (response.hasOwnProperty("error")) {
                    consolePanel.setError(response.error);
                }
                else {
                    consolePanel.setOutput(response.output);

                    if (language == "etl" || language == "emg" || language == "flock" || language == "eml") {
                        secondModelPanel.renderDiagram(response.targetModelDiagram);
                    }
                    else if (language == "evl") {
                        outputPanel.renderDiagram(response.validatedModelDiagram);
                    }
                    else if (language == "epl") {
                        outputPanel.renderDiagram(response.patternMatchedModelDiagram);
                    }
                    else if (language == "egx" || language == "pinset") {
                        outputPanel.setGeneratedFiles(response.generatedFiles);
                        consolePanel.setOutput(response.output);
                    }
                    else if (language == "egl") {
                        if (outputType == "code") {
                            outputPanel.getEditor().setValue(response.generatedText.trim(), 1);
                            consolePanel.setOutput(response.output);
                        }
                        else if (outputType == "html") {
                            consolePanel.setOutput(response.output);
                            var iframe = document.getElementById("htmlIframe");
                            if (iframe == null) {
                                iframe = document.createElement("iframe");
                                iframe.id = "htmlIframe"
                                iframe.style.height = "100%";
                                iframe.style.width = "100%";
                                document.getElementById("outputDiagram").appendChild(iframe);
                            }

                            iframe.srcdoc = response.generatedText;
                        }
                        else if (outputType == "puml" || outputType == "dot") {

                            consolePanel.setOutput(response.output);
                            var krokiEndpoint = "";
                            if (outputType == "puml") krokiEndpoint = "plantuml";
                            else krokiEndpoint = "graphviz/svg"

                            var krokiXhr = new XMLHttpRequest();
                            krokiXhr.open("POST", "https://kroki.io/" + krokiEndpoint, true);
                            krokiXhr.setRequestHeader("Accept", "image/svg+xml");
                            krokiXhr.setRequestHeader("Content-Type", "text/plain");
                            krokiXhr.onreadystatechange = function () {
                                if (krokiXhr.readyState === 4) {
                                    if (krokiXhr.status === 200) {
                                        outputPanel.renderDiagram(krokiXhr.responseText);
                                    }
                                }
                            };
                            krokiXhr.send(response.generatedText);
                        }
                        else {
                            consolePanel.setOutput(response.output + response.generatedText);
                        }
                    }
                }

            }
            Metro.notify.killAll();
        }
    };

    var data = editorsToJsonObject();
    data.function = "RunEpsilon";
    xhr.send(JSON.stringify(data));

    longNotification("Executing program");
}

function getActivePanels() {
    var panels = [programPanel, consolePanel];

    if (language != "emg") panels.push(firstModelPanel, firstMetamodelPanel);

    if (language == "etl" || language == "flock") {
        panels.push(secondModelPanel, secondMetamodelPanel);
    }
    else if (language == "emg") {
        panels.push(firstMetamodelPanel, secondModelPanel);
    }
    else if (language == "eml") {
        panels.push(secondProgramPanel, thirdModelPanel, thirdMetamodelPanel, secondModelPanel, secondMetamodelPanel);
    }
    else if (language == "evl" || language == "epl" || language == "egl" || language == "egx" || language == "pinset") {
        panels.push(outputPanel);
        if (language == "egx") {
            panels.push(secondProgramPanel);
        }
    }

    return panels;
}

function longNotification(title, cls="light") {
    Metro.notify.create("<b>" + title + "...</b><br>This may take a few seconds to complete if the back end is not warmed up.", null, {keepOpen: true, cls: cls, width: 300});
}

function updateGutterVisibility() {
    for (const gutter of Array.prototype.slice.call(document.getElementsByClassName("gutter"))) {

        var visibleSiblings = Array.prototype.slice.call(gutter.parentNode.children).filter(
            child => child != gutter && getComputedStyle(child).display != "none");

        if (visibleSiblings.length > 1) {
            var nextVisibleSibling = getNextVisibleSibling(gutter);
            var previousVisibleSibling = getPreviousVisibleSibling(gutter);
            if (nextVisibleSibling != null && nextVisibleSibling.className != "gutter" && previousVisibleSibling != null) {
                gutter.style.display = "flex";
            }
            else {
                gutter.style.display = "none";
            }
        }
        else {
            gutter.style.display = "none";
        }
    }
}

function getNextVisibleSibling(element) {
    var sibling = element.nextElementSibling;
    while (sibling != null) {
        if (getComputedStyle(sibling).display != "none") return sibling;
        sibling = sibling.nextElementSibling;
    }
}

function getPreviousVisibleSibling(element) {
    var sibling = element.previousElementSibling;
    while (sibling != null) {
        if (getComputedStyle(sibling).display != "none") return sibling;
        sibling = sibling.previousElementSibling;
    }
}

function showDownloadOptions(event) {
    downloadDialog.show(event);
}

function showSettings(event) {
    settingsDialog.show(event);
}

// Some functions and variables are accessed
// by onclick - or similer - events
// We need to use window.x = x for this to work
window.fit = fit;
window.updateGutterVisibility = updateGutterVisibility;
window.runProgram = runProgram;

window.programPanel = programPanel;
window.secondProgramPanel = secondProgramPanel;
window.consolePanel = consolePanel;
window.firstModelPanel = firstModelPanel;
window.secondModelPanel = secondModelPanel;
window.outputPanel = outputPanel;
window.firstMetamodelPanel = firstMetamodelPanel;
window.secondMetamodelPanel = secondMetamodelPanel;
window.thirdModelPanel = thirdModelPanel;
window.thirdMetamodelPanel = thirdMetamodelPanel;
window.panels = panels;

window.backend = backend;
window.longNotification = longNotification;
window.showDownloadOptions = showDownloadOptions;
window.showSettings = showSettings;
window.copyShortenedLink = copyShortenedLink;
window.downloadDialog = downloadDialog;
window.language = language;
window.getActivePanels = getActivePanels;
