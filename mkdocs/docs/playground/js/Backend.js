class Backend {

    services = {};

    configure() {
        var xhr = new XMLHttpRequest();
        var url = "backend.json";
        xhr.open("GET", url, false);
        xhr.send();
        if (xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            for (const service of json.services) {
                if (service.port != null) {
                    this.services[service.name] = "http://localhost:" + service.port;
                }
                else {
                    this.services[service.name] = service.url;
                }
            }
        }
    }

    getRunEpsilonService() {
        return this.services["RunEpsilonFunction"];
    }

    getFlexmiToGraphService() {
        return this.services["FlexmiToGraphFunction"];
    }

    getEmfaticToGraphService() {
        return this.services["EmfaticToGraphFunction"];
    }

    getShortURLService() {
        return this.services["ShortURLFunction"];
    }

    getYjsService() {
        return this.services["Yjs"];
    }

    getKrokiService() {
        return this.services["Kroki"];
    }
}

export { Backend };