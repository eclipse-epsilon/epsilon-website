import {playground, runButton} from './constants.js';

describe('Tests the default EML example', () => {
    beforeEach(() => {
      cy.visit(playground + "?eml");
    }),
    it('Tests that the example loads fine and there is text in all editors', () => {
      cy.contains('rule ProjectWithProject');
      cy.contains('match l : Left');
      cy.contains('nsuri psl');
      cy.contains('Testing');
      cy.contains('package psl;');
    }),
    it('Checks that the program runs fine and an effort is produced', () => {
      cy.get(runButton).click();
      cy.contains("100%");
    })
  });