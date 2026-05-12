import {playground, runButton} from './constants.js';

describe('Tests the default ETL example', () => {
    beforeEach(() => {
      cy.visit(playground + "?etl");
    }),
    it('Tests that the example loads fine and there is text in all editors', () => {
      cy.contains('rule Project2Project');
      cy.contains('<?nsuri psl?>');
      cy.contains('package psl;');
      cy.contains('package pdl;');
    }),
    it('Checks that the transformation runs fine and a deliverable is produced', () => {
      cy.get(runButton).click();
      cy.contains("Analysis Report");
    })
  });