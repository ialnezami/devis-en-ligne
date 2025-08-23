// Cypress Testing System Index
// This file exports all testing components for easy access

// Configuration
export { default as config } from './cypress.config.js';

// Support files
export { default as e2eSupport } from './support/e2e.js';
export { default as componentSupport } from './support/component.js';
export { default as commands } from './support/commands.js';

// Test specifications
export { default as authenticationTests } from './e2e/authentication.cy.js';
export { default as quoteManagementTests } from './e2e/quote-management.cy.js';
export { default as clientManagementTests } from './e2e/client-management.cy.js';
export { default as performanceTests } from './e2e/performance.cy.js';

// Test data fixtures
export { default as usersFixture } from './fixtures/users.json';
export { default as quotesFixture } from './fixtures/quotes.json';
export { default as clientsFixture } from './fixtures/clients.json';
export { default as largeQuotesFixture } from './fixtures/large-quotes.json';
export { default as clientsImportFixture } from './fixtures/clients-import.csv';

// Available test suites
export const testSuites = {
  authentication: 'cypress/e2e/authentication.cy.js',
  quoteManagement: 'cypress/e2e/quote-management.cy.js',
  clientManagement: 'cypress/e2e/client-management.cy.js',
  performance: 'cypress/e2e/performance.cy.js'
};

// Available fixtures
export const fixtures = {
  users: 'cypress/fixtures/users.json',
  quotes: 'cypress/fixtures/quotes.json',
  clients: 'cypress/fixtures/clients.json',
  largeQuotes: 'cypress/fixtures/large-quotes.json',
  clientsImport: 'cypress/fixtures/clients-import.csv'
};

// Custom commands reference
export const customCommands = {
  // Authentication
  login: 'cy.login(email, password)',
  loginAsAdmin: 'cy.loginAsAdmin()',
  logout: 'cy.logout()',
  
  // Data creation
  createQuote: 'cy.createQuote(quoteData)',
  createClient: 'cy.createClient(clientData)',
  
  // Utility
  waitForApi: 'cy.waitForApi(method, url)',
  shouldBeVisibleAndClickable: 'cy.shouldBeVisibleAndClickable(selector)',
  fillForm: 'cy.fillForm(formData)',
  selectOption: 'cy.selectOption(selector, option)',
  uploadFile: 'cy.uploadFile(selector, fileName)',
  shouldShowToast: 'cy.shouldShowToast(message, type)',
  navigateToSection: 'cy.navigateToSection(section)',
  waitForLoading: 'cy.waitForLoading()',
  checkResponsive: 'cy.checkResponsive()'
};

// Test categories and descriptions
export const testCategories = {
  authentication: {
    description: 'Authentication system testing including login, logout, registration, and access control',
    tests: [
      'Login Flow',
      'Logout Flow', 
      'Registration Flow',
      'Password Reset',
      'Access Control',
      'Form Validation',
      'Responsive Design'
    ]
  },
  quoteManagement: {
    description: 'Quote management system testing including creation, editing, status management, and analytics',
    tests: [
      'Quote Creation',
      'Quote Editing',
      'Status Management',
      'Search and Filtering',
      'Templates',
      'Export',
      'Sharing',
      'Analytics'
    ]
  },
  clientManagement: {
    description: 'Client management system testing including CRUD operations, documents, communication, and portal',
    tests: [
      'Client Creation',
      'Client Editing',
      'Search and Filtering',
      'Documents',
      'Communication',
      'Client Portal',
      'Analytics',
      'Import/Export',
      'Bulk Operations'
    ]
  },
  performance: {
    description: 'Performance testing including load times, API performance, memory usage, and browser metrics',
    tests: [
      'Page Load Performance',
      'API Response Performance',
      'Form Submission Performance',
      'Search Performance',
      'File Upload Performance',
      'Memory Usage',
      'Rendering Performance',
      'Network Performance',
      'Browser Performance Metrics'
    ]
  }
};

// Performance benchmarks
export const performanceBenchmarks = {
  pageLoad: {
    dashboard: '< 3 seconds',
    quotesPage: '< 3 seconds',
    clientsPage: '< 3 seconds'
  },
  apiResponse: {
    dataFetching: '< 500ms',
    formSubmission: '< 2 seconds',
    searchOperations: '< 1 second'
  },
  fileOperations: {
    smallFileUpload: '< 3 seconds',
    largeFileUpload: '< 10 seconds with progress'
  },
  memory: {
    memoryIncrease: '< 10MB after 5 navigation cycles'
  }
};

// Browser support matrix
export const browserSupport = {
  chrome: 'Full support',
  firefox: 'Full support',
  safari: 'Full support (macOS)',
  edge: 'Full support'
};

// Viewport configurations
export const viewports = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
};

// Environment configuration
export const environmentConfig = {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3001/api',
  testUsers: {
    regular: { email: 'test@example.com', password: 'testpassword123' },
    admin: { email: 'admin@example.com', password: 'adminpassword123' }
  }
};

// Available npm scripts
export const npmScripts = {
  cypressOpen: 'npm run cypress:open',
  cypressRun: 'npm run cypress:run',
  cypressRunHeadless: 'npm run cypress:run:headless',
  cypressRunChrome: 'npm run cypress:run:chrome',
  cypressRunFirefox: 'npm run cypress:run:firefox',
  cypressRunSafari: 'npm run cypress:run:safari',
  cypressRunEdge: 'npm run cypress:run:edge',
  testE2E: 'npm run test:e2e',
  testE2EOpen: 'npm run test:e2e:open'
};

export default {
  testSuites,
  fixtures,
  customCommands,
  testCategories,
  performanceBenchmarks,
  browserSupport,
  viewports,
  environmentConfig,
  npmScripts
};
