describe('Authentication System', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Login Flow', () => {
    it('should display login form for unauthenticated users', () => {
      cy.visit('/login');
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="email-input"]').should('be.visible');
      cy.get('[data-testid="password-input"]').should('be.visible');
      cy.get('[data-testid="login-button"]').should('be.visible');
    });

    it('should successfully login with valid credentials', () => {
      cy.login();
      cy.url().should('not.include', '/login');
      cy.get('[data-testid="user-menu"]').should('be.visible');
      cy.get('[data-testid="dashboard"]').should('be.visible');
    });

    it('should show error message for invalid credentials', () => {
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type('invalid@example.com');
      cy.get('[data-testid="password-input"]').type('wrongpassword');
      cy.get('[data-testid="login-button"]').click();
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
    });

    it('should show error message for empty fields', () => {
      cy.visit('/login');
      cy.get('[data-testid="login-button"]').click();
      cy.get('[data-testid="email-error"]').should('be.visible');
      cy.get('[data-testid="password-error"]').should('be.visible');
    });

    it('should remember user session after page refresh', () => {
      cy.login();
      cy.reload();
      cy.get('[data-testid="user-menu"]').should('be.visible');
      cy.url().should('not.include', '/login');
    });
  });

  describe('Logout Flow', () => {
    it('should successfully logout user', () => {
      cy.login();
      cy.logout();
      cy.url().should('include', '/login');
      cy.get('[data-testid="login-form"]').should('be.visible');
    });

    it('should redirect to login after logout', () => {
      cy.login();
      cy.logout();
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
    });
  });

  describe('Registration Flow', () => {
    it('should display registration form', () => {
      cy.visit('/register');
      cy.get('[data-testid="register-form"]').should('be.visible');
      cy.get('[data-testid="firstName-input"]').should('be.visible');
      cy.get('[data-testid="lastName-input"]').should('be.visible');
      cy.get('[data-testid="email-input"]').should('be.visible');
      cy.get('[data-testid="password-input"]').should('be.visible');
      cy.get('[data-testid="confirmPassword-input"]').should('be.visible');
      cy.get('[data-testid="register-button"]').should('be.visible');
    });

    it('should successfully register new user', () => {
      cy.visit('/register');
      const testEmail = `test${Date.now()}@example.com`;
      
      cy.get('[data-testid="firstName-input"]').type('New');
      cy.get('[data-testid="lastName-input"]').type('User');
      cy.get('[data-testid="email-input"]').type(testEmail);
      cy.get('[data-testid="password-input"]').type('newpassword123');
      cy.get('[data-testid="confirmPassword-input"]').type('newpassword123');
      cy.get('[data-testid="register-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.url().should('include', '/dashboard');
    });

    it('should show error for password mismatch', () => {
      cy.visit('/register');
      cy.get('[data-testid="firstName-input"]').type('New');
      cy.get('[data-testid="lastName-input"]').type('User');
      cy.get('[data-testid="email-input"]').type('newuser@example.com');
      cy.get('[data-testid="password-input"]').type('newpassword123');
      cy.get('[data-testid="confirmPassword-input"]').type('differentpassword');
      cy.get('[data-testid="register-button"]').click();
      
      cy.get('[data-testid="confirmPassword-error"]').should('be.visible');
      cy.get('[data-testid="confirmPassword-error"]').should('contain', 'Passwords do not match');
    });
  });

  describe('Password Reset', () => {
    it('should display password reset form', () => {
      cy.visit('/forgot-password');
      cy.get('[data-testid="forgot-password-form"]').should('be.visible');
      cy.get('[data-testid="email-input"]').should('be.visible');
      cy.get('[data-testid="reset-button"]').should('be.visible');
    });

    it('should send password reset email', () => {
      cy.visit('/forgot-password');
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="reset-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Password reset email sent');
    });
  });

  describe('Access Control', () => {
    it('should redirect unauthenticated users to login', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
      
      cy.visit('/quotes');
      cy.url().should('include', '/login');
      
      cy.visit('/clients');
      cy.url().should('include', '/login');
    });

    it('should allow authenticated users to access protected routes', () => {
      cy.login();
      cy.visit('/dashboard');
      cy.get('[data-testid="dashboard"]').should('be.visible');
      
      cy.visit('/quotes');
      cy.get('[data-testid="quotes-page"]').should('be.visible');
      
      cy.visit('/clients');
      cy.get('[data-testid="clients-page"]').should('be.visible');
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type('invalid-email');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="login-button"]').click();
      
      cy.get('[data-testid="email-error"]').should('be.visible');
      cy.get('[data-testid="email-error"]').should('contain', 'Invalid email format');
    });

    it('should validate password strength', () => {
      cy.visit('/register');
      cy.get('[data-testid="firstName-input"]').type('Test');
      cy.get('[data-testid="lastName-input"]').type('User');
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="password-input"]').type('weak');
      cy.get('[data-testid="confirmPassword-input"]').type('weak');
      cy.get('[data-testid="register-button"]').click();
      
      cy.get('[data-testid="password-error"]').should('be.visible');
      cy.get('[data-testid="password-error"]').should('contain', 'Password must be at least 8 characters');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile devices', () => {
      cy.viewport(375, 667);
      cy.visit('/login');
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="email-input"]').should('be.visible');
      cy.get('[data-testid="password-input"]').should('be.visible');
      cy.get('[data-testid="login-button"]').should('be.visible');
    });

    it('should work on tablet devices', () => {
      cy.viewport(768, 1024);
      cy.visit('/login');
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="email-input"]').should('be.visible');
      cy.get('[data-testid="password-input"]').should('be.visible');
      cy.get('[data-testid="login-button"]').should('be.visible');
    });
  });
});
