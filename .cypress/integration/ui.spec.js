/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */


/// <reference types="cypress" />

import { edit } from 'brace';
import { delay, files, testDataSet, testQueries, verifyDownloadData } from '../utils/constants';

describe('Dump test data', () => {
  it('Indexes test data for SQL and PPL', () => {
    const dumpDataSet = (url, index) =>
      cy.request(url).then((response) => {
        cy.request({
          method: 'POST',
          form: false,
          url: 'api/console/proxy',
          headers: {
            'content-type': 'application/json;charset=UTF-8',
            'osd-xsrf': true,
          },
          qs: {
            path: `${index}/_bulk`,
            method: 'POST',
          },
          body: response.body,
        });
      });

    testDataSet.forEach(({ url, index }) => dumpDataSet(url, index));
  });
});

describe('Test PPL UI', () => {
  beforeEach(() => {
    cy.visit('app/opensearch-query-workbench');
    cy.wait(delay);
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-test-subj="PPL"]').click({ force: true });
    cy.wait(delay);
  });

  it('Confirm results are empty', () => {
    cy.get('.euiTextAlign')
      .contains('Enter a query in the query editor above to see results.')
      .should('have.length', 1);
  });

  it('Test Run button', () => {
    // eslint-disable-next-line cypress/no-force
    cy.get('textarea.ace_text-input').eq(0).focus().type('source=accounts', { force: true });

    // Wait for ACE editor to render the typed content
    cy.wait(1000);
    // eslint-disable-next-line cypress/no-force
    cy.get('button[data-test-subj="pplRunButton"]').click({ force: true });
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-test-subj="result_tab"]').contains('Events').click({ force: true });
  });

  it('Test Clear button', () => {
    // First type something to clear
    // eslint-disable-next-line cypress/no-force
    cy.get('textarea.ace_text-input').eq(0).focus().type('source=accounts', { force: true });
    cy.wait(500);

    // eslint-disable-next-line cypress/no-force
    cy.get('[data-test-subj="pplClearButton"]').contains('Clear').click({ force: true });

    // Verify the typed content is cleared from the editor
    cy.get('.ace_content').should('not.contain.text', 'source=accounts');
  });

  it('Test full screen view', () => {
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-test-subj="pplClearButton"]').contains('Clear').click({ force: true });
    cy.get('.euiButton__text').contains('Full screen view').should('not.exist');

    // eslint-disable-next-line cypress/no-force
    cy.get('textarea.ace_text-input').eq(0).focus().type('source=accounts', { force: true });
    cy.get('[data-test-subj="pplRunButton"]').contains('Run').should('exist');
    cy.wait(1000)
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-test-subj="pplRunButton"]').contains('Run').click({ force: true });

    // eslint-disable-next-line cypress/no-force
    cy.get('[data-test-subj="fullScreenView"]').contains('Full screen view').click({ force: true });

    cy.get('.euiTitle').should('not.exist');
  });
});

describe('Test SQL UI', () => {
  beforeEach(() => {
    cy.visit('app/opensearch-query-workbench');
    cy.wait(delay);
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-test-subj="SQL"]').click({ force: true });
    cy.wait(delay);
  });

  it('Confirm results are empty', () => {
    cy.get('.euiTextAlign')
      .contains('Enter a query in the query editor above to see results.')
      .should('have.length', 1);
  });

  it('Test Run button', () => {
    // eslint-disable-next-line cypress/no-force
    cy.get('textarea.ace_text-input').eq(0).focus().type('{enter}', { force: true });
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-test-subj="sqlRunButton"]').contains('Run').click({ force: true });
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-test-subj="result_tab"]').contains("SHOW tables LIKE '%'").click({ force: true });
  });

  it('Test Translate button', () => {
    // eslint-disable-next-line cypress/no-force
    cy.get('textarea.ace_text-input').eq(0).focus().type('{enter}', { force: true });
    // eslint-disable-next-line cypress/no-force
    cy.get('.euiButton__text').contains('Explain').click({ force: true });

    // hard to get euiCodeBlock content, check length instead
    cy.get('.euiCodeBlock__code').children().should('have.length', 25);
  });

  it('Test Clear button', () => {
    // First type something to clear
    // eslint-disable-next-line cypress/no-force
    cy.get('textarea.ace_text-input').eq(0).focus().type('SELECT * FROM test', { force: true });
    cy.wait(500);

    // eslint-disable-next-line cypress/no-force
    cy.get('[data-test-subj="sqlClearButton"]').contains('Clear').click({ force: true });

    // Verify the typed content is cleared from the editor
    cy.get('.ace_content').should('not.contain.text', 'SELECT * FROM test');
  });

  it('Test full screen view', () => {
    cy.get('.euiButton__text').contains('Full screen view').should('not.exist');

    // eslint-disable-next-line cypress/no-force
    cy.get('textarea.ace_text-input')
      .eq(0)
      .focus()
      .type("{enter}", { force: true });
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-test-subj="sqlRunButton"]').contains('Run').click({ force: true });
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-test-subj="fullScreenView"]').contains('Full screen view').click({ force: true });

    cy.get('.euiTitle').should('not.exist');
  });
});


describe('Test and verify SQL downloads', () => {
  verifyDownloadData.map(({ title, url, file }) => {
    it(title, () => {
      cy.request({
        method: 'POST',
        form: true,
        url: url,
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          'osd-xsrf': true,
        },
        body: {
          query: 'select * from accounts where balance > 49500 order by account_number',
        },
      }).then((response) => {
        expect(response.body.data.resp).to.have.string(files[file]);
      });
    });
  });
});

describe('Test table display', () => {
  beforeEach(() => {
    cy.visit('app/opensearch-query-workbench');
    cy.wait(delay);
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-test-subj="SQL"]').click({ force: true });
    cy.wait(delay);
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-test-subj="sqlClearButton"]').contains('Clear').click({ force: true });
    cy.wait(delay);
  });

  testQueries.map(({ title, query, cell_idx, expected_string }) => {
    it(title, () => {
      // eslint-disable-next-line cypress/no-force
      cy.get('[data-test-subj="sqlClearButton"]').contains('Clear').click({ force: true });
      // eslint-disable-next-line cypress/no-force
      cy.get('div[data-test-subj="sqlCodeEditor"]')
        .click({ force: true });
      // eslint-disable-next-line cypress/no-force
      cy.get('div[data-test-subj="sqlCodeEditor"] textarea.ace_text-input')
        .type(`${query}`, { force: true });
      cy.get('div[data-test-subj="sqlCodeEditor"]').contains(`${query}`).should('exist');
      cy.get('[data-test-subj="sqlRunButton"]').contains('Run').should('exist');
      cy.wait(1000)
      // eslint-disable-next-line cypress/no-force
      cy.get('[data-test-subj="sqlRunButton"]').contains('Run').click({ force: true });
      cy.get('span.euiTableCellContent__text')
        .eq(cell_idx)
        .should((cell) => {
          expect(cell).to.contain(expected_string);
        });
    });
  });

  it('Test nested fields display', () => {
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-test-subj="sqlClearButton"]').contains('Clear').click({ force: true });
    // eslint-disable-next-line cypress/no-force
    cy.get('div[data-test-subj="sqlCodeEditor"]')
      .click({ force: true });
    // eslint-disable-next-line cypress/no-force
    cy.get('div[data-test-subj="sqlCodeEditor"] textarea.ace_text-input')
      .type(`select * from employee_nested;`, { force: true });
    cy.get('[data-test-subj="sqlRunButton"]').contains('Run').should('exist');
    cy.wait(1000)
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-test-subj="sqlRunButton"]').contains('Run').click({ force: true });
    cy.get(('[data-test-subj="result_tab"]')).contains('employee_nested').should('exist');
    // eslint-disable-next-line cypress/no-force
    cy.get('button.euiLink').eq(2).click({ force: true });
    cy.contains('message');
  });
});
