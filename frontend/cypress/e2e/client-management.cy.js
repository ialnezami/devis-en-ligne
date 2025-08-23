describe('Client Management System', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Client Creation', () => {
    it('should create a new client successfully', () => {
      cy.visit('/clients/new');
      cy.get('[data-testid="client-form"]').should('be.visible');
      
      // Fill in client details
      cy.get('[data-testid="client-name-input"]').type('New Client Corp');
      cy.get('[data-testid="client-email-input"]').type('contact@newclient.com');
      cy.get('[data-testid="client-phone-input"]').type('+1234567890');
      cy.get('[data-testid="client-company-input"]').type('New Client Corporation');
      
      // Fill in address
      cy.get('[data-testid="street-input"]').type('123 Business St');
      cy.get('[data-testid="city-input"]').type('New York');
      cy.get('[data-testid="state-input"]').type('NY');
      cy.get('[data-testid="zip-code-input"]').type('10001');
      cy.get('[data-testid="country-input"]').type('USA');
      
      // Select industry and status
      cy.get('[data-testid="industry-selector"]').click();
      cy.get('[data-testid="option-technology"]').click();
      cy.get('[data-testid="status-selector"]').click();
      cy.get('[data-testid="option-active"]').click();
      
      // Save client
      cy.get('[data-testid="save-client-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.url().should('include', '/clients/');
    });

    it('should validate required fields', () => {
      cy.visit('/clients/new');
      cy.get('[data-testid="save-client-button"]').click();
      
      cy.get('[data-testid="client-name-error"]').should('be.visible');
      cy.get('[data-testid="client-email-error"]').should('be.visible');
      cy.get('[data-testid="client-phone-error"]').should('be.visible');
    });

    it('should validate email format', () => {
      cy.visit('/clients/new');
      cy.get('[data-testid="client-name-input"]').type('Test Client');
      cy.get('[data-testid="client-email-input"]').type('invalid-email');
      cy.get('[data-testid="client-phone-input"]').type('+1234567890');
      cy.get('[data-testid="save-client-button"]').click();
      
      cy.get('[data-testid="client-email-error"]').should('be.visible');
      cy.get('[data-testid="client-email-error"]').should('contain', 'Invalid email format');
    });
  });

  describe('Client Editing', () => {
    it('should edit existing client', () => {
      // First create a client
      cy.createClient();
      
      // Edit the client
      cy.get('[data-testid="edit-client-button"]').click();
      cy.get('[data-testid="client-name-input"]').clear().type('Updated Client Name');
      cy.get('[data-testid="client-email-input"]').clear().type('updated@client.com');
      cy.get('[data-testid="save-client-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="client-name"]').should('contain', 'Updated Client Name');
    });

    it('should update client status', () => {
      cy.createClient();
      
      cy.get('[data-testid="edit-client-button"]').click();
      cy.get('[data-testid="status-selector"]').click();
      cy.get('[data-testid="option-prospect"]').click();
      cy.get('[data-testid="save-client-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="client-status"]').should('contain', 'Prospect');
    });
  });

  describe('Client Search and Filtering', () => {
    beforeEach(() => {
      // Create multiple clients with different statuses
      cy.createClient({ name: 'Active Client Corp', status: 'active' });
      cy.createClient({ name: 'Prospect Client LLC', status: 'prospect' });
      cy.createClient({ name: 'Inactive Client Inc', status: 'inactive' });
    });

    it('should search clients by name', () => {
      cy.visit('/clients');
      cy.get('[data-testid="search-input"]').type('Active Client');
      cy.get('[data-testid="search-button"]').click();
      
      cy.get('[data-testid="clients-list"]').should('contain', 'Active Client Corp');
      cy.get('[data-testid="clients-list"]').should('not.contain', 'Prospect Client LLC');
    });

    it('should filter clients by status', () => {
      cy.visit('/clients');
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="option-active"]').click();
      cy.get('[data-testid="apply-filters-button"]').click();
      
      cy.get('[data-testid="clients-list"]').should('contain', 'Active Client Corp');
      cy.get('[data-testid="clients-list"]').should('not.contain', 'Prospect Client LLC');
    });

    it('should filter clients by industry', () => {
      cy.visit('/clients');
      cy.get('[data-testid="industry-filter"]').click();
      cy.get('[data-testid="option-technology"]').click();
      cy.get('[data-testid="apply-filters-button"]').click();
      
      cy.get('[data-testid="clients-list"]').should('be.visible');
    });

    it('should filter clients by date range', () => {
      cy.visit('/clients');
      cy.get('[data-testid="date-from-input"]').type('2024-01-01');
      cy.get('[data-testid="date-to-input"]').type('2024-01-31');
      cy.get('[data-testid="apply-filters-button"]').click();
      
      cy.get('[data-testid="clients-list"]').should('be.visible');
    });
  });

  describe('Client Documents', () => {
    it('should upload client document', () => {
      cy.createClient();
      
      cy.get('[data-testid="documents-tab"]').click();
      cy.get('[data-testid="upload-document-button"]').click();
      cy.get('[data-testid="document-file-input"]').attachFile('sample-document.pdf');
      cy.get('[data-testid="document-name-input"]').type('Contract Agreement');
      cy.get('[data-testid="document-category-selector"]').click();
      cy.get('[data-testid="option-contracts"]').click();
      cy.get('[data-testid="upload-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="documents-list"]').should('contain', 'Contract Agreement');
    });

    it('should view client document', () => {
      cy.createClient();
      
      // Upload a document first
      cy.get('[data-testid="documents-tab"]').click();
      cy.get('[data-testid="upload-document-button"]').click();
      cy.get('[data-testid="document-file-input"]').attachFile('sample-document.pdf');
      cy.get('[data-testid="document-name-input"]').type('Test Document');
      cy.get('[data-testid="upload-button"]').click();
      
      // View the document
      cy.get('[data-testid="view-document-button"]').click();
      cy.get('[data-testid="document-viewer"]').should('be.visible');
    });

    it('should delete client document', () => {
      cy.createClient();
      
      // Upload a document first
      cy.get('[data-testid="documents-tab"]').click();
      cy.get('[data-testid="upload-document-button"]').click();
      cy.get('[data-testid="document-file-input"]').attachFile('sample-document.pdf');
      cy.get('[data-testid="document-name-input"]').type('Document to Delete');
      cy.get('[data-testid="upload-button"]').click();
      
      // Delete the document
      cy.get('[data-testid="delete-document-button"]').click();
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="documents-list"]').should('not.contain', 'Document to Delete');
    });
  });

  describe('Client Communication', () => {
    it('should log client communication', () => {
      cy.createClient();
      
      cy.get('[data-testid="communication-tab"]').click();
      cy.get('[data-testid="add-communication-button"]').click();
      cy.get('[data-testid="communication-type-selector"]').click();
      cy.get('[data-testid="option-phone-call"]').click();
      cy.get('[data-testid="communication-summary-input"]').type('Discussed project requirements');
      cy.get('[data-testid="communication-notes-input"]').type('Client is interested in website development');
      cy.get('[data-testid="save-communication-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="communications-list"]').should('contain', 'Discussed project requirements');
    });

    it('should schedule follow-up', () => {
      cy.createClient();
      
      cy.get('[data-testid="communication-tab"]').click();
      cy.get('[data-testid="add-communication-button"]').click();
      cy.get('[data-testid="communication-type-selector"]').click();
      cy.get('[data-testid="option-meeting"]').click();
      cy.get('[data-testid="communication-summary-input"]').type('Project kickoff meeting');
      cy.get('[data-testid="follow-up-date-input"]').type('2024-02-01');
      cy.get('[data-testid="follow-up-time-input"]').type('10:00');
      cy.get('[data-testid="save-communication-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="follow-up-reminder"]').should('contain', '2024-02-01');
    });
  });

  describe('Client Portal', () => {
    it('should display client portal for authenticated client', () => {
      // Login as client
      cy.visit('/client-portal');
      cy.get('[data-testid="client-login-form"]').should('be.visible');
      cy.get('[data-testid="client-email-input"]').type('client@example.com');
      cy.get('[data-testid="client-password-input"]').type('clientpassword123');
      cy.get('[data-testid="client-login-button"]').click();
      
      cy.get('[data-testid="client-dashboard"]').should('be.visible');
      cy.get('[data-testid="client-quotes"]').should('be.visible');
      cy.get('[data-testid="client-documents"]').should('be.visible');
    });

    it('should allow client to view their quotes', () => {
      // Login as client
      cy.visit('/client-portal');
      cy.get('[data-testid="client-email-input"]').type('client@example.com');
      cy.get('[data-testid="client-password-input"]').type('clientpassword123');
      cy.get('[data-testid="client-login-button"]').click();
      
      cy.get('[data-testid="client-quotes-tab"]').click();
      cy.get('[data-testid="quotes-list"]').should('be.visible');
    });

    it('should allow client to download documents', () => {
      // Login as client
      cy.visit('/client-portal');
      cy.get('[data-testid="client-email-input"]').type('client@example.com');
      cy.get('[data-testid="client-password-input"]').type('clientpassword123');
      cy.get('[data-testid="client-login-button"]').click();
      
      cy.get('[data-testid="client-documents-tab"]').click();
      cy.get('[data-testid="download-document-button"]').first().click();
      
      // Check if download started
      cy.readFile('cypress/downloads/document.pdf').should('exist');
    });
  });

  describe('Client Analytics', () => {
    it('should display client statistics', () => {
      cy.visit('/clients/analytics');
      cy.get('[data-testid="analytics-page"]').should('be.visible');
      
      cy.get('[data-testid="total-clients"]').should('be.visible');
      cy.get('[data-testid="active-clients"]').should('be.visible');
      cy.get('[data-testid="conversion-rate"]').should('be.visible');
      cy.get('[data-testid="client-growth-chart"]').should('be.visible');
    });

    it('should filter analytics by date range', () => {
      cy.visit('/clients/analytics');
      cy.get('[data-testid="date-range-selector"]').click();
      cy.get('[data-testid="option-last-30-days"]').click();
      
      cy.get('[data-testid="analytics-data"]').should('be.visible');
    });

    it('should show client industry breakdown', () => {
      cy.visit('/clients/analytics');
      cy.get('[data-testid="industry-breakdown-tab"]').click();
      cy.get('[data-testid="industry-chart"]').should('be.visible');
    });
  });

  describe('Client Import/Export', () => {
    it('should import clients from CSV', () => {
      cy.visit('/clients');
      cy.get('[data-testid="import-clients-button"]').click();
      cy.get('[data-testid="import-modal"]').should('be.visible');
      cy.get('[data-testid="csv-file-input"]').attachFile('clients-import.csv');
      cy.get('[data-testid="import-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Clients imported successfully');
    });

    it('should export clients to CSV', () => {
      cy.visit('/clients');
      cy.get('[data-testid="export-clients-button"]').click();
      cy.get('[data-testid="export-modal"]').should('be.visible');
      cy.get('[data-testid="export-button"]').click();
      
      // Check if download started
      cy.readFile('cypress/downloads/clients.csv').should('exist');
    });
  });

  describe('Client Bulk Operations', () => {
    it('should select multiple clients', () => {
      cy.visit('/clients');
      cy.get('[data-testid="select-all-checkbox"]').click();
      cy.get('[data-testid="selected-count"]').should('contain', '3');
    });

    it('should bulk update client status', () => {
      cy.visit('/clients');
      cy.get('[data-testid="select-all-checkbox"]').click();
      cy.get('[data-testid="bulk-actions-button"]').click();
      cy.get('[data-testid="bulk-update-status"]').click();
      cy.get('[data-testid="status-selector"]').click();
      cy.get('[data-testid="option-active"]').click();
      cy.get('[data-testid="apply-bulk-update-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Clients updated successfully');
    });

    it('should bulk delete clients', () => {
      cy.visit('/clients');
      cy.get('[data-testid="select-all-checkbox"]').click();
      cy.get('[data-testid="bulk-actions-button"]').click();
      cy.get('[data-testid="bulk-delete"]').click();
      cy.get('[data-testid="confirm-bulk-delete-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Clients deleted successfully');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile devices', () => {
      cy.viewport(375, 667);
      cy.visit('/clients');
      cy.get('[data-testid="clients-page"]').should('be.visible');
      cy.get('[data-testid="new-client-button"]').should('be.visible');
    });

    it('should work on tablet devices', () => {
      cy.viewport(768, 1024);
      cy.visit('/clients');
      cy.get('[data-testid="clients-page"]').should('be.visible');
      cy.get('[data-testid="clients-list"]').should('be.visible');
    });
  });
});
