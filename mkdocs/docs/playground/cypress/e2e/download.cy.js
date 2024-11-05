import { playground } from './constants.js';
const path = require('path');

const environments = [
    {
        name: "Gradle",
        command: "gradle run",
        success: "BUILD SUCCESSFUL"
    },
    {
        name: "Maven",
        command: "mvn verify",
        success: "BUILD SUCCESS"
    },
    {
        name: "Java (Gradle)",
        command: 'gradle run',
        success: "BUILD SUCCESSFUL"
    },
    {
        name: "Java (Maven)",
        command: 'mvn compile exec:java -Dexec.mainClass="org.eclipse.epsilon.examples.Example" -Dorg.eclipse.emf.common.util.ReferenceClearingQueue=false',
        success: "BUILD SUCCESS"
    }
]
const examples = ["eol", "etl", "emg", "evl", "epl", "egl", "egx", "flock", "eml", "pinset"];

// This test can be a bit flaky and fail for no particular reason for some examples
// Before attempting to fix anything, try to run it a few times or against the failing example or environment
environments.forEach((environment) => {
    examples.forEach((example) => {
        describe("Tests the " + environment.name + " download of the " + example + " example", () => {

            var downloadsFolder = Cypress.config("downloadsFolder");
            var exampleFile = path.join(downloadsFolder, 'playground-example.zip');
            var exampleFolder = path.join(downloadsFolder, 'playground-example');

            it("Deletes the playground-example.zip file", () => {
                cy.exec("rm -f " + exampleFile);
                // Also delete the expanded folder if it exists
                cy.exec("rm -rf " + exampleFolder);
            });
            
            it("Downloads a fresh playground-example.zip file", () => {

                cy.visit(playground + "?" + example);

                // Open the download dialog
                cy.get('#showDownloadOptions').click();
                
                cy.get(".select-input").contains("Gradle").click();
                // Select the environment from the dropdown list
                cy.get("li[data-text='" + environment.name + "']").click();

                cy.get(".success").click(); // Download
            });

            it("Extracts and runs the playground-example.zip file", () => {
                // Download the zip file, extract it and run gradle run
                cy.readFile(exampleFile, { timeout: 15000 }).then((contents) => {
                    cy.exec("unzip " + exampleFile + " -d " + exampleFolder);

                    // The EVL example is expected to fail because of an unsatisfied constraint
                    // All other examples are expected to pass
                    var expectedOutput = (example == "evl") ? "Duration must be positive" : environment.success;
                    
                    cy.exec("cd " + exampleFolder + "; " + environment.command, { failOnNonZeroExit: false })
                        .its('stdout')
                        .should('contain', expectedOutput);
                    
                });
            });
        });
    });
});
