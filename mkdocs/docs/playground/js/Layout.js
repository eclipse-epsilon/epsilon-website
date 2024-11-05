import {programPanel, secondProgramPanel, consolePanel, firstModelPanel, firstMetamodelPanel, secondModelPanel, secondMetamodelPanel, thirdModelPanel, thirdMetamodelPanel, outputPanel} from './Playground.js';
import { Splitter  } from './Splitter.js';

class Layout {

    create(rootId, language) {
        var root = document.getElementById(rootId);
        root.innerHTML = "";

        var splitter;

        if (language == "eol") {
            splitter = new Splitter(
                new Splitter(programPanel, consolePanel, "vertical"),
                new Splitter(firstModelPanel, firstMetamodelPanel, "vertical")
            );
        }
        else if (language == "evl" || language == "epl" || language == "egl" || language == "pinset") {

            splitter = new Splitter(
                new Splitter(programPanel, consolePanel, "vertical"),
                new Splitter(
                    new Splitter(firstModelPanel, firstMetamodelPanel, "vertical"),
                    new Splitter(outputPanel, null)
                ),
                "horizontal", "33, 67"
            );
        }
        else if (language == "etl" || language == "flock") {

            splitter = new Splitter(
                new Splitter(programPanel, consolePanel, "vertical"),
                new Splitter(
                    new Splitter(firstModelPanel, firstMetamodelPanel, "vertical"),
                    new Splitter(secondModelPanel, secondMetamodelPanel, "vertical")
                ),
                "horizontal", "33, 67"
            );
        }
        else if (language == "emg") {

            splitter = new Splitter(
                new Splitter(programPanel, consolePanel, "vertical"),
                new Splitter(firstMetamodelPanel, secondModelPanel),
                "horizontal", "33, 67"
            );
        }
        else if (language == "egx") {

            splitter = new Splitter(
                new Splitter(
                    new Splitter(programPanel, secondProgramPanel, "vertical"),
                    new Splitter(consolePanel, null, "vertical"),
                    "vertical", "67, 33"
                ),
                new Splitter(
                    new Splitter(firstModelPanel, firstMetamodelPanel, "vertical"),
                    new Splitter(outputPanel, null)
                ),
                "horizontal", "33, 67"
            );
        }
        else if (language == "eml") {

            splitter = new Splitter(
                new Splitter(
                    new Splitter(programPanel, secondProgramPanel, "vertical"),
                    new Splitter(consolePanel, null),
                    "vertical",
                    "67, 33"
                ),
                new Splitter(
                    new Splitter(
                        new Splitter(firstModelPanel, firstMetamodelPanel, "vertical"),
                        new Splitter(thirdModelPanel, thirdMetamodelPanel, "vertical")
                    ),
                    new Splitter(
                        new Splitter(secondModelPanel, secondMetamodelPanel, "vertical")
                    ),
                    "horizontal", "67, 33"
                ),
                "horizontal", "25, 75"
            );
        }

        splitter.setRoot();
        root.appendChild(splitter.getElement());
    }
}

export { Layout };
