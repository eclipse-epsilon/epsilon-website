import { playground, runButton } from './constants.js';

describe('Tests the default Pinset example', () => {
    beforeEach(() => {
      cy.visit(playground + "?psl2csv");
    }),
    it('Tests that the example loads fine and there is text in all editors', () => {
      cy.contains('dataset tasks over');
      cy.contains('package psl;');
    }),
    it('Checks that the generation runs fine and a Project is produced', () => {
      cy.get(runButton).click();
      cy.contains("title,start,duration");
    })
});
