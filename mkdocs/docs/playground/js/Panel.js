import * as monaco from 'monaco-editor';

class Panel {

    id;
    editor;
    element;
    visible;
    parent; // The parent splitter
    maximised = false;
    hiddenPanels = [];

    constructor(id) {
        this.id = id;
        this.getElement();
        
        //TODO: Avoid defining the theme multiple times
        monaco.editor.defineTheme('default', {
            base: 'vs',
            inherit: true,
            rules: [],
            colors: { "editor.background": "#ffffff" }
            });
        
        monaco.editor.setTheme('default')
        
        this.editor = monaco.editor.create(this.element.querySelector('.editor'), {
            //theme: "hc-light",
            autoDetectHighContrast: "false",
            fontSize: 14,
            language: "eol",
            automaticLayout: true,
            minimap: {
                enabled: false
            },
            lineNumbers: "off",
            renderLineHighlight: "none",
            occurrencesHighlight: "off",
            selectionHighlight: "false"
        });

        // Set up the panel's editor
        /*
        this.editor = ace.edit(this.element.querySelector('.editor'));
        this.editor.setShowPrintMargin(false);
        this.editor.setTheme("ace/theme/eclipse");
        this.editor.renderer.setShowGutter(false);
        this.editor.setFontSize("1rem");
        this.editor.setOptions({
            fontSize: "11pt",
            useSoftTabs: true
        });*/
        // var el = this.element.querySelector('.editor');
        // console.log(el);
        // this.editor = monaco.editor.create(el, {value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'), language: 'javascript'});

        this.visible = true;
    }

    createButtons() {
        this.element.dataset.customButtons = JSON.stringify(this.getAllButtons());
    }

    getAllButtons() {
        return this.getButtons();
    }

    setTitleAndIcon(title, icon) {
        this.setTitle(title);
        this.setIcon(icon);
    }

    setTitle(title) {
        this.element.dataset.titleCaption = title;
    }

    getTitle() {
        return this.element.dataset.titleCaption;
    }

    setIcon(icon) {
        this.element.dataset.titleIcon = "<span class='mif-16 mif-" + icon + "'></span>";
    }

    setVisible(visible) {
        if (this.visible != visible) {
            this.visible = visible;

            this.element.parentNode.style.display = visible ? "flex" : "none";
            
            if (this.parent) {
                this.parent.childVisibilityChanged();
            }
            window.fit();
        }
    }

    isVisible() {
        return this.visible;
    }

    // Executed after Metro has initialised
    // using Metro.init
    init() {
        if (!this.element.parentNode) return;
        var self = this;

        // Double-clicking on the title of the panel maximises the panel
        this.element.parentNode.addEventListener('dblclick', function(e) {
            if (e.target.classList.contains("caption")) {
                self.toggleMaximise();
            }
        }, true);

        // Middle-clicking on the title of the panel hides the panel
        this.element.parentNode.addEventListener('auxclick', function(e) {
            if (e.target.classList.contains("caption") && e.which == 2) {
                //e.preventDefault();
                if (self.maximised) self.toggleMaximise();
                self.setVisible(false);
            }
        }, true);

    }

    toggleMaximise() {
        if (this.maximised) {
            for (const panel of this.hiddenPanels) {
                panel.setVisible(true);
            }
            this.hiddenPanels = [];
        }
        else {
            for (const panel of window.getActivePanels()) {
                if (panel.isVisible() && panel != this) {
                    this.hiddenPanels.push(panel);
                    panel.setVisible(false);
                }
            }
        }
        this.maximised = !this.maximised;
    }

    getEditor() {
        return this.editor;
    }

    getValue() {
        return this.editor.getValue();
    }

    setValue(value) {
        if (value === undefined) value = "";
        this.editor.setValue(value);
    }

    buttonHtml(icon, hint, id = null) {
        var idAttribute = "";
        if (id != null) {
            idAttribute = " id = " + "'" + id + "' ";
        }
        return "<span class='mif-" + icon + "' data-role='hint' data-hint-text='" + hint + "' data-hint-position='bottom'" + idAttribute+ "></span>";
    }

    fit() {}

    createElement() {}

    getElement() {
        if (!this.element) {
            this.element = this.createElement();
        }
        return this.element;
    }

    getId() {
        return this.id;
    }

    setParent(parent) {
        this.parent = parent;
    }

    getParent() {
        return this.parent;
    }

}

export { Panel };