const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.{js,jsx,ts,tsx}',
    fixturesFolder: 'cypress/fixtures',
    downloadsFolder: 'cypress/downloads',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    env: {
      // Environment variables for testing
      apiUrl: 'http://localhost:3001/api',
      testUser: {
        email: 'test@example.com',
        password: 'testpassword123'
      },
      adminUser: {
        email: 'admin@example.com',
        password: 'adminpassword123'
      }
    }
  },
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.{js,jsx,ts,tsx}',
  },
});
