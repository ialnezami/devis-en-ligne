describe('Performance Testing', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Page Load Performance', () => {
    it('should load dashboard within acceptable time', () => {
      const startTime = Date.now();
      
      cy.visit('/dashboard', { timeout: 10000 });
      
      cy.get('[data-testid="dashboard"]').should('be.visible');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).to.be.lessThan(3000); // Should load within 3 seconds
    });

    it('should load quotes page within acceptable time', () => {
      const startTime = Date.now();
      
      cy.visit('/quotes', { timeout: 10000 });
      
      cy.get('[data-testid="quotes-page"]').should('be.visible');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).to.be.lessThan(3000);
    });

    it('should load clients page within acceptable time', () => {
      const startTime = Date.now();
      
      cy.visit('/clients', { timeout: 10000 });
      
      cy.get('[data-testid="clients-page"]').should('be.visible');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).to.be.lessThan(3000);
    });
  });

  describe('API Response Performance', () => {
    it('should fetch quotes data within acceptable time', () => {
      cy.intercept('GET', '/api/quotes').as('getQuotes');
      
      cy.visit('/quotes');
      cy.wait('@getQuotes').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body).to.have.property('data');
        
        // Check response time
        const responseTime = interception.response.headers['x-response-time'];
        if (responseTime) {
          const timeInMs = parseInt(responseTime);
          expect(timeInMs).to.be.lessThan(500); // Should respond within 500ms
        }
      });
    });

    it('should fetch clients data within acceptable time', () => {
      cy.intercept('GET', '/api/clients').as('getClients');
      
      cy.visit('/clients');
      cy.wait('@getClients').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body).to.have.property('data');
        
        // Check response time
        const responseTime = interception.response.headers['x-response-time'];
        if (responseTime) {
          const timeInMs = parseInt(responseTime);
          expect(timeInMs).to.be.lessThan(500);
        }
      });
    });

    it('should handle large datasets efficiently', () => {
      // Mock large dataset
      cy.intercept('GET', '/api/quotes', { fixture: 'large-quotes.json' }).as('getLargeQuotes');
      
      cy.visit('/quotes');
      cy.wait('@getLargeQuotes');
      
      // Should render without significant delay
      cy.get('[data-testid="quotes-list"]').should('be.visible');
      
      // Check if pagination is working
      cy.get('[data-testid="pagination"]').should('be.visible');
    });
  });

  describe('Form Submission Performance', () => {
    it('should submit quote form within acceptable time', () => {
      cy.intercept('POST', '/api/quotes').as('createQuote');
      
      cy.visit('/quotes/new');
      
      // Fill form quickly
      cy.get('[data-testid="client-name-input"]').type('Performance Test Client');
      cy.get('[data-testid="description-input"]').type('Performance Test Quote');
      cy.get('[data-testid="amount-input"]').type('1000.00');
      cy.get('[data-testid="valid-until-input"]').type('2024-12-31');
      
      const startTime = Date.now();
      cy.get('[data-testid="save-quote-button"]').click();
      
      cy.wait('@createQuote').then((interception) => {
        expect(interception.response.statusCode).to.equal(201);
        
        const submissionTime = Date.now() - startTime;
        expect(submissionTime).to.be.lessThan(2000); // Should submit within 2 seconds
      });
    });

    it('should submit client form within acceptable time', () => {
      cy.intercept('POST', '/api/clients').as('createClient');
      
      cy.visit('/clients/new');
      
      // Fill form quickly
      cy.get('[data-testid="client-name-input"]').type('Performance Test Client');
      cy.get('[data-testid="client-email-input"]').type('perf@test.com');
      cy.get('[data-testid="client-phone-input"]').type('+1234567890');
      
      const startTime = Date.now();
      cy.get('[data-testid="save-client-button"]').click();
      
      cy.wait('@createClient').then((interception) => {
        expect(interception.response.statusCode).to.equal(201);
        
        const submissionTime = Date.now() - startTime;
        expect(submissionTime).to.be.lessThan(2000);
      });
    });
  });

  describe('Search Performance', () => {
    it('should perform search within acceptable time', () => {
      cy.intercept('GET', '/api/quotes/search*').as('searchQuotes');
      
      cy.visit('/quotes');
      cy.get('[data-testid="search-input"]').type('test');
      
      const startTime = Date.now();
      cy.get('[data-testid="search-button"]').click();
      
      cy.wait('@searchQuotes').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        
        const searchTime = Date.now() - startTime;
        expect(searchTime).to.be.lessThan(1000); // Should search within 1 second
      });
    });

    it('should handle real-time search efficiently', () => {
      cy.intercept('GET', '/api/quotes/search*').as('realTimeSearch');
      
      cy.visit('/quotes');
      
      // Type slowly to test debouncing
      cy.get('[data-testid="search-input"]').type('a', { delay: 100 });
      cy.get('[data-testid="search-input"]').type('b', { delay: 100 });
      cy.get('[data-testid="search-input"]').type('c', { delay: 100 });
      
      // Should only make one API call after debouncing
      cy.wait('@realTimeSearch');
      cy.get('@realTimeSearch.all').should('have.length', 1);
    });
  });

  describe('File Upload Performance', () => {
    it('should upload small files efficiently', () => {
      cy.intercept('POST', '/api/documents/upload').as('uploadDocument');
      
      cy.visit('/clients/new');
      cy.get('[data-testid="document-file-input"]').attachFile('small-document.pdf');
      
      const startTime = Date.now();
      cy.get('[data-testid="upload-button"]').click();
      
      cy.wait('@uploadDocument').then((interception) => {
        expect(interception.response.statusCode).to.equal(201);
        
        const uploadTime = Date.now() - startTime;
        expect(uploadTime).to.be.lessThan(3000); // Should upload within 3 seconds
      });
    });

    it('should show upload progress for large files', () => {
      cy.intercept('POST', '/api/documents/upload', (req) => {
        req.reply({
          statusCode: 200,
          body: { success: true },
          delay: 2000 // Simulate slow upload
        });
      }).as('slowUpload');
      
      cy.visit('/clients/new');
      cy.get('[data-testid="document-file-input"]').attachFile('large-document.pdf');
      cy.get('[data-testid="upload-button"]').click();
      
      // Should show progress indicator
      cy.get('[data-testid="upload-progress"]').should('be.visible');
      
      cy.wait('@slowUpload');
      cy.get('[data-testid="upload-progress"]').should('not.exist');
    });
  });

  describe('Memory Usage', () => {
    it('should not have memory leaks during navigation', () => {
      // Get initial memory usage
      cy.window().then((win) => {
        const initialMemory = win.performance.memory?.usedJSHeapSize || 0;
        
        // Navigate between pages multiple times
        for (let i = 0; i < 5; i++) {
          cy.visit('/dashboard');
          cy.get('[data-testid="dashboard"]').should('be.visible');
          
          cy.visit('/quotes');
          cy.get('[data-testid="quotes-page"]').should('be.visible');
          
          cy.visit('/clients');
          cy.get('[data-testid="clients-page"]').should('be.visible');
        }
        
        // Check final memory usage
        cy.window().then((win) => {
          const finalMemory = win.performance.memory?.usedJSHeapSize || 0;
          const memoryIncrease = finalMemory - initialMemory;
          
          // Memory increase should be reasonable (less than 10MB)
          expect(memoryIncrease).to.be.lessThan(10 * 1024 * 1024);
        });
      });
    });
  });

  describe('Rendering Performance', () => {
    it('should render large lists efficiently', () => {
      // Mock large dataset
      cy.intercept('GET', '/api/quotes', { fixture: 'large-quotes.json' }).as('getLargeQuotes');
      
      cy.visit('/quotes');
      cy.wait('@getLargeQuotes');
      
      // Should render first page quickly
      cy.get('[data-testid="quotes-list"]').should('be.visible');
      
      // Check if virtual scrolling or pagination is implemented
      cy.get('[data-testid="pagination"]').should('be.visible');
    });

    it('should handle rapid state changes efficiently', () => {
      cy.visit('/quotes');
      
      // Rapidly change filters
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="status-filter"]').click();
        cy.get('[data-testid="option-draft"]').click();
        cy.get('[data-testid="status-filter"]').click();
        cy.get('[data-testid="option-sent"]').click();
      }
      
      // Should not crash or become unresponsive
      cy.get('[data-testid="quotes-page"]').should('be.visible');
    });
  });

  describe('Network Performance', () => {
    it('should handle slow network conditions gracefully', () => {
      // Simulate slow network
      cy.intercept('GET', '/api/quotes', (req) => {
        req.reply({
          statusCode: 200,
          body: { data: [] },
          delay: 3000 // 3 second delay
        });
      }).as('slowQuotes');
      
      cy.visit('/quotes');
      
      // Should show loading state
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      
      cy.wait('@slowQuotes');
      
      // Should hide loading state
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
    });

    it('should handle network errors gracefully', () => {
      // Simulate network error
      cy.intercept('GET', '/api/quotes', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/quotes');
      
      cy.wait('@networkError');
      
      // Should show error message
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });
  });

  describe('Browser Performance Metrics', () => {
    it('should maintain good Core Web Vitals', () => {
      cy.visit('/dashboard');
      
      // Check if page loads without layout shifts
      cy.get('[data-testid="dashboard"]').should('be.visible');
      
      // Check if images have proper dimensions to prevent layout shifts
      cy.get('img').each(($img) => {
        const width = $img[0].naturalWidth;
        const height = $img[0].naturalHeight;
        expect(width).to.be.greaterThan(0);
        expect(height).to.be.greaterThan(0);
      });
    });

    it('should have efficient DOM manipulation', () => {
      cy.visit('/quotes');
      
      // Count initial DOM nodes
      cy.get('body').then(($body) => {
        const initialNodeCount = $body[0].querySelectorAll('*').length;
        
        // Perform some actions
        cy.get('[data-testid="search-input"]').type('test');
        cy.get('[data-testid="search-button"]').click();
        
        // Count final DOM nodes
        cy.get('body').then(($body) => {
          const finalNodeCount = $body[0].querySelectorAll('*').length;
          
          // DOM node increase should be reasonable
          const nodeIncrease = finalNodeCount - initialNodeCount;
          expect(nodeIncrease).to.be.lessThan(100);
        });
      });
    });
  });
});
