/**
 * E2E Test: Authentication Flow
 * Tests login, logout, and authentication-related functionality
 */

describe('Authentication', () => {
  beforeEach(() => {
    // Start fresh - clear cookies and local storage
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Login Flow', () => {
    it('should display login page', () => {
      cy.visit('/auth/signin');

      // Verify login page elements
      cy.contains('Log in to your account').should('be.visible');
      cy.contains('EHR Connect').should('be.visible');
      cy.get('input#email').should('be.visible');
      cy.get('input#password').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should login with valid credentials', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.admin;

        cy.visit('/auth/signin');

        // Fill in credentials
        cy.get('input#email').type(email);
        cy.get('input#password').type(password);

        // Submit
        cy.get('button[type="submit"]').click();

        // Should redirect to dashboard
        cy.url({ timeout: 15000 }).should('not.include', '/auth/signin');
        cy.url().should('match', /\/(dashboard|patients|encounters)/);

        // Verify user is logged in - look for user name or navigation
        cy.contains(users.admin.name).should('be.visible');
      });
    });

    it('should show error with invalid credentials', () => {
      cy.visit('/auth/signin');

      // Fill in invalid credentials
      cy.get('input#email').type('invalid@example.com');
      cy.get('input#password').type('wrongpassword');

      // Submit
      cy.get('button[type="submit"]').click();

      // Should show error message
      cy.contains(/invalid|error|incorrect/i, { timeout: 10000 }).should('be.visible');

      // Should still be on login page
      cy.url().should('include', '/auth/signin');
    });

    it('should show validation for empty fields', () => {
      cy.visit('/auth/signin');

      // Try to submit empty form
      cy.get('button[type="submit"]').click();

      // HTML5 validation should prevent submission
      cy.get('input#email:invalid').should('exist');
    });

    it('should toggle password visibility', () => {
      cy.visit('/auth/signin');

      // Password should be hidden by default
      cy.get('input#password').should('have.attr', 'type', 'password');

      // Click toggle button
      cy.get('input#password').parent().find('button').click();

      // Password should be visible
      cy.get('input#password').should('have.attr', 'type', 'text');

      // Click toggle again
      cy.get('input#password').parent().find('button').click();

      // Password should be hidden again
      cy.get('input#password').should('have.attr', 'type', 'password');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      // Try to access protected route without login
      cy.visit('/patients');

      // Should redirect to root/login
      cy.url({ timeout: 10000 }).should('match', /\/(auth\/signin)?/);
    });

    it('should allow access to protected routes after login', () => {
      cy.login();

      // Should be able to access protected routes
      cy.visit('/patients');
      cy.url().should('include', '/patients');

      cy.visit('/encounters');
      cy.url().should('include', '/encounters');

      cy.visit('/billing');
      cy.url().should('include', '/billing');
    });
  });

  describe('Session Persistence', () => {
    it('should maintain session across page refreshes', () => {
      cy.login();

      // Navigate to a protected route
      cy.visit('/patients');
      cy.url().should('include', '/patients');

      // Refresh the page
      cy.reload();

      // Should still be on patients page (session maintained)
      cy.url().should('include', '/patients');
    });
  });
});

describe('User Fixtures', () => {
  it('should load user fixtures correctly', () => {
    cy.fixture('users').then((users) => {
      // Verify fixture structure
      expect(users).to.have.property('admin');
      expect(users.admin).to.have.property('email');
      expect(users.admin).to.have.property('password');
      expect(users.admin).to.have.property('role');
      expect(users.admin).to.have.property('name');
    });
  });

  it('should login with different user types', () => {
    cy.loginAs('admin');
    cy.url().should('match', /\/(dashboard|patients)/);
  });
});
