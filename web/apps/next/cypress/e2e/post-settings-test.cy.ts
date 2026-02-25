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
    cy.get('button').contains('Beállítások').click();
    cy.get('button').contains('Megjelenés').click();
    cy.get('button').contains('Tagok').click();   
    cy.get('button').contains('Általános').click();
    cy.get('button[role="switch"]').click({ multiple: true });
    cy.get('button').contains('Mentés').click();
  })
});