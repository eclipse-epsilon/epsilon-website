class OutputIFrame {

    fresh = true; 
    iframe;

    constructor (id, parent) {
        this.iframe = document.getElementById(id);
        if (this.iframe == null) {
            this.iframe = document.createElement("iframe");
            this.iframe.id = id;
            this.iframe.style.height = "100%";
            this.iframe.style.width = "100%";
            parent.appendChild(this.iframe);
        }
        else {
            this.fresh = false;
        }
    }

    setContent(content) {
        if (!this.fresh) {
            var doc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            var scrollTop = doc.documentElement.scrollTop || doc.body.scrollTop;
            var scrollLeft = doc.documentElement.scrollLeft || doc.body.scrollLeft;

            var loadEventListener = () => {
                this.iframe.contentWindow.scrollTo(scrollLeft, scrollTop);
                this.iframe.removeEventListener('load', loadEventListener);
            };

            this.iframe.addEventListener('load', loadEventListener);
        }

        this.iframe.srcdoc = content;
    }
}

export { OutputIFrame };