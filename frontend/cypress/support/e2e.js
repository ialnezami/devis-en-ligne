// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global before hook to set up test environment
beforeEach(() => {
  // Clear localStorage and sessionStorage before each test
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Reset any mock data or state
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

// Global after hook for cleanup
afterEach(() => {
  // Take screenshot on failure
  if (Cypress.currentTest.state === 'failed') {
    cy.screenshot(`${Cypress.currentTest.title}--failed`);
  }
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // for uncaught exceptions that are not critical to the test
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection')) {
    return false;
  }
  return true;
});

// Custom error handling for network requests
Cypress.on('fail', (error) => {
  // Log additional information for debugging
  console.error('Test failed:', error);
  console.error('Current URL:', Cypress.config().baseUrl);
  console.error('Viewport:', Cypress.config().viewportWidth, 'x', Cypress.config().viewportHeight);
  throw error;
});
