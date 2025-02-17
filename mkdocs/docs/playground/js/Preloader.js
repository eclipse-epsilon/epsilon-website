class Preloader {

    visible = true;

    progress(message) {
        document.getElementById("preloader-message").innerHTML = message + "...";
    }

    hide() {
        if (this.visible) {
            var self = this;
            setTimeout(function () {
                document.getElementById("preloader").style.display = "none";
                self.visible = false;
            }, 1000);
        }
    }
}

export { Preloader };