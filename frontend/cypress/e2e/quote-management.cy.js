describe('Quote Management System', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Quote Creation', () => {
    it('should create a new quote successfully', () => {
      cy.visit('/quotes/new');
      cy.get('[data-testid="quote-form"]').should('be.visible');
      
      // Fill in quote details
      cy.get('[data-testid="client-name-input"]').type('Test Client');
      cy.get('[data-testid="description-input"]').type('Website Development Services');
      cy.get('[data-testid="amount-input"]').type('5000.00');
      cy.get('[data-testid="valid-until-input"]').type('2024-12-31');
      
      // Add quote items
      cy.get('[data-testid="add-item-button"]').click();
      cy.get('[data-testid="item-description-input"]').first().type('Frontend Development');
      cy.get('[data-testid="item-quantity-input"]').first().type('1');
      cy.get('[data-testid="item-unit-price-input"]').first().type('3000.00');
      
      cy.get('[data-testid="add-item-button"]').click();
      cy.get('[data-testid="item-description-input"]').eq(1).type('Backend Development');
      cy.get('[data-testid="item-quantity-input"]').eq(1).type('1');
      cy.get('[data-testid="item-unit-price-input"]').eq(1).type('2000.00');
      
      // Save quote
      cy.get('[data-testid="save-quote-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.url().should('include', '/quotes/');
    });

    it('should validate required fields', () => {
      cy.visit('/quotes/new');
      cy.get('[data-testid="save-quote-button"]').click();
      
      cy.get('[data-testid="client-name-error"]').should('be.visible');
      cy.get('[data-testid="description-error"]').should('be.visible');
      cy.get('[data-testid="amount-error"]').should('be.visible');
    });

    it('should calculate totals automatically', () => {
      cy.visit('/quotes/new');
      
      cy.get('[data-testid="add-item-button"]').click();
      cy.get('[data-testid="item-description-input"]').type('Service A');
      cy.get('[data-testid="item-quantity-input"]').type('2');
      cy.get('[data-testid="item-unit-price-input"]').type('100.00');
      
      cy.get('[data-testid="subtotal"]').should('contain', '200.00');
      cy.get('[data-testid="tax-amount"]').should('contain', '20.00');
      cy.get('[data-testid="total-amount"]').should('contain', '220.00');
    });
  });

  describe('Quote Editing', () => {
    it('should edit existing quote', () => {
      // First create a quote
      cy.createQuote();
      
      // Edit the quote
      cy.get('[data-testid="edit-quote-button"]').click();
      cy.get('[data-testid="description-input"]').clear().type('Updated Description');
      cy.get('[data-testid="save-quote-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="quote-description"]').should('contain', 'Updated Description');
    });

    it('should add new items to existing quote', () => {
      cy.createQuote();
      
      cy.get('[data-testid="edit-quote-button"]').click();
      cy.get('[data-testid="add-item-button"]').click();
      cy.get('[data-testid="item-description-input"]').last().type('Additional Service');
      cy.get('[data-testid="item-quantity-input"]').last().type('1');
      cy.get('[data-testid="item-unit-price-input"]').last().type('500.00');
      cy.get('[data-testid="save-quote-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="quote-items"]').should('contain', 'Additional Service');
    });
  });

  describe('Quote Status Management', () => {
    it('should change quote status from draft to sent', () => {
      cy.createQuote();
      
      cy.get('[data-testid="status-selector"]').click();
      cy.get('[data-testid="option-sent"]').click();
      cy.get('[data-testid="update-status-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="quote-status"]').should('contain', 'Sent');
    });

    it('should approve quote', () => {
      cy.createQuote();
      
      // Change status to sent first
      cy.get('[data-testid="status-selector"]').click();
      cy.get('[data-testid="option-sent"]').click();
      cy.get('[data-testid="update-status-button"]').click();
      
      // Then approve
      cy.get('[data-testid="status-selector"]').click();
      cy.get('[data-testid="option-approved"]').click();
      cy.get('[data-testid="update-status-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="quote-status"]').should('contain', 'Approved');
    });

    it('should reject quote with reason', () => {
      cy.createQuote();
      
      // Change status to sent first
      cy.get('[data-testid="status-selector"]').click();
      cy.get('[data-testid="option-sent"]').click();
      cy.get('[data-testid="update-status-button"]').click();
      
      // Then reject
      cy.get('[data-testid="status-selector"]').click();
      cy.get('[data-testid="option-rejected"]').click();
      cy.get('[data-testid="rejection-reason-input"]').type('Budget constraints');
      cy.get('[data-testid="update-status-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="quote-status"]').should('contain', 'Rejected');
      cy.get('[data-testid="rejection-reason"]').should('contain', 'Budget constraints');
    });
  });

  describe('Quote Search and Filtering', () => {
    beforeEach(() => {
      // Create multiple quotes with different statuses
      cy.createQuote({ clientName: 'Client A', status: 'draft' });
      cy.createQuote({ clientName: 'Client B', status: 'sent' });
      cy.createQuote({ clientName: 'Client C', status: 'approved' });
    });

    it('should search quotes by client name', () => {
      cy.visit('/quotes');
      cy.get('[data-testid="search-input"]').type('Client A');
      cy.get('[data-testid="search-button"]').click();
      
      cy.get('[data-testid="quotes-list"]').should('contain', 'Client A');
      cy.get('[data-testid="quotes-list"]').should('not.contain', 'Client B');
    });

    it('should filter quotes by status', () => {
      cy.visit('/quotes');
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="option-approved"]').click();
      cy.get('[data-testid="apply-filters-button"]').click();
      
      cy.get('[data-testid="quotes-list"]').should('contain', 'Client C');
      cy.get('[data-testid="quotes-list"]').should('not.contain', 'Client A');
    });

    it('should filter quotes by date range', () => {
      cy.visit('/quotes');
      cy.get('[data-testid="date-from-input"]').type('2024-01-01');
      cy.get('[data-testid="date-to-input"]').type('2024-01-31');
      cy.get('[data-testid="apply-filters-button"]').click();
      
      // Should show quotes created in January 2024
      cy.get('[data-testid="quotes-list"]').should('be.visible');
    });
  });

  describe('Quote Templates', () => {
    it('should create quote from template', () => {
      cy.visit('/quotes/new');
      cy.get('[data-testid="use-template-button"]').click();
      cy.get('[data-testid="template-selector"]').click();
      cy.get('[data-testid="option-website-template"]').click();
      
      // Template should populate form fields
      cy.get('[data-testid="description-input"]').should('have.value', 'Website Development');
      cy.get('[data-testid="quote-items"]').should('contain', 'Frontend Development');
      cy.get('[data-testid="quote-items"]').should('contain', 'Backend Development');
    });

    it('should save quote as template', () => {
      cy.createQuote();
      
      cy.get('[data-testid="save-as-template-button"]').click();
      cy.get('[data-testid="template-name-input"]').type('My Custom Template');
      cy.get('[data-testid="save-template-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Template saved successfully');
    });
  });

  describe('Quote Export', () => {
    it('should export quote as PDF', () => {
      cy.createQuote();
      
      cy.get('[data-testid="export-pdf-button"]').click();
      cy.get('[data-testid="pdf-export-modal"]').should('be.visible');
      cy.get('[data-testid="export-button"]').click();
      
      // Check if download started
      cy.readFile('cypress/downloads/quote.pdf').should('exist');
    });

    it('should export quote as CSV', () => {
      cy.createQuote();
      
      cy.get('[data-testid="export-csv-button"]').click();
      cy.get('[data-testid="csv-export-modal"]').should('be.visible');
      cy.get('[data-testid="export-button"]').click();
      
      // Check if download started
      cy.readFile('cypress/downloads/quote.csv').should('exist');
    });
  });

  describe('Quote Sharing', () => {
    it('should share quote via email', () => {
      cy.createQuote();
      
      cy.get('[data-testid="share-quote-button"]').click();
      cy.get('[data-testid="share-modal"]').should('be.visible');
      cy.get('[data-testid="email-input"]').type('client@example.com');
      cy.get('[data-testid="message-input"]').type('Please review this quote');
      cy.get('[data-testid="send-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Quote shared successfully');
    });

    it('should generate shareable link', () => {
      cy.createQuote();
      
      cy.get('[data-testid="share-quote-button"]').click();
      cy.get('[data-testid="share-modal"]').should('be.visible');
      cy.get('[data-testid="generate-link-button"]').click();
      
      cy.get('[data-testid="shareable-link"]').should('be.visible');
      cy.get('[data-testid="copy-link-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Link copied to clipboard');
    });
  });

  describe('Quote Analytics', () => {
    it('should display quote statistics', () => {
      cy.visit('/quotes/analytics');
      cy.get('[data-testid="analytics-page"]').should('be.visible');
      
      cy.get('[data-testid="total-quotes"]').should('be.visible');
      cy.get('[data-testid="conversion-rate"]').should('be.visible');
      cy.get('[data-testid="average-value"]').should('be.visible');
      cy.get('[data-testid="monthly-trends"]').should('be.visible');
    });

    it('should filter analytics by date range', () => {
      cy.visit('/quotes/analytics');
      cy.get('[data-testid="date-range-selector"]').click();
      cy.get('[data-testid="option-last-30-days"]').click();
      
      cy.get('[data-testid="analytics-data"]').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile devices', () => {
      cy.viewport(375, 667);
      cy.visit('/quotes');
      cy.get('[data-testid="quotes-page"]').should('be.visible');
      cy.get('[data-testid="new-quote-button"]').should('be.visible');
    });

    it('should work on tablet devices', () => {
      cy.viewport(768, 1024);
      cy.visit('/quotes');
      cy.get('[data-testid="quotes-page"]').should('be.visible');
      cy.get('[data-testid="quotes-list"]').should('be.visible');
    });
  });
});
