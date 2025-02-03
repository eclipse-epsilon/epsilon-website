import { define } from "ace-builds";
import { Panel } from "./Panel.js";
import { language, programPanel, secondProgramPanel } from "./Playground.js";

class ConsolePanel extends Panel {

    constructor() {
        super("console");
        // this.editor.setReadOnly(true);
        this.setValue("");
        this.createButtons();

        // this.defineHoverlink();
        // this.detectSemanticErrorLinks(this.editor);
        // this.detectSyntacticErrorLinks(this.editor);
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
        document.getElementById("consoleEditor").style.color = "black";
        this.editor.updateOptions({wordWrap: "off"});
        this.setValue(str);
    }

    setError(str) {
        document.getElementById("consoleEditor").style.color = "#CD352C";
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

    defineHoverlink() {
        define("hoverlink", [], function (require, exports, module) {
            "use strict";

            var oop = require("ace/lib/oop");
            var event = require("ace/lib/event");
            var Range = require("ace/range").Range;
            var EventEmitter = require("ace/lib/event_emitter").EventEmitter;

            var HoverLink = function (editor, regex, fieldName, disableOn) {
                this.fieldName = fieldName;
                if (editor[this.fieldName])
                    return;
                
                editor[this.fieldName] = this;
                this.editor = editor;
                this.regex = regex;

                this.update = this.update.bind(this);
                this.onMouseMove = this.onMouseMove.bind(this);
                this.onMouseOut = this.onMouseOut.bind(this);
                this.onClick = this.onClick.bind(this);
                this.disableOn = disableOn;

                event.addListener(editor.renderer.scroller, "mousemove", this.onMouseMove);
                event.addListener(editor.renderer.content, "mouseout", this.onMouseOut);
                event.addListener(editor.renderer.content, "click", this.onClick);
            };

            (function () {
                oop.implement(this, EventEmitter);

                this.token = {};
                this.range = new Range();

                this.update = function () {
                    if (this.disableOn()) {
                        return;
                    }

                    this.$timer = null;
                    var editor = this.editor;
                    var renderer = editor.renderer;

                    var canvasPos = renderer.scroller.getBoundingClientRect();
                    var offset = (this.x + renderer.scrollLeft - canvasPos.left - renderer.$padding) / renderer.characterWidth;
                    var row = Math.floor((this.y + renderer.scrollTop - canvasPos.top) / renderer.lineHeight);
                    var col = Math.round(offset);

                    var screenPos = { row: row, column: col, side: offset - col > 0 ? 1 : -1 };
                    var session = editor.session;
                    var docPos = session.screenToDocumentPosition(screenPos.row, screenPos.column);

                    var selectionRange = editor.selection.getRange();
                    if (!selectionRange.isEmpty()) {
                        if (selectionRange.start.row <= row && selectionRange.end.row >= row)
                            return this.clear();
                    }

                    var line = editor.session.getLine(docPos.row);
                    if (docPos.column === line.length) {
                        var clippedPos = editor.session.documentToScreenPosition(docPos.row, docPos.column);
                        if (clippedPos.column != screenPos.column) {
                            return this.clear();
                        }
                    }

                    var token = this.findLink(docPos.row, docPos.column);
                    this.link = token;
                    if (!token) {
                        return this.clear();
                    }
                    this.isOpen = true;
                    editor.renderer.setCursorStyle("pointer");

                    session.removeMarker(this.marker);

                    this.range = new Range(token.row, token.start, token.row, token.start + token.value.length);
                    this.marker = session.addMarker(this.range, "ace_link_marker", "text", true);
                };

                this.clear = function () {
                    if (this.isOpen) {
                        this.editor.session.removeMarker(this.marker);
                        this.editor.renderer.setCursorStyle("");
                        this.isOpen = false;
                    }
                };

                this.getMatchAround = function (regExp, string, col) {
                    var match;
                    regExp.lastIndex = 0;
                    string.replace(regExp, function (str) {
                        var offset = arguments[arguments.length - 2];
                        var length = str.length;
                        if (offset <= col && offset + length >= col)
                            match = {
                                start: offset,
                                value: str
                            };
                    });

                    return match;
                };

                this.onClick = function () {
                    if (this.link) {
                        this.link.editor = this.editor;
                        this._signal("open", this.link);
                        this.clear();
                    }
                };

                this.findLink = function (row, column) {
                    var editor = this.editor;
                    var session = editor.session;
                    var line = session.getLine(row);

                    var match = this.getMatchAround(this.regex, line, column);
                    if (!match)
                        return;

                    match.row = row;
                    return match;
                };

                this.onMouseMove = function (e) {
                    if (this.editor.$mouseHandler.isMousePressed) {
                        if (!this.editor.selection.isEmpty())
                            this.clear();
                        return;
                    }
                    this.x = e.clientX;
                    this.y = e.clientY;
                    this.update();
                };

                this.onMouseOut = function (e) {
                    this.clear();
                };

                this.destroy = function () {
                    this.onMouseOut();
                    event.removeListener(this.editor.renderer.scroller, "mousemove", this.onMouseMove);
                    event.removeListener(this.editor.renderer.content, "mouseout", this.onMouseOut);
                    delete this.editor[this.fieldName];
                };

            }).call(HoverLink.prototype);

            exports.HoverLink = HoverLink;

        });
    }

    selectRange(editor, e, getSelectionOptions) {
        var location = e.value;
        if (editor.getValue().indexOf(location) > -1) {
            var Range = ace.require("ace/range").Range;
            var selectionOptions = getSelectionOptions(location);

            selectionOptions.panel.getEditor().selection.setRange(new Range(
                selectionOptions.startLine,
                selectionOptions.startColumn,
                selectionOptions.endLine,
                selectionOptions.endColumn
            ));  
        }
    }

    detectSemanticErrorLinks(editor) {
        var that = this;
        var semErrorRegex = /\(((.+?)@(\d+):(\d+)-(\d+):(\d+))\)/i;
        var HoverLink = ace.require("hoverlink").HoverLink;
        editor.semanticErrorLinks = new HoverLink(
            editor,
            semErrorRegex,
            "semanticErrorLinks",
            () => false
        );
        editor.semanticErrorLinks.on("open", function (e) {
            var getSelectionOptions = function (val) {
                var matches = val.match(semErrorRegex);
                var programExtension = matches[2].split(".").pop();
                return {
                    panel: language === "egx" && programExtension === "egl"
                           || language === "eml" && programExtension === "ecl"
                           ? secondProgramPanel
                           : programPanel,
                    startLine: parseInt(matches[3]) - 1,
                    startColumn: parseInt(matches[4]),
                    endLine: parseInt(matches[5]) - 1,
                    endColumn: parseInt(matches[6]),
                };
            }
            that.selectRange(editor, e, getSelectionOptions);
        });
    }

    detectSyntacticErrorLinks(editor) {
        var that = this;
        var synErrorRegex = /^Line: (\d+),( Column: \d+,)?/i;
        var HoverLink = ace.require("hoverlink").HoverLink;
        editor.syntacticErrorLinks = new HoverLink(
            editor,
            synErrorRegex,
            "syntacticErrorLinks",
            () => language === "egx" || language === "eml"
        );
        editor.syntacticErrorLinks.on("open", function (e) {
            var getSelectionOptions = function (val) {
                var matches = val.match(synErrorRegex);
                var lineNumber = parseInt(matches[1]) - 1;
                return {
                    panel: programPanel,
                    startLine: lineNumber,
                    startColumn: 0,
                    endLine: lineNumber + 1,
                    endColumn: 0,
                };
            }
            that.selectRange(editor, e, getSelectionOptions);
        });
    }
}

export { ConsolePanel };
