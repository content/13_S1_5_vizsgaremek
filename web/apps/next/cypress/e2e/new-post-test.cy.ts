describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  });

  it('course', function() {
    cy.visit('http://localhost:3000/login')
    
    cy.get('#email').click();
    cy.get('#email').type('adamvad@gmail.com');
    cy.get('#password').type('qweQWE123!');
    cy.get('button.w-full').click();
    cy.get('a[href="/dashboard/3"]').click();

    cy.get('button').contains('Új poszt').click();
    cy.get('#post-name').type('Cypress teszt poszt');
    cy.get('#post-content').type('Cypress teszt poszt content content content content content content content content content content content content content');
    cy.get('button').contains('Tovább').click();
    cy.contains('div', 'Choose File(s)').click({ force: true })
      cy.get('input[type="file"]', { timeout: 5000 }).selectFile('cypress/fixtures/images.jpg', { force: true })    
      cy.contains('button', 'Upload 1 file', { timeout: 30000 }).should('be.visible').click({ force: true })
      cy.wait(4000);
      cy.get('button').contains('Létrehozás').click();
      })
  });