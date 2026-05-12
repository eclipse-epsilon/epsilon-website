import {playground, runButton, toggleModelDiagramButton, toggleMetamodelDiagramButton } from './constants.js';

describe('Tests the default EOL example', () => {
    beforeEach(() => {
      cy.visit(playground);
    }),
    it('Tests that the example loads fine and there is text in all three editors', () => {
      cy.contains('Query Project Plan');
      cy.contains('For every task in the model');
      cy.contains('<?nsuri psl?>');
      cy.contains('package psl;');
    }),
    it('Checks that the code runs fine and it produces the expected output', () => {
      cy.get(runButton).click();
      cy.contains("Analysis: 3.0");
    }),
    it('Checks the model diagram generated when the toggle button is pressed', () => {
      cy.get(toggleModelDiagramButton).click();
      cy.contains("100%");
    }),
    it('Checks the metamodel diagram generated when the toggle button is pressed', () => {
      cy.get(toggleMetamodelDiagramButton).click();
      cy.contains("name : EString");
    })
  });