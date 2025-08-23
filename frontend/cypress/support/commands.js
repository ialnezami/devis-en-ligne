// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login a user
Cypress.Commands.add('login', (email = Cypress.env('testUser').email, password = Cypress.env('testUser').password) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('not.include', '/login');
  cy.get('[data-testid="user-menu"]').should('be.visible');
});

// Custom command to login as admin
Cypress.Commands.add('loginAsAdmin', () => {
  cy.login(Cypress.env('adminUser').email, Cypress.env('adminUser').password);
});

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Custom command to create a quote
Cypress.Commands.add('createQuote', (quoteData = {}) => {
  const defaultQuote = {
    clientName: 'Test Client',
    description: 'Test Quote Description',
    amount: '1000.00',
    validUntil: '2024-12-31'
  };
  
  const quote = { ...defaultQuote, ...quoteData };
  
  cy.visit('/quotes/new');
  cy.get('[data-testid="client-name-input"]').type(quote.clientName);
  cy.get('[data-testid="description-input"]').type(quote.description);
  cy.get('[data-testid="amount-input"]').type(quote.amount);
  cy.get('[data-testid="valid-until-input"]').type(quote.validUntil);
  cy.get('[data-testid="save-quote-button"]').click();
  
  cy.get('[data-testid="success-message"]').should('be.visible');
  cy.url().should('include', '/quotes/');
});

// Custom command to create a client
Cypress.Commands.add('createClient', (clientData = {}) => {
  const defaultClient = {
    name: 'Test Client',
    email: 'testclient@example.com',
    phone: '+1234567890',
    company: 'Test Company'
  };
  
  const client = { ...defaultClient, ...clientData };
  
  cy.visit('/clients/new');
  cy.get('[data-testid="client-name-input"]').type(client.name);
  cy.get('[data-testid="client-email-input"]').type(client.email);
  cy.get('[data-testid="client-phone-input"]').type(client.phone);
  cy.get('[data-testid="client-company-input"]').type(client.company);
  cy.get('[data-testid="save-client-button"]').click();
  
  cy.get('[data-testid="success-message"]').should('be.visible');
  cy.url().should('include', '/clients/');
});

// Custom command to wait for API requests to complete
Cypress.Commands.add('waitForApi', (method = 'GET', url = '**') => {
  cy.intercept(method, url).as('apiRequest');
  cy.wait('@apiRequest');
});

// Custom command to check if element is visible and clickable
Cypress.Commands.add('shouldBeVisibleAndClickable', (selector) => {
  cy.get(selector).should('be.visible').should('not.be.disabled');
});

// Custom command to fill form fields
Cypress.Commands.add('fillForm', (formData) => {
  Object.entries(formData).forEach(([field, value]) => {
    const selector = `[data-testid="${field}-input"]`;
    cy.get(selector).clear().type(value);
  });
});

// Custom command to select dropdown option
Cypress.Commands.add('selectOption', (dropdownSelector, optionText) => {
  cy.get(dropdownSelector).click();
  cy.get(`[data-testid="option-${optionText}"]`).click();
});

// Custom command to upload file
Cypress.Commands.add('uploadFile', (inputSelector, fileName, fileType = 'text/plain') => {
  cy.fixture(fileName).then(fileContent => {
    cy.get(inputSelector).attachFile({
      fileContent,
      fileName,
      mimeType: fileType
    });
  });
});

// Custom command to check toast notification
Cypress.Commands.add('shouldShowToast', (message, type = 'success') => {
  cy.get(`[data-testid="toast-${type}"]`).should('contain', message);
});

// Custom command to navigate to section
Cypress.Commands.add('navigateToSection', (sectionName) => {
  cy.get(`[data-testid="nav-${sectionName}"]`).click();
  cy.url().should('include', `/${sectionName}`);
});

// Custom command to wait for loading to complete
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading-spinner"]').should('not.exist');
});

// Custom command to check responsive design
Cypress.Commands.add('checkResponsive', () => {
  const viewports = [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' }
  ];
  
  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height);
    cy.get('body').should('be.visible');
  });
});

// Override visit command to add custom logic
Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  // Add custom headers if needed
  const customOptions = {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...options?.headers
    }
  };
  
  return originalFn(url, customOptions);
});
