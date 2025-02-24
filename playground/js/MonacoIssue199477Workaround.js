/**
 * This is a temporary workaround for https://github.com/microsoft/vscode/issues/199477
 */

class MonacoIssue199477Workaround {

    // When a mousedown is detected in a Monaco editor disable all links and restore them on mouse up
    apply() {
        var self = this;
        addEventListener("mousedown", (event) => {
            if (self.isAncestorMonacoEditor(event.target)) {
                self.disableClicks();
            }
        });
        
        addEventListener("mouseup", (event) => {
            self.enableClicks();
        });
    }

    isAncestorMonacoEditor(target) {
        while (target) {
            if (target.classList && target.classList.contains('monaco-editor')) {
                return true;
            }
            target = target.parentElement;
        }
        return false;
    }
    
    disableClicks() {
        this.clickableElements().forEach(e => {
            e.style.pointerEvents = 'none';
        });
    }
    
    enableClicks() {
        this.clickableElements().forEach(e => {
            e.style.pointerEvents = 'auto';
        });
    }

    clickableElements() {
        const links = document.querySelectorAll('a');
        const buttons = document.querySelectorAll('span.button');
        return [...links, ...buttons];
    }
}

export {MonacoIssue199477Workaround}