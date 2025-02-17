import Handlebars from "handlebars/lib/handlebars";
import JSZip from "jszip";
import { language, secondProgramPanel } from "./Playground.js";

class DownloadDialog {
    show(event) {
        event.preventDefault();
        var self = this;
        Metro.dialog.create({
            title: "Download",
            content: "<p>You can download this example and run it locally through Gradle, Maven, ANT or Java. Please choose your preferred format below. </p><br/><select id='format' data-role='select'><option value='gradle'>Gradle</option><option value='maven'>Maven</option><option value='ant-eclipse'>Ant (Eclipse)</option><option value='java-gradle'>Java (Gradle)</option><option value='java-maven'>Java (Maven)</option></select>",
            actions: [
               {
                    caption: "Download",
                    cls: "js-dialog-close success",
                    onclick: function(){
                        var zip = new JSZip();
                        var extension = language == "flock" ? "mig" : language;
                        
                        var format = document.getElementById("format").value;
                        
                        var templateData = {
                            language: language, 
                            task: language == "egx" ? "egl" : language,
                            extension: extension,
                            etl: language == "etl",
                            emg: language == "emg",
                            flock: language == "flock",
                            etlOrFlock: language == "etl" || language == "flock",
                            egl: language == "egl",
                            eml: language == "eml",
                            pinset: language == "pinset",
                            sourceModelName: language == "flock" ? "Original" : "Source",
                            targetModelName: language == "flock" ? "Migrated" : "Target",
                            sourceModelFileName: language == "flock" ? "original" : "source",
                            targetModelFileName: language == "flock" ? "migrated" : "target",
                        };

                        zip.file("program." + extension, programPanel.getEditor().getValue());
                        if (language == "egx") zip.file("template.egl", secondProgramPanel.getEditor().getValue());
                        if (language == "eml") zip.file("program.ecl", secondProgramPanel.getEditor().getValue());

                        if (language == "etl" || language == "flock") {
                            zip.file(templateData.sourceModelFileName + ".flexmi", firstModelPanel.getValue());
                            zip.file(templateData.sourceModelFileName + ".emf", firstMetamodelPanel.getValue());
                            zip.file(templateData.targetModelFileName + ".emf", secondMetamodelPanel.getValue());
                        }
                        else if (language == "eml") {
                            zip.file("left.flexmi", firstModelPanel.getValue());
                            zip.file("left.emf", firstMetamodelPanel.getValue());
                            zip.file("right.flexmi", thirdModelPanel.getValue());
                            zip.file("right.emf", thirdMetamodelPanel.getValue());
                            zip.file("target.emf", secondMetamodelPanel.getValue());                            
                        } else if (language == "emg") {
                            zip.file("metamodel.emf", firstMetamodelPanel.getValue());
                        }
                        else {
                            zip.file("model.flexmi", firstModelPanel.getValue());
                            zip.file("metamodel.emf", firstMetamodelPanel.getValue());
                        }
    
                        
    
                        if (format == "gradle") {
                            var template = Handlebars.compile(self.fetchTemplate("gradle/build.gradle.handlebars"));
                            zip.file("build.gradle", template(templateData));
                            zip.file("readme.md", self.fetchTemplate("gradle/readme.txt"));
                        }
                        else if (format == "maven") {
                            var antTemplate = Handlebars.compile(self.fetchTemplate("ant/ant.xml.handlebars"));
                            var ant = antTemplate(templateData);
                            var template = Handlebars.compile(self.fetchTemplate("maven/pom.xml.handlebars"));
                            Handlebars.registerPartial('antPartial', '{{{ant}}}');
                            zip.file("pom.xml", template({ant: ant}));
                            zip.file("readme.md", self.fetchTemplate("maven/readme.txt"));
                        }
                        else if (format == "ant-eclipse") {
                            var antTemplate = Handlebars.compile(self.fetchTemplate("ant/ant.xml.handlebars"));
                            var ant = antTemplate(templateData);
                            var template = Handlebars.compile(self.fetchTemplate("ant/build.xml.handlebars"));
                            Handlebars.registerPartial('antPartial', '{{{ant}}}');
                            zip.file("build.xml", template({ant: ant}));
                            zip.file("readme.md", self.fetchTemplate("ant/readme.txt"));
                            zip.file(".project", self.fetchTemplate("ant/project.handlebars"));
                        }
                        else if (format.startsWith("java-")) {
                            zip.file("src/main/java/org/eclipse/epsilon/examples/Example.java", self.fetchTemplate("java/" + language + "/src/main/java/org/eclipse/epsilon/examples/Example.java"));
                            if (format == "java-maven") {
                                zip.file("pom.xml", self.fetchTemplate("java/" + language + "/pom.xml"));
                                zip.file("readme.md", self.fetchTemplate("java/readme-maven.txt"));
                            }
                            else {
                                zip.file("build.gradle", self.fetchTemplate("java/" + language + "/build.gradle"));
                                zip.file("readme.md", self.fetchTemplate("java/readme-gradle.txt"));
                            }
                        }
    
                        zip.generateAsync({type:"blob"})
                        .then(function(content) {
                            var blob = new Blob([content], { type: "application/zip" });
                            var url = window.URL || window.webkitURL;
                            var link = url.createObjectURL(blob);
                            var a = document.createElement("a");
                            a.setAttribute("download", "playground-example.zip");
                            a.setAttribute("href", link);
                            a.click();
                        });
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

    /**
     * Fetches the content of a file under the templates folder
     */
    fetchTemplate(name) {
        var xhr = new XMLHttpRequest();
        var url = "templates/" + name;
        xhr.open("GET", url, false);
        xhr.send();
        if (xhr.status === 200) {    
            return xhr.responseText;
        }
    }
}

export { DownloadDialog };
