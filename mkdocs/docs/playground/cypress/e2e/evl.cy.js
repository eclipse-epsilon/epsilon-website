import {playground, runButton, toggleModelDiagramButton, toggleMetamodelDiagramButton } from './constants.js';

describe('Tests the default EVL example', () => {
    beforeEach(() => {
      cy.visit(playground + "?evl");
    }),
    it('Tests that the example loads fine and there is text in all three editors', () => {
      cy.contains('constraint ValidStart');
      cy.contains('<?nsuri psl?>');
      cy.contains('package psl;');
    }),
    it('Checks that the constraints run fine and a warning is produced', () => {
      cy.get(runButton).click();
      cy.contains("Charlie is not involved");
    })
  });