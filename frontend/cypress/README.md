# Cypress End-to-End Testing System

This directory contains the comprehensive end-to-end testing suite for the Quote Management System using Cypress.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Frontend application running on `http://localhost:3000`
- Backend API running on `http://localhost:3001`

### Installation
```bash
# Install Cypress and dependencies
npm install cypress start-server-and-test --save-dev

# Open Cypress Test Runner
npm run cypress:open

# Run tests in headless mode
npm run cypress:run

# Run tests with specific browser
npm run cypress:run:chrome
npm run cypress:run:firefox
npm run cypress:run:safari
npm run cypress:run:edge
```

## 📁 Directory Structure

```
cypress/
├── e2e/                    # E2E test specifications
│   ├── authentication.cy.js    # Authentication system tests
│   ├── quote-management.cy.js  # Quote management tests
│   ├── client-management.cy.js # Client management tests
│   └── performance.cy.js       # Performance tests
├── fixtures/              # Test data files
│   ├── users.json            # User test data
│   ├── quotes.json           # Quote test data
│   ├── clients.json          # Client test data
│   ├── large-quotes.json     # Large dataset for performance
│   └── clients-import.csv    # CSV import test data
├── support/               # Support files and custom commands
│   ├── e2e.js               # E2E support configuration
│   ├── component.js          # Component testing support
│   └── commands.js           # Custom Cypress commands
└── cypress.config.js      # Cypress configuration
```

## 🧪 Test Categories

### 1. Authentication System (`authentication.cy.js`)
- **Login Flow**: Form display, valid credentials, invalid credentials, validation
- **Logout Flow**: Successful logout, redirect handling
- **Registration Flow**: Form display, user creation, validation
- **Password Reset**: Form display, email sending
- **Access Control**: Route protection, authenticated access
- **Form Validation**: Email format, password strength
- **Responsive Design**: Mobile and tablet compatibility

### 2. Quote Management (`quote-management.cy.js`)
- **Quote Creation**: Form filling, validation, automatic calculations
- **Quote Editing**: Update existing quotes, add items
- **Status Management**: Draft → Sent → Approved/Rejected workflow
- **Search & Filtering**: Client name, status, date range filtering
- **Templates**: Create from template, save as template
- **Export**: PDF and CSV export functionality
- **Sharing**: Email sharing, shareable links
- **Analytics**: Statistics, trends, date filtering

### 3. Client Management (`client-management.cy.js`)
- **Client Creation**: Form filling, validation, address handling
- **Client Editing**: Update information, status changes
- **Search & Filtering**: Name, status, industry, date filtering
- **Documents**: Upload, view, delete, categorization
- **Communication**: Log interactions, schedule follow-ups
- **Client Portal**: Authentication, quote viewing, document access
- **Analytics**: Statistics, growth charts, industry breakdown
- **Import/Export**: CSV import/export functionality
- **Bulk Operations**: Multi-select, bulk updates, bulk deletion

### 4. Performance Testing (`performance.cy.js`)
- **Page Load Performance**: Dashboard, quotes, clients page load times
- **API Response Performance**: Response times, large dataset handling
- **Form Submission Performance**: Quote and client form submission times
- **Search Performance**: Search response times, real-time search efficiency
- **File Upload Performance**: Small/large file handling, progress indicators
- **Memory Usage**: Memory leak detection during navigation
- **Rendering Performance**: Large list rendering, rapid state changes
- **Network Performance**: Slow network handling, error handling
- **Browser Metrics**: Core Web Vitals, DOM manipulation efficiency

## 🛠️ Custom Commands

### Authentication Commands
```javascript
cy.login(email, password)           // Login with credentials
cy.loginAsAdmin()                   // Login as admin user
cy.logout()                         // Logout current user
```

### Data Creation Commands
```javascript
cy.createQuote(quoteData)           // Create a new quote
cy.createClient(clientData)         // Create a new client
```

### Utility Commands
```javascript
cy.waitForApi(method, url)          // Wait for API request completion
cy.shouldBeVisibleAndClickable(selector) // Check element visibility and clickability
cy.fillForm(formData)               // Fill form fields with data
cy.selectOption(selector, option)   // Select dropdown option
cy.uploadFile(selector, fileName)   // Upload file to input
cy.shouldShowToast(message, type)   // Check toast notification
cy.navigateToSection(section)       // Navigate to specific section
cy.waitForLoading()                 // Wait for loading to complete
cy.checkResponsive()                // Test responsive design
```

## 🔧 Configuration

### Environment Variables
```javascript
// cypress.config.js
env: {
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
```

### Browser Support
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (macOS)
- **Edge**: Full support

### Viewport Testing
- **Desktop**: 1920x1080
- **Tablet**: 768x1024
- **Mobile**: 375x667

## 📊 Test Data Management

### Fixtures
- **Static Data**: Users, quotes, clients with predefined values
- **Dynamic Data**: Large datasets for performance testing
- **Import Data**: CSV files for testing import functionality

### Data Cleanup
- Automatic cleanup between tests
- Local storage and session storage clearing
- Cookie management

## 🚦 Running Tests

### Development Mode
```bash
# Open Cypress Test Runner (interactive)
npm run cypress:open

# Run specific test file
npx cypress run --spec "cypress/e2e/authentication.cy.js"
```

### CI/CD Mode
```bash
# Run all tests headless
npm run cypress:run:headless

# Run with specific browser
npm run cypress:run:chrome

# Run with server start
npm run test:e2e
```

### Parallel Execution
```bash
# Run tests in parallel (requires Cypress Cloud)
npx cypress run --parallel --record --key YOUR_RECORD_KEY
```

## 📈 Performance Benchmarks

### Page Load Times
- **Dashboard**: < 3 seconds
- **Quotes Page**: < 3 seconds
- **Clients Page**: < 3 seconds

### API Response Times
- **Data Fetching**: < 500ms
- **Form Submission**: < 2 seconds
- **Search Operations**: < 1 second

### File Operations
- **Small File Upload**: < 3 seconds
- **Large File Upload**: < 10 seconds with progress

### Memory Usage
- **Memory Increase**: < 10MB after 5 navigation cycles

## 🐛 Debugging

### Test Failures
- Automatic screenshots on failure
- Video recording (configurable)
- Detailed error logging
- Network request interception

### Common Issues
- **Element Not Found**: Check `data-testid` attributes
- **Timing Issues**: Adjust timeouts or add explicit waits
- **Network Errors**: Verify API endpoints and mock data

### Debug Commands
```javascript
cy.pause()                    // Pause test execution
cy.debug()                    // Open browser dev tools
cy.log('Debug message')       // Log to Cypress console
```

## 🔒 Security Testing

### Authentication
- Route protection testing
- Session management
- Permission validation

### Data Validation
- Input sanitization
- XSS prevention
- CSRF protection

### API Security
- Endpoint access control
- Data exposure prevention
- Rate limiting

## 📱 Cross-Browser Testing

### Browser-Specific Tests
- CSS compatibility
- JavaScript feature support
- Performance variations

### Mobile Testing
- Touch interactions
- Responsive design
- Performance on mobile devices

## 🚀 Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### Data Management
- Use fixtures for test data
- Clean up data between tests
- Avoid hardcoded values

### Performance
- Mock external dependencies
- Use efficient selectors
- Minimize API calls during tests

### Maintainability
- Keep tests independent
- Use custom commands for common operations
- Document complex test scenarios

## 📚 Additional Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress API Reference](https://docs.cypress.io/api/api/table-of-contents)
- [Cypress Examples](https://github.com/cypress-io/cypress-example-recipes)

## 🤝 Contributing

### Adding New Tests
1. Create test file in appropriate directory
2. Follow naming convention: `feature-name.cy.js`
3. Add test data to fixtures if needed
4. Update documentation

### Test Data Updates
1. Modify fixture files as needed
2. Ensure data consistency across tests
3. Update related test assertions

### Custom Commands
1. Add commands to `commands.js`
2. Document command usage
3. Include examples in documentation

## 📞 Support

For questions, issues, or contributions:
- Check existing documentation
- Review test examples
- Contact the development team
- Submit issues through project repository
